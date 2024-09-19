import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import usePersistState from "@/hooks/use-persist-state";

import { PersistAuth } from "@/types/persist";

type LoginButtonVariant = "streamegg" | "streamegg-outline" | null | undefined;

export default function LoginButton({
  text,
  className,
  variant,
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
        duration: 3000,
      });
      router.push("/dashboard/shoutout");
      return;
    }

    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + "/auth/login";
    const SCOPE = "chat:read chat:edit";

    const url = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;
    router.push(url);

    setIsLoading(false);
  };

  return (
    <Button
      className={className}
      variant={variant}
      onClick={handleLogin}
      disabled={isLoading}
    >
      {text}
    </Button>
  );
}
