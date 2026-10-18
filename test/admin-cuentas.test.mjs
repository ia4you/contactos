// Suspender, reactivar y eliminar cuentas, sesiones (S1) y purga (P3).
//
// Los tests con BD solo corren con TEST_DATABASE_URL apuntando a un Postgres
// LOCAL (127.0.0.1 / localhost), p. ej. contactos-rediseno-db:
//   TEST_DATABASE_URL=postgresql://contactos:local@127.0.0.1:55432/contactos npm test
// Sin esa variable se saltan; nunca deben lanzarse contra producción.
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const URL_TEST = process.env.TEST_DATABASE_URL;
const local = URL_TEST && ["127.0.0.1", "localhost"].includes(new URL(URL_TEST).hostname);
if (local) process.env.DATABASE_URL = URL_TEST;
process.env.NEXTAUTH_SECRET ||= "test-secret";

const { sesionVigente, authOptions, MENSAJE_SUSPENDIDA } = await import("../lib/auth.js");

test("sesionVigente: versión, suspensión y borrado", () => {
  const fila = { session_version: 2, deleted_at: null, suspended_at: null };
  assert.equal(sesionVigente(fila, { sv: 2 }), true);
  assert.equal(sesionVigente(fila, { sv: 1 }), false);
  assert.equal(sesionVigente({ ...fila, session_version: 0 }, {}), true, "token antiguo sin sv = versión 0");
  assert.equal(sesionVigente({ ...fila, suspended_at: new Date() }, { sv: 2 }), false);
  assert.equal(sesionVigente({ ...fila, deleted_at: new Date() }, { sv: 2 }), false);
  assert.equal(sesionVigente(undefined, { sv: 0 }), false, "cuenta que ya no existe");
});

const conBD = { skip: local ? false : "sin TEST_DATABASE_URL local" };
const PREFIJO = "tst_admin_";
let db;
let suspenderCuenta, reactivarCuenta, eliminarCuentaDefinitivamente, purgarAutoEliminadas;
let adminId;
let hash;
let cwdOriginal;
let dirTmp;

async function crearUsuario(sufijo, extra = {}) {
  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash, nick, profile_type, island, gdpr_consent_at, email_verified_at, role)
     VALUES ($1, $2, $3, 'chica', 'gran_canaria', now(), now(), $4) RETURNING id, nick`,
    [`${PREFIJO}${sufijo}@test.local`, hash, `${PREFIJO}${sufijo}`, extra.role || "user"]
  );
  return rows[0];
}

const authorize = (email) =>
  (authOptions.providers[0].options?.authorize ?? authOptions.providers[0].authorize)({ email, password: "Test1234!" });

async function tokenDeLogin(email) {
  const user = await authorize(email);
  return authOptions.callbacks.jwt({ token: {}, user });
}
// Fuerza la comprobación en BD (como si hubiera pasado el minuto de caché).
const revisar = (token) => authOptions.callbacks.jwt({ token: { ...token, revisadoEn: 0 } });

before(async () => {
  if (!local) return;
  ({ pool: db } = await import("../lib/db.js"));
  ({ suspenderCuenta, reactivarCuenta, eliminarCuentaDefinitivamente } = await import("../lib/adminCuentas.js"));
  ({ purgarAutoEliminadas } = await import("../lib/borrarCuenta.js"));
  hash = await (await import("bcryptjs")).default.hash("Test1234!", 4);
  await db.query(`DELETE FROM users WHERE nick LIKE $1`, [`${PREFIJO}%`]);
  adminId = (await crearUsuario("jefa", { role: "admin" })).id;
  // borrarCuenta trabaja con process.cwd()/public/uploads: se usa un
  // directorio temporal para no tocar el del proyecto.
  cwdOriginal = process.cwd();
  dirTmp = await fs.mkdtemp(path.join(os.tmpdir(), "admin-cuentas-"));
  process.chdir(dirTmp);
});

after(async () => {
  if (!local) return;
  process.chdir(cwdOriginal);
  await fs.rm(dirTmp, { recursive: true, force: true });
  await db.query(`DELETE FROM users WHERE nick LIKE $1`, [`${PREFIJO}%`]);
  await db.end();
});

test("suspender invalida la sesión abierta y bloquea el login con mensaje claro", conBD, async () => {
  const u = await crearUsuario("suspendida");
  const token = await tokenDeLogin(`${u.nick}@test.local`);
  assert.ok(await revisar(token), "antes de suspender la sesión es válida");

  const r = await suspenderCuenta(db, { adminId, userId: u.id, motivo: "Acoso por mensajes" });
  assert.deepEqual(r, { ok: true });

  assert.equal(await revisar(token), null, "la sesión abierta deja de valer");
  assert.deepEqual(await authOptions.callbacks.session({ session: {}, token: null }), {});
  await assert.rejects(authorize(`${u.nick}@test.local`), { message: MENSAJE_SUSPENDIDA });

  const { rows } = await db.query(`SELECT suspended_reason, deleted_at FROM users WHERE id = $1`, [u.id]);
  assert.equal(rows[0].suspended_reason, "Acoso por mensajes");
  assert.equal(rows[0].deleted_at, null, "suspender no toca deleted_at");
});

test("reactivar permite volver a entrar; las sesiones de antes siguen cerradas", conBD, async () => {
  const u = await crearUsuario("reactivada");
  const tokenViejo = await tokenDeLogin(`${u.nick}@test.local`);
  await suspenderCuenta(db, { adminId, userId: u.id });
  assert.deepEqual(await reactivarCuenta(db, { adminId, userId: u.id }), { ok: true });

  const tokenNuevo = await tokenDeLogin(`${u.nick}@test.local`);
  assert.ok(await revisar(tokenNuevo), "el login nuevo funciona");
  assert.equal(await revisar(tokenViejo), null, "la sesión de antes de la suspensión no revive");
});

test("eliminar definitivamente borra datos y fotos y conserva la denuncia anonimizada", conBD, async () => {
  const u = await crearUsuario("borrada");
  const testigo = await crearUsuario("testigo");
  const dir = path.join(process.cwd(), "public", "uploads", String(u.id));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "foto.webp"), "x");
  const { rows: foto } = await db.query(
    `INSERT INTO photos (user_id, filename, status, is_avatar) VALUES ($1, 'foto.webp', 'approved', true) RETURNING id`,
    [u.id]
  );
  await db.query(`INSERT INTO publicaciones (user_id, tipo, contenido) VALUES ($1, 'texto', 'hola')`, [u.id]);
  await db.query(`INSERT INTO publicaciones (user_id, tipo, contenido, photo_id) VALUES ($1, 'foto', '', $2)`, [u.id, foto[0].id]);
  const { rows: denuncia } = await db.query(
    `INSERT INTO reports (reporter_id, reported_id, reason) VALUES ($1, $2, 'Spam') RETURNING id`,
    [testigo.id, u.id]
  );
  await suspenderCuenta(db, { adminId, userId: u.id });

  const mal = await eliminarCuentaDefinitivamente(db, { adminId, userId: u.id, confirmacionNick: "otro" });
  assert.equal(mal.status, 400, "sin el nick correcto no se borra");

  const r = await eliminarCuentaDefinitivamente(db, { adminId, userId: u.id, confirmacionNick: u.nick });
  assert.deepEqual(r, { ok: true });

  const cuenta = async (sql) => (await db.query(sql, [u.id])).rows[0].n;
  assert.equal(await cuenta(`SELECT count(*)::int AS n FROM users WHERE id = $1`), 0);
  assert.equal(await cuenta(`SELECT count(*)::int AS n FROM photos WHERE user_id = $1`), 0);
  assert.equal(await cuenta(`SELECT count(*)::int AS n FROM publicaciones WHERE user_id = $1`), 0);
  await assert.rejects(fs.access(dir), "la carpeta de fotos ya no existe");

  const { rows: rep } = await db.query(`SELECT reported_id, reported_constancia, reason FROM reports WHERE id = $1`, [denuncia[0].id]);
  assert.equal(rep[0].reported_id, null);
  assert.match(rep[0].reported_constancia, new RegExp(`^${u.nick} · cuenta eliminada el `));
  assert.equal(rep[0].reason, "Spam", "se conserva el motivo");

  const { rows: log } = await db.query(
    `SELECT admin_id, accion FROM admin_log WHERE nick_afectado = $1 ORDER BY id DESC LIMIT 1`,
    [u.nick]
  );
  assert.deepEqual(log[0], { admin_id: adminId, accion: "eliminar definitivamente" });
});

test("no se puede eliminar una cuenta activa, a otro admin ni a uno mismo", conBD, async () => {
  const activa = await crearUsuario("activa");
  const otroAdmin = await crearUsuario("admin2", { role: "admin" });

  const r1 = await eliminarCuentaDefinitivamente(db, { adminId, userId: activa.id, confirmacionNick: activa.nick });
  assert.equal(r1.status, 409);
  const r2 = await eliminarCuentaDefinitivamente(db, { adminId, userId: otroAdmin.id, confirmacionNick: otroAdmin.nick });
  assert.equal(r2.status, 400);
  const r3 = await eliminarCuentaDefinitivamente(db, { adminId, userId: adminId, confirmacionNick: `${PREFIJO}jefa` });
  assert.equal(r3.status, 400);
  assert.equal((await suspenderCuenta(db, { adminId, userId: otroAdmin.id })).status, 400, "tampoco suspender a un admin");

  const { rows } = await db.query(`SELECT count(*)::int AS n FROM users WHERE id = ANY($1)`, [[activa.id, otroAdmin.id, adminId]]);
  assert.equal(rows[0].n, 3);
});

test("la purga borra auto-eliminaciones de más de 30 días y nunca suspensiones", conBD, async () => {
  const vieja = await crearUsuario("purga_vieja");
  const reciente = await crearUsuario("purga_reciente");
  const suspendida = await crearUsuario("purga_suspendida");
  await db.query(`UPDATE users SET deleted_at = now() - interval '40 days' WHERE id = $1`, [vieja.id]);
  await db.query(`UPDATE users SET deleted_at = now() - interval '5 days' WHERE id = $1`, [reciente.id]);
  await db.query(`UPDATE users SET suspended_at = now() - interval '400 days' WHERE id = $1`, [suspendida.id]);

  await purgarAutoEliminadas(db, { log: () => {} });

  const { rows } = await db.query(`SELECT id FROM users WHERE id = ANY($1) ORDER BY id`, [[vieja.id, reciente.id, suspendida.id]]);
  assert.deepEqual(rows.map((r) => r.id), [reciente.id, suspendida.id].sort((a, b) => a - b));
});
