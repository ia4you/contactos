import test from "node:test";
import assert from "node:assert/strict";
import { validarFechaNacimiento as v } from "../app/components/fechaNacimiento.js";

test("fecha de nacimiento del registro", () => {
  const hoy = new Date();
  assert.deepEqual(v("", "3", "1990"), { iso: "" });
  assert.deepEqual(v("7", "3", "1990"), { iso: "1990-03-07" });
  assert.equal(v("31", "2", "1990").error, "Esa fecha no existe.");
  // Cumple 18 mañana: todavía no es mayor de edad.
  const manana = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate() + 1);
  assert.equal(v(manana.getDate(), manana.getMonth() + 1, manana.getFullYear()).error, "Debes ser mayor de 18 años.");
  const cumpleHoy = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
  assert.ok(v(cumpleHoy.getDate(), cumpleHoy.getMonth() + 1, cumpleHoy.getFullYear()).iso);
});
