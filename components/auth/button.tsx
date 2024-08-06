import { useContext, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

import useLogin from "@/hooks/auth/use-login";
import { AuthContext, IAuthContext } from "@/context/auth";

type AuthButtonVariant = "outline" | "link" | "default" | "destructive" | "secondary" | "ghost" | null | undefined;

export default function AuthButton({ children, className, variant }: Readonly<{ children: React.ReactNode, className?: string, variant?: AuthButtonVariant }>) {
  const { auth } = useContext(AuthContext) as IAuthContext;

  const router = useRouter();
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    if (auth.access_token !== "") {
      toast({
        description: "Already logged in",
        duration: 2000,
      })
      setTimeout(() => {
        router.push("/dashboard");
      }, 2100);
    } else {
      const { error, data } = await useLogin();
      if (error !== "") {
        toast({
          description: error,
          duration: 5000,
          variant: "destructive",
        })
      } else {
        toast({
          description: "Logging in...",
          duration: 2000,
        })
        setTimeout(() => {
          router.push(data);
        }, 2100);
      }
    }

    setIsLoading(false);
  }

  return (
    <Button
      className={className}
      variant={variant}
      onClick={isLoading ? () => { } : handleLogin}>
      {children}
    </Button>
  )
}