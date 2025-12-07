"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connexion en cours...
        </>
      ) : (
        children || (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Se connecter
          </>
        )
      )}
    </Button>
  );
}

