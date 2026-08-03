import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "./db";

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
          `SELECT id, nick, email, password_hash, role, profile_type, email_verified_at
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

        return {
          id: String(user.id),
          name: user.nick,
          email: user.email,
          role: user.role,
          profileType: user.profile_type,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nick = user.name;
        token.role = user.role;
        token.profileType = user.profileType;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.nick = token.nick;
      session.user.role = token.role;
      session.user.profileType = token.profileType;
      return session;
    },
  },
};
