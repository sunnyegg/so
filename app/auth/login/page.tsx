"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TopBar from "@/components/common/topbar";
import { useToast } from "@/components/ui/use-toast";

import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { PersistAuth, PersistChannel } from "@/types/persist";

type LoginResponse = {
  status: boolean;
  data: Auth;
};

export default function Login() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams && searchParams.get("code");
  const scope = searchParams && searchParams.get("scope");
  const state = searchParams && searchParams.get("state");

  const [, setAuth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  );
  const [, setChannel] = usePersistState(
    PersistChannel.name,
    PersistChannel.defaultValue
  );

  const isLoggedIn = useRef(false);

  useEffect(() => {
    if (isLoggedIn.current) {
      return;
    }

    const fetchLogin = async () => {
      isLoggedIn.current = true;

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

      const data = (await res.json()) as LoginResponse;
      if (!data.status) {
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

      setAuth({
        accessToken: data.data.accessToken,
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
