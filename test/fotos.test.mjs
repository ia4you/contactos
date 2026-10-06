// Ejecutar: npm test   (node --import ./test/register.mjs --test test/)
import test from "node:test";
import assert from "node:assert/strict";
import { fijarAvatar, borrarFoto, cumpleRequisitoAvatar } from "../lib/fotosPerfil.js";

// BD falsa mínima: interpreta solo las 3 sentencias que usa fotosPerfil.
function fakeDb(fotos) {
  const own = (id, u) => fotos.find((f) => f.id === id && f.user_id === u);
  return {
    fotos,
    async query(sql, [id, u]) {
      if (sql.includes("UPDATE photos")) {
        const ok = own(id, u)?.status === "approved";
        if (ok) fotos.filter((f) => f.user_id === u).forEach((f) => (f.is_avatar = f.id === id));
        return { rowCount: ok ? 1 : 0 };
      }
      if (sql.startsWith("SELECT")) return { rows: own(id, u) ? [own(id, u)] : [] };
      const f = own(id, u);
      const total = fotos.filter((x) => x.user_id === u).length;
      if (f && !f.is_avatar && total > 1) {
        fotos.splice(fotos.indexOf(f), 1);
        return { rows: [{ filename: f.filename }] };
      }
      return { rows: [] };
    },
  };
}
const base = () => [
  { id: 1, user_id: 1, filename: "a.webp", is_avatar: true, status: "approved" },
  { id: 2, user_id: 1, filename: "b.webp", is_avatar: false, status: "approved" },
  { id: 3, user_id: 1, filename: "c.webp", is_avatar: false, status: "pending" },
  { id: 9, user_id: 2, filename: "z.webp", is_avatar: true, status: "approved" },
];

test("borrar el avatar actual falla (409)", async () => {
  const db = fakeDb(base());
  assert.equal((await borrarFoto(db, 1, 1)).status, 409);
  assert.equal(db.fotos.length, 4);
});

test("borrar la última foto falla (409)", async () => {
  const db = fakeDb([{ id: 5, user_id: 1, filename: "x", is_avatar: false, status: "approved" }]);
  assert.equal((await borrarFoto(db, 1, 5)).status, 409);
});

test("borrar una foto normal funciona", async () => {
  const db = fakeDb(base());
  assert.equal((await borrarFoto(db, 1, 2)).filename, "b.webp");
});

test("sustituir avatar funciona y siempre queda exactamente uno", async () => {
  const db = fakeDb(base());
  assert.equal(await fijarAvatar(db, 1, "2"), true);
  assert.deepEqual(db.fotos.filter((f) => f.user_id === 1 && f.is_avatar).map((f) => f.id), [2]);
});

test("avatar de otro usuario falla y no cambia nada", async () => {
  const db = fakeDb(base());
  assert.equal(await fijarAvatar(db, 1, 9), false);
  assert.equal(db.fotos[0].is_avatar, true);
});

test("foto no approved como avatar falla", async () => {
  const db = fakeDb(base());
  assert.equal(await fijarAvatar(db, 1, 3), false);
  assert.equal(db.fotos[0].is_avatar, true);
});

test("registro sin foto (no multipart) devuelve 400", async () => {
  const { POST } = await import("../app/api/auth/registro/route.js");
  const res = await POST(new Request("http://x/api/auth/registro", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nick: "abc" }),
  }));
  assert.equal(res.status, 400);
});

const usuario = (created_at, avatar) => ({ async query() { return { rows: [{ created_at: new Date(created_at), avatar }] }; } });

test("cuenta antigua sin avatar cumple el requisito (no se bloquea)", async () => {
  assert.equal(await cumpleRequisitoAvatar(usuario("2026-09-24T23:59:59Z", false), 1), true);
});

test("cuenta antigua con avatar cumple", async () => {
  assert.equal(await cumpleRequisitoAvatar(usuario("2026-08-01T00:00:00Z", true), 1), true);
});

test("cuenta nueva sin avatar NO cumple; con avatar sí", async () => {
  assert.equal(await cumpleRequisitoAvatar(usuario("2026-09-25T00:00:00Z", false), 1), false);
  assert.equal(await cumpleRequisitoAvatar(usuario("2026-10-01T00:00:00Z", true), 1), true);
});

test("las reglas del DELETE aplican también a cuentas antiguas", async () => {
  // borrarFoto no consulta la antigüedad de la cuenta: el avatar sigue protegido.
  const db = fakeDb(base());
  assert.equal((await borrarFoto(db, 1, 1)).status, 409);
});
