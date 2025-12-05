"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface SignInButtonProps {
  provider?: string;
  callbackUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SignInButton({
  provider = "google",
  callbackUrl = "/recipes",
  className,
  children,
}: SignInButtonProps) {
  return (
    <Button
      onClick={() => signIn(provider, { callbackUrl })}
      className={className}
    >
      {children || (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Se connecter
        </>
      )}
    </Button>
  );
}

