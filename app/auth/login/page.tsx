'use client';

import { useContext, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TopBar from "@/components/common/topbar";
import { AuthContext, IAuthContext } from "@/context/auth";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const { setAuth } = useContext(AuthContext) as IAuthContext;

  const { toast } = useToast()
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const scope = searchParams.get("scope");
  const state = searchParams.get("state");

  let isLoggedIn = false;

  useEffect(() => {
    if (isLoggedIn) {
      return;
    }

    const fetchLogin = async () => {
      isLoggedIn = true;

      const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?code=${code}&scope=${scope}&state=${state}`;
      const res = await fetch(url, {
        method: "GET",
      });

      if (!res.ok) {
        toast({
          description: "Failed to login",
          duration: 5000,
          variant: "destructive",
        })
        setTimeout(() => {
          router.push("/");
        }, 5100);
        return;
      }

      const data = await res.json();

      setAuth({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: {
          user_login: data.user.user_login,
          user_name: data.user.user_name,
          profile_image_url: data.user.profile_image_url,
        },
      });

      toast({
        description: "Successfully logged in",
        duration: 1000,
      })

      setTimeout(() => {
        router.push("/")
      }, 1000);;
    }

    fetchLogin();
  }, [code, scope, state, isLoggedIn]);

  return (
    <div>
      <TopBar />

      <p>Processing...</p>
    </div>
  )
}