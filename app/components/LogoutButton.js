"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-champan/30 px-4 py-1.5 text-sm text-[#F2EDE4]/70 transition hover:border-champan/60"
    >
      Cerrar sesión
    </button>
  );
}
