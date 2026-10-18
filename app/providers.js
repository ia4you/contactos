"use client";

import { SessionProvider } from "next-auth/react";
import { RegisterSW } from "./components/RegisterSW";
import { VigilanteSesion } from "./components/VigilanteSesion";
import { ConfirmarProvider } from "./components/Confirmar";

export function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={60}>
      <ConfirmarProvider>
        <VigilanteSesion />
        <RegisterSW />
        {children}
      </ConfirmarProvider>
    </SessionProvider>
  );
}
