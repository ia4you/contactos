"use client";

import { useEffect, useRef } from "react";
import { getSession, useSession } from "next-auth/react";

// Si la sesión deja de ser válida (cuenta suspendida o eliminada, contraseña
// cambiada en otro dispositivo), lleva a /login. Dos señales:
//  - SessionProvider vuelve a pedir la sesión cada 60 s y al enfocar la
//    pestaña: si pasa de autenticada a no autenticada, se redirige.
//  - Una API responde 401: se confirma con getSession() (un 401 también
//    puede ser «contraseña incorrecta») antes de redirigir.
export function VigilanteSesion() {
  const { status } = useSession();
  const anterior = useRef(status);

  useEffect(() => {
    if (anterior.current === "authenticated" && status === "unauthenticated") {
      window.location.assign("/login");
    }
    anterior.current = status;
  }, [status]);

  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (...args) => {
      const res = await original(...args);
      const ruta = new URL(String(args[0]?.url ?? args[0]), window.location.href).pathname;
      if (res.status === 401 && ruta.startsWith("/api/") && !ruta.startsWith("/api/auth/")) {
        if (anterior.current === "authenticated" && !(await getSession())) window.location.assign("/login");
      }
      return res;
    };
    return () => {
      window.fetch = original;
    };
  }, []);

  return null;
}
