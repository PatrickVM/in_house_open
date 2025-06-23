"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { WalkthroughController } from "./components/WalkthroughController";

interface WalkthroughProviderProps {
  children: React.ReactNode;
}

export function WalkthroughProvider({ children }: WalkthroughProviderProps) {
  return (
    <>
      {children}
      <WalkthroughController />
    </>
  );
}
