"use client";

import { SessionProvider } from "next-auth/react";
import { RegisterSW } from "./components/RegisterSW";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <RegisterSW />
      {children}
    </SessionProvider>
  );
}
