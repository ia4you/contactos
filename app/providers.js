"use client";

import { SessionProvider } from "next-auth/react";
import { RegisterSW } from "./components/RegisterSW";
import { ConfirmarProvider } from "./components/Confirmar";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ConfirmarProvider>
        <RegisterSW />
        {children}
      </ConfirmarProvider>
    </SessionProvider>
  );
}
