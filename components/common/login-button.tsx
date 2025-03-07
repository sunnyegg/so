import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import usePersistState from "@/hooks/use-persist-state";

import { PersistAuth } from "@/types/persist";
import { getAuthorizationUrl } from "@/lib/twitch";

type LoginButtonVariant = "streamegg" | "streamegg-outline" | null | undefined;

export default function LoginButton({
  text,
  className,
  variant
}: Readonly<{
  text: string;
  className?: string;
  variant?: LoginButtonVariant;
}>) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [auth] = usePersistState(PersistAuth.name, PersistAuth.defaultValue);

  const handleLogin = async () => {
    setIsLoading(true);

    if (auth.accessToken) {
      setIsLoading(false);
      toast({
        description: "You are already logged in",
        duration: 3000
      });
      router.push("/dashboard/shoutout");
      return;
    }

    // Generate authorization URL using our new function
    const authUrl = getAuthorizationUrl();
    router.push(authUrl);

    setIsLoading(false);
  };

  return (
    <Button
      className={className}
      variant={variant}
      onClick={handleLogin}
      isLoading={isLoading}
    >
      {text}
    </Button>
  );
}
