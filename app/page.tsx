"use client";

import { useContext, useState } from "react";

import Image from "next/legacy/image";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AuthContext, IAuthContext } from "@/context/auth";

import useLogin from "@/hooks/auth/use-login";

import { Button } from "@/components/ui/button";
import TopBar from "@/components/common/topbar";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import TwitchLogo from "@/public/twitch.svg";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false);

  const { auth } = useContext(AuthContext) as IAuthContext;

  const handleLogin = async () => {
    setIsLoading(true);
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
        duration: 5000,
      })
      router.push(data);
    }
    setIsLoading(false);
  }

  return (
    <div>
      <TopBar>
        <div className="flex flex-row-reverse md:mx-10">
          {auth.user.user_name !== "" ? (
            <Button
              name="button-logout"
              className="bg-slate-400 hover:bg-slate-500 text-slate-700 justify-center">
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage src={auth.user.profile_image_url} alt="Avatar" />
                <AvatarFallback>
                  {auth.user.user_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <span>{auth.user.user_name}</span>
            </Button>
          ) : (
            <Button
              name="button-login"
              className="bg-slate-400 hover:bg-slate-500 text-slate-700 justify-center"
              onClick={handleLogin}>
              {!isLoading ? (
                <>
                  {TwitchLogo && (
                    <Image src={TwitchLogo}
                      alt="Twitch Logo"
                      width={24}
                      height={24}
                      className="vertical-align-middle"
                    />
                  )} <span>Login</span>
                </>
              ) : <>
                <Loader2 className="animate-spin" />
              </>}
            </Button>
          )}
        </div>
      </TopBar>
    </div>
  )
}
