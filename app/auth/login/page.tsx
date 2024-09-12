"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TopBar from "@/components/common/topbar";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams && searchParams.get("code");
  const scope = searchParams && searchParams.get("scope");
  const state = searchParams && searchParams.get("state");

  const [auth, setAuth] = useState<any>();
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
      console.log(res);

      setAuth({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: {
          user_login: data.user.user_login,
          user_name: data.user.user_name,
          profile_image_url: data.user.profile_image_url,
        },
      });

      setChannel(data.user.user_login);

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
