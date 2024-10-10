"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/components/ui/use-toast";

import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { PersistAuth, PersistChannel } from "@/types/persist";
import { SelectedChannel } from "@/types/channel";

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
  const [_, setChannel] = usePersistState(
    PersistChannel.name,
    PersistChannel.defaultValue
  ) as [SelectedChannel, React.Dispatch<React.SetStateAction<SelectedChannel>>];

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

      setAuth({ ...data.data });
      setChannel({
        id: data.data.user.id,
        login: data.data.user.login,
        displayName: data.data.user.displayName,
        profileImageUrl: data.data.user.profileImageUrl,
      });

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
      <p>Processing...</p>
    </div>
  );
}
