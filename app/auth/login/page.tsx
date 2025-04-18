"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { PersistAuth, PersistChannel } from "@/types/persist";
import { SelectedChannel } from "@/types/channel";
import { loginAction } from "./actions";

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

    const performLogin = async () => {
      if (!code || !scope) {
        toast({
          description: "Missing authentication parameters",
          duration: 5000,
          variant: "destructive"
        });
        setTimeout(() => {
          router.push("/");
        }, 5100);
        return;
      }

      isLoggedIn.current = true;

      // Call the server action
      const result = await loginAction(code, scope);

      if (!result.success) {
        toast({
          description: result.message,
          duration: 5000,
          variant: "destructive"
        });
        setTimeout(() => {
          router.push("/");
        }, 5100);
        return;
      }

      setAuth({ ...result.data });
      setChannel({
        id: result.data!.user.id,
        login: result.data!.user.login,
        displayName: result.data!.user.displayName,
        profileImageUrl: result.data!.user.profileImageUrl
      });

      toast({
        description: "Successfully logged in",
        duration: 1000
      });

      setTimeout(() => {
        router.push("/dashboard/shoutout");
      }, 1000);
    };

    performLogin();
  }, [code, scope]);

  return (
    <div className="mx-4 my-8 md:mx-32">
      <p>Processing...</p>
    </div>
  );
}
