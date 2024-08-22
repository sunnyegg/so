'use client';

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthContext, IAuthContext } from "@/context/auth";

import { useConnectWs } from "@/hooks/ws/use-connect-ws";

import { Button } from "@/components/ui/button";
import Divider from "@/components/common/divider";
import StreamCard from "@/components/dashboard/stream";
import ShoutoutManager from "@/components/dashboard/shoutout/manager";
import { LiveDialog } from "@/components/dashboard/shoutout/live-dialog";

import { ChatterData } from "@/context/chatter";
import { IStreamContext, StreamContext } from "@/context/stream";
import { ChannelContext, IChannelContext } from "@/context/channel";
import { IShoutoutContext, ShoutoutContext } from "@/context/shoutout";

export default function ShoutoutPage() {
  const { auth } = useContext(AuthContext) as IAuthContext;
  const { addShoutout } = useContext(ShoutoutContext) as IShoutoutContext;
  const { stream } = useContext(StreamContext) as IStreamContext;
  const { channel } = useContext(ChannelContext) as IChannelContext;

  const [open, setOpen] = useState(false);

  const { ws, isConnected } = useConnectWs(auth.access_token, auth.user.user_login, channel, stream.id);

  const router = useRouter();

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

      <Divider />

      {stream.is_live && (!isConnected ? <div className="mt-8 text-center animate-fade-in">Connecting to chat...</div> : <ShoutoutManager />)}
      {!stream.is_live && (
        <div className="text-center mt-8">
          <div className="animate-fade-in">It seems that you're not live right now...</div>
          <Button
            className="mt-4"
            variant="streamegg"
            onClick={() => setOpen(true)}
          >
            I'm going to live in a minute
          </Button>
        </div>
      )}

      <LiveDialog open={open} setOpen={setOpen} router={router} />
    </div>
  )
}