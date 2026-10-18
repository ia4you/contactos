import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "./db";
import { cumpleRequisitoAvatar } from "./fotosPerfil";

// Next resuelve el default del paquete CommonJS; Node a pelo (los tests de
// test/admin-cuentas.test.mjs) lo deja en .default.
const CredentialsProvider = Credentials.default ?? Credentials;

// Cada cuánto vuelve el callback jwt a comprobar en BD que la cuenta sigue
// activa y que session_version no ha cambiado (suspensión, borrado o cambio
// de contraseña invalidan todas las sesiones abiertas).
export const REVISION_SESION_MS = 60_000;

export const MENSAJE_SUSPENDIDA =
  "Tu cuenta está suspendida. Escribe a jose@turel.es si crees que es un error.";

// true si el token puede seguir usándose con la fila actual de users.
// Los tokens emitidos antes de existir session_version no llevan `sv` y
// cuentan como versión 0 (la de todas las cuentas tras la migración).
export function sesionVigente(fila, token) {
  if (!fila || fila.deleted_at || fila.suspended_at) return false;
  return fila.session_version === (token.sv ?? 0);
}

async function revisarSesion(token) {
  const { rows } = await query(
    `SELECT session_version, deleted_at, suspended_at FROM users WHERE id = $1`,
    [token.id]
  );
  return sesionVigente(rows[0], token);
}

export const authOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { rows } = await query(
          `SELECT id, nick, email, password_hash, role, profile_type, email_verified_at,
                  suspended_at, session_version
             FROM users
            WHERE email = $1 AND deleted_at IS NULL`,
          [credentials.email.toLowerCase().trim()]
        );
        const user = rows[0];
        if (!user) return null;

        // Sin email verificado no se puede iniciar sesión.
        if (!user.email_verified_at) return null;

        const valido = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valido) return null;

        // Solo tras comprobar la contraseña, para no revelar a terceros qué
        // emails corresponden a cuentas suspendidas. signIn() recibe este
        // texto como `error`.
        if (user.suspended_at) throw new Error(MENSAJE_SUSPENDIDA);

        return {
          id: String(user.id),
          name: user.nick,
          email: user.email,
          role: user.role,
          profileType: user.profile_type,
          sessionVersion: user.session_version,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.nick = user.name;
        token.role = user.role;
        token.profileType = user.profileType;
        token.sv = user.sessionVersion;
        token.revisadoEn = Date.now();
      } else if (token.id && !(token.revisadoEn > Date.now() - REVISION_SESION_MS)) {
        // Si la BD falla se mantiene la sesión: mejor que echar a todo el mundo.
        const vigente = await revisarSesion(token).catch(() => true);
        // null invalida la sesión: next-auth borra la cookie y
        // getServerSession() devuelve null (las API responden 401).
        if (!vigente) return null;
        token.revisadoEn = Date.now();
      }
      // Tras un cambio de nick (PATCH /api/ajustes/nick), el cliente llama a
      // useSession().update({ nick }) para refrescar el JWT sin forzar un
      // logout/login.
      if (trigger === "update" && session?.nick) {
        token.nick = session.nick;
      }
      // Gate de avatar (solo cuentas posteriores a FECHA_CORTE_AVATAR): middleware.js (edge, sin acceso a BD) lee este claim.
      // Mientras no sea true se re-comprueba en BD en cada lectura de sesión,
      // así se autocorrige tras subir la foto; con true no hay coste extra
      // (tras la política actual un avatar approved no se puede perder).
      // Si la BD falla se conserva el valor anterior (undefined = no bloquea).
      if (token.id && (user || trigger === "update" || token.tieneAvatar !== true)) {
        token.tieneAvatar = await cumpleRequisitoAvatar({ query }, token.id).catch(() => token.tieneAvatar);
      }
      return token;
    },
    async session({ session, token }) {
      // Token invalidado en el callback jwt: sesión vacía (sin usuario).
      if (!token?.id) return {};
      session.user.id = token.id;
      session.user.nick = token.nick;
      session.user.role = token.role;
      session.user.profileType = token.profileType;

      // getServerSession() se llama en cada page.js protegido, así que este
      // callback es el punto central más simple para registrar actividad
      // sin depender de middleware (que corre en Edge runtime y no admite
      // conexiones TCP de `pg`).
      query(`UPDATE users SET last_active = now() WHERE id = $1`, [token.id]).catch(() => {});

      return session;
    },
  },
};
