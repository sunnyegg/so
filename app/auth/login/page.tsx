"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TopBar from "@/components/common/topbar";
import { useToast } from "@/components/ui/use-toast";

type Auth = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    login: string;
    displayName: string;
    profileImageUrl: string;
  };
};

export default function Login() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams && searchParams.get("code");
  const scope = searchParams && searchParams.get("scope");
  const state = searchParams && searchParams.get("state");

  const [auth, setAuth] = useState<Auth>({} as Auth);
  const [channel, setChannel] = useState<string>();

  let isLoggedIn = false;

  useEffect(() => {
    if (isLoggedIn) {
      return;
    }

    const fetchLogin = async () => {
      isLoggedIn = true;

      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login?code=${code}&scope=${scope}&state=${state}`;
      const res = await fetch(url, {
        method: "GET",
      });

      if (!res.ok) {
        toast({
          description: "Failed to login",
          duration: 5000,
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/");
        }, 5100);
        return;
      }

      const data = await res.json();
      if (!data.status) {
        toast({
          description: "Failed to login",
          duration: 5000,
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/");
        }, 5100);
      }

      setAuth({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        expiresIn: data.data.expiresIn,
        user: {
          login: data.data.user.login,
          displayName: data.data.user.displayName,
          profileImageUrl: data.data.user.profileImageUrl,
        },
      });

      setChannel(data.data.user.login);

      toast({
        description: "Successfully logged in",
        duration: 1000,
      });

      setTimeout(() => {
        router.push("/dashboard/shoutout");
      }, 1000);
    };

    fetchLogin();
  }, [code, scope, state, isLoggedIn]);

  return (
    <div className="mx-4 my-8 md:mx-32">
      <TopBar />

      <p>Processing...</p>
    </div>
  );
}
