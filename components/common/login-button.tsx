import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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

  const handleLogin = async () => {
    setIsLoading(true);

    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + "/auth/login";
    const SCOPE = "chat:read chat:edit";
    const STATE = Math.random().toString(36).substring(2);

    fetch("/api/auth/save-state", {
      method: "POST",
      body: JSON.stringify({ state: STATE }),
    });

    const url = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&state=${STATE}`;
    console.log(url);
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
