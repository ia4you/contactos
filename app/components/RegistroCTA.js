"use client";

import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";

// Envoltorio sobre Link para medir en GA4 los clics en los distintos puntos
// de entrada al registro (landing, navbar, blog, islas, etc.), etiquetados
// por `location` para poder desglosar la conversión por canal/origen.
export function RegistroCTA({ location, className, style, children }) {
  return (
    <Link
      href="/registro"
      className={className}
      style={style}
      onClick={() => sendGAEvent("event", "click_registrarse", { location })}
    >
      {children}
    </Link>
  );
}
