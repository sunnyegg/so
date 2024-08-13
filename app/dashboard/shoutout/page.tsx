'use client';

import { useContext, useEffect } from "react";

import { AuthContext, IAuthContext } from "@/context/auth";

import { useConnectWs } from "@/hooks/ws/use-connect-ws";

import StreamCard from "@/components/dashboard/stream";
import ShoutoutManager from "@/components/dashboard/shoutout/manager";

import { ChatterData } from "@/context/chatter";
import { IShoutoutContext, ShoutoutContext } from "@/context/shoutout";

export default function ShoutoutPage() {
  const { auth } = useContext(AuthContext) as IAuthContext;
  const { addShoutout } = useContext(ShoutoutContext) as IShoutoutContext;

  const { ws, isConnected } = useConnectWs(auth.access_token, auth.user.user_login);

  useEffect(() => {
    if (isConnected && ws.current) {
      ws.current.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        if (data.type === "chatter") {
          const chatter = JSON.parse(data.data) as ChatterData;

          addShoutout({
            id: "",
            avatar: chatter.profile_image_url,
            userName: chatter.user_name,
            userLogin: chatter.user_login,
            followers: chatter.followers,
            lastSeenPlaying: chatter.last_seen_playing,
            channel: chatter.channel,
          });
        }
      }
    }
  }, [isConnected])

  return (
    <div className="mt-8">
      <StreamCard />

      <div className="border-t-[1px] mt-8 border-so-secondary-color"></div>

      <ShoutoutManager />
    </div>
  )
}