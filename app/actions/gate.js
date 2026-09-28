"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function tieneAlMenos18(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento);
  if (Number.isNaN(nacimiento.getTime())) return false;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const noHaCumplidoAunEsteAnio =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (noHaCumplidoAunEsteAnio) edad -= 1;

  return edad >= 18;
}

export async function confirmarEdad(formData) {
  const fechaNacimiento = formData.get("fecha_nacimiento");

  if (!fechaNacimiento || !tieneAlMenos18(fechaNacimiento)) {
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
