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

import { CHANNEL_REDEMPTION, ChatterData, EventsubData, STREAM_OFFLINE, STREAM_ONLINE } from "@/context/chatter";
import { IStreamContext, StreamContext } from "@/context/stream";
import { ChannelContext, IChannelContext } from "@/context/channel";
import { IShoutoutContext, ShoutoutContext } from "@/context/shoutout";

import useLogout from "@/hooks/auth/use-logout";
import { getChannelInfo } from "@/hooks/server/twitch";
import useRefreshToken from "@/hooks/auth/use-refresh-token";
import { createAttendance, getAttendance } from "@/hooks/server/attendance";
import { ChannelInfoResponseData } from "@/hooks/types";

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

  const handleChannelInfo = async (authData: AuthData, channel: string) => {
    const res = await getChannelInfo(authData.access_token, channel);
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

      toast({
        title: "Error",
        description: res.error,
        duration: 5000,
        variant: "destructive",
      });

      return;
    }

    return res.data;
  }

  const processEventMessage = async (authData: AuthData, streamId: number, data: any) => {
    let chatter = {} as { user_login: string, channel: string };
    console.log(data);

    // chatter buat attendance
    if (data.type === "chatter") {
      const c = JSON.parse(data.data) as ChatterData;
      chatter.channel = c.channel;
      chatter.user_login = c.user_login;
    }

    if (data.type === "eventsub") {
      const eventsub = JSON.parse(data.data) as EventsubData;

      // TODO: handle stream online
      if (eventsub.type === STREAM_ONLINE) {
        console.log(eventsub);
        return;
      }

      // TODO: handle stream offline
      if (eventsub.type === STREAM_OFFLINE) {
        console.log(eventsub);
        return;
      }

      if (eventsub.type === CHANNEL_REDEMPTION) {
        chatter.channel = eventsub.channel;
        chatter.user_login = eventsub.redeemer as string;
      }
    }

    // skip jika sudah hadir
    // if (tempChatter[chatter.user_login]) {
    //   return;
    // }

    tempChatter[chatter.user_login] = true;
    setTempChatter(tempChatter);

    // get info chatter
    const channelData = await handleChannelInfo(authData, chatter.channel) as ChannelInfoResponseData;

    addShoutout({
      id: "",
      avatar: channelData.user.profile_image_url,
      userName: channelData.user.display_name,
      userLogin: channelData.user.login,
      followers: channelData.followers,
      lastSeenPlaying: channelData.game_name,
      channel: chatter.channel,
    });

    // attendance
    // const presentAt = new Date().toISOString();
    // createAttendance(authData.access_token, chatter.user_login, presentAt, streamId);
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