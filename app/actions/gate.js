"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function tieneAlMenos18(dia, mes, anio) {
  const nacimiento = new Date(anio, mes - 1, dia);
  const esFechaValida =
    nacimiento.getFullYear() === anio &&
    nacimiento.getMonth() === mes - 1 &&
    nacimiento.getDate() === dia;
  if (!esFechaValida) return false;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const noHaCumplidoAunEsteAnio =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (noHaCumplidoAunEsteAnio) edad -= 1;

  return edad >= 18;
}

export async function confirmarEdad(formData) {
  const dia = Number(formData.get("dia"));
  const mes = Number(formData.get("mes"));
  const anio = Number(formData.get("anio"));

  if (!dia || !mes || !anio || !tieneAlMenos18(dia, mes, anio)) {
    redirect("/?edad=no");
  }

  cookies().set("edad_confirmada", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  redirect("/");
}
