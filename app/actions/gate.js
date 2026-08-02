"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function confirmarEdad() {
  cookies().set("edad_confirmada", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  redirect("/");
}
