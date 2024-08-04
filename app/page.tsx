"use client";

import { useState } from "react";

import Image from "next/legacy/image";
import { Loader2 } from "lucide-react";

import useLogin from "@/hooks/auth/use-login";

import { Button } from "@/components/ui/button";
import TopBar from "@/components/common/topbar";
import { useToast } from "@/components/ui/use-toast";

import TwitchLogo from "@/public/twitch.svg";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()

  const handleLogin = async () => {
    setIsLoading(true);
    const err = await useLogin();
    if (err) {
      toast({
        description: err.message,
        duration: 5000,
        variant: "destructive",
      })
    } else {
      toast({
        description: "Logging in...",
        duration: 5000,
      })
    }
    setIsLoading(false);
  }

  return (
    <div>
      <TopBar>
        <div className="flex flex-row-reverse md:mx-10">
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
        </div>
      </TopBar>
    </div>
  )
}
