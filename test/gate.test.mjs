import test from "node:test";
import assert from "node:assert/strict";

process.env.NEXTAUTH_SECRET = "test-secret";
const { encode } = await import("next-auth/jwt");
const { NextRequest } = await import("next/server");
const { middleware } = await import("../middleware.js");

async function pedir(path, { avatar, method = "GET" } = {}) {
  const headers = { cookie: "edad_confirmada=1" };
  if (avatar !== "anon") {
    const jwt = await encode({ token: { id: "1", tieneAvatar: avatar }, secret: "test-secret" });
    headers.cookie += `; next-auth.session-token=${jwt}`;
  }
  return middleware(new NextRequest(`http://x${path}`, { method, headers }));
}

test("sin avatar: páginas protegidas redirigen a /subir-foto", async () => {
  const res = await pedir("/feed", { avatar: false });
  assert.equal(res.status, 307);
  assert.equal(new URL(res.headers.get("location")).pathname, "/subir-foto");
});

test("sin avatar: /subir-foto NO redirige (sin bucle)", async () => {
  const res = await pedir("/subir-foto", { avatar: false });
  assert.equal(res.headers.get("location"), null);
});

test("con avatar pasa", async () => {
  assert.equal((await pedir("/feed", { avatar: true })).headers.get("location"), null);
  assert.equal((await pedir("/api/feed/publicaciones", { avatar: true })).status, 200);
});

test("token antiguo (claim ausente) no bloquea", async () => {
  assert.equal((await pedir("/feed", { avatar: undefined })).headers.get("location"), null);
});

test("sin avatar: API devuelve 403 AVATAR_REQUIRED", async () => {
  const res = await pedir("/api/feed/publicaciones", { avatar: false });
  assert.equal(res.status, 403);
  assert.equal((await res.json()).code, "AVATAR_REQUIRED");
});

test("sin avatar: subida de foto, cambio de avatar y /api/auth siguen permitidos", async () => {
  for (const [m, p] of [["POST", "/api/perfil/fotos"], ["POST", "/api/perfil/avatar"], ["POST", "/api/perfil/eliminar"], ["POST", "/api/auth/signout"], ["GET", "/api/auth/session"]]) {
    assert.equal((await pedir(p, { avatar: false, method: m })).status, 200, `${m} ${p}`);
  }
});

test("sin avatar: borrar foto (DELETE) sí se bloquea", async () => {
  assert.equal((await pedir("/api/perfil/fotos", { avatar: false, method: "DELETE" })).status, 403);
});

test("sin avatar: assets (/_next, /uploads, favicon) no se bloquean ni redirigen", async () => {
  for (const p of ["/_next/static/x.js", "/uploads/1/a.webp", "/favicon.ico"]) {
    const res = await pedir(p, { avatar: false });
    assert.equal(res.status, 200, p);
    assert.equal(res.headers.get("location"), null, p);
  }
});
