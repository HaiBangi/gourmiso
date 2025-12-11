"use client";

import dynamic from "next/dynamic";

// Charger InstallPrompt côté client uniquement (car utilise localStorage)
const InstallPrompt = dynamic(
  () => import("@/components/pwa/install-prompt").then((mod) => mod.InstallPrompt),
  { ssr: false }
);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
    </>
  );
}
