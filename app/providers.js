"use client";

import { SessionProvider } from "next-auth/react";
import { RegisterSW } from "./components/RegisterSW";
import { VigilanteSesion } from "./components/VigilanteSesion";

export function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={60}>
      <VigilanteSesion />
      <RegisterSW />
      {children}
    </SessionProvider>
  );
}
