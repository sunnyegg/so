'use client';

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthContext, AuthData, IAuthContext } from "@/context/auth";

import { useConnectWs } from "@/hooks/ws/use-connect-ws";

import { Button } from "@/components/ui/button";
import Divider from "@/components/common/divider";
import { toast } from "@/components/ui/use-toast";
import StreamCard from "@/components/dashboard/stream";
import ShoutoutManager from "@/components/dashboard/shoutout/manager";
import { LiveDialog } from "@/components/dashboard/shoutout/live-dialog";

import { ChatterData } from "@/context/chatter";
import { IStreamContext, StreamContext } from "@/context/stream";
import { ChannelContext, IChannelContext } from "@/context/channel";
import { IShoutoutContext, ShoutoutContext } from "@/context/shoutout";

import useLogout from "@/hooks/auth/use-logout";
import { getChannelInfo } from "@/hooks/server/twitch";
import useRefreshToken from "@/hooks/auth/use-refresh-token";
import { createAttendance, getAttendance } from "@/hooks/server/attendance";

export default function ShoutoutPage() {
  const { auth, setAuth } = useContext(AuthContext) as IAuthContext;
  const { addShoutout } = useContext(ShoutoutContext) as IShoutoutContext;
  const { stream } = useContext(StreamContext) as IStreamContext;
  const { channel } = useContext(ChannelContext) as IChannelContext;

  const [open, setOpen] = useState(false);
  const [tempChatter, setTempChatter] = useState<any>({});

  const { ws, isConnected } = useConnectWs(auth.access_token, auth.user.user_login, channel, stream.id);

  const router = useRouter();

  const handleGetAttendance = async (authData: AuthData, streamId: number) => {
    const res = await getAttendance(authData.access_token, streamId);
    if (res.error) {
      if (res.error === "expired token") {
        const { error, data } = await useRefreshToken(authData.refresh_token);
        if (error) {
          useLogout(authData.access_token);
          return router.push("/");
        }

        setAuth({ ...authData, access_token: data });
        return;
      }

      return toast({
        title: "Error",
        description: res.error,
        duration: 5000,
        variant: "destructive",
      })
    }

    for (const attendance of res.data) {
      tempChatter[attendance.username] = true;
      setTempChatter(tempChatter);
    }
  }

  const processEventMessage = async (authData: AuthData, streamId: number, data: any) => {
    // chatter buat attendance
    if (data.type === "chatter") {
      const chatter = JSON.parse(data.data) as ChatterData;

      // skip jika sudah hadir
      if (tempChatter[chatter.user_login]) {
        return;
      }

      tempChatter[chatter.user_login] = true;
      setTempChatter(tempChatter);

      // get info chatter
      const res = await getChannelInfo(authData.access_token, chatter.user_login);
      if (res.error) {
        if (res.error === "expired token") {
          const { error, data } = await useRefreshToken(authData.refresh_token);
          if (error) {
            useLogout(authData.access_token);
            return router.push("/");
          }

          setAuth({ ...authData, access_token: data });
          return;
        }

        return toast({
          title: "Error",
          description: res.error,
          duration: 5000,
          variant: "destructive",
        })
      }

      addShoutout({
        id: "",
        avatar: res.data.user.profile_image_url,
        userName: res.data.user.display_name,
        userLogin: res.data.user.login,
        followers: res.data.followers,
        lastSeenPlaying: res.data.game_name,
        channel: chatter.channel,
      });

      // attendance
      const presentAt = new Date().toISOString();
      createAttendance(authData.access_token, chatter.user_login, presentAt, streamId);
    }
  }

  useEffect(() => {
    if (isConnected && ws.current) {
      handleGetAttendance(auth, stream.id);

      ws.current.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        processEventMessage(auth, stream.id, data);
      }
    }
  }, [auth, stream, isConnected])

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