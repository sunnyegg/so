import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import { IStreamContext, StreamContext } from "@/context/stream";
import { AuthContext, AuthData, IAuthContext } from "@/context/auth";
import { ChannelContext, IChannelContext } from "@/context/channel";

import { toast } from "../ui/use-toast";

import useRefreshToken from "@/hooks/auth/use-refresh-token";
import useLogout from "@/hooks/auth/use-logout";

export default function StreamCard() {
  const { auth, setAuth } = useContext(AuthContext) as IAuthContext;
  const { channel } = useContext(ChannelContext) as IChannelContext;
  const { stream, setStream, getStream, getLiveInfo } = useContext(StreamContext) as IStreamContext;

  const [retries, setRetries] = useState(0);

  const router = useRouter();

  const getLive = async (authData: AuthData, channel: string) => {
    const { error, data } = await getLiveInfo(authData.access_token, channel);
    if (error) {
      if (error === "stream not found") {
        return await getOffline(authData, channel);
      }

      if (error === "expired token") {
        const { error, data } = await useRefreshToken(authData.refresh_token);
        if (error) {
          useLogout(authData.access_token);
          return router.push("/");
        }

        setAuth({ ...auth, access_token: data });
        return;
      }

      return toast({
        title: "Error Getting Stream Info",
        description: error,
        duration: 5000,
        variant: "destructive",
      });
    }

    setStream({ ...data, is_live: true, channel, id: stream.id });
  }

  const getOffline = async (authData: AuthData, channel: string) => {
    const { error, data } = await getStream(authData.access_token, channel);
    if (error) {
      if (error === "expired token") {
        const { error, data } = await useRefreshToken(authData.refresh_token);
        if (error) {
          useLogout(authData.access_token);
          return router.push("/");
        }

        setAuth({ ...auth, access_token: data });
        return;
      }

      return toast({
        title: "Error Getting Stream Info",
        description: error,
        duration: 5000,
        variant: "destructive",
      });
    }

    setStream({ ...data, is_live: false, channel, id: 0, started_at: "" });
  }

  useEffect(() => {
    if (!auth.access_token) return;
    if (!channel) return;
    if (retries >= 1) return;

    if (stream.is_live) {
      getLive(auth, channel);
      setRetries(prev => prev + 1);
      return;
    }

    if (!stream.is_live) {
      getOffline(auth, channel);
      setRetries(prev => prev + 1);
    }
  }, [auth, channel, stream, retries])

  return (
    <div className="bg-so-secondary-color rounded-md p-4 flex flex-col">
      <div className="text-lg md:text-[1.5rem]">{stream.is_live ? "Ongoing " : "Current "} Stream Info</div>
      <div className="flex gap-2 text-[0.8rem] md:text-sm text-so-secondary-text-color">
        <span>Title:</span>
        <span className="text-so-primary-text-color">{stream.title}</span>
      </div>
      <div className="flex gap-2 text-[0.8rem] md:text-sm text-so-secondary-text-color">
        <span>Game:</span>
        <span className="text-so-primary-text-color">{stream.game_name}</span>
      </div>

      {stream.started_at && (
        <div className="flex gap-2 text-[0.8rem] md:text-sm text-so-secondary-text-color">
          <span>Started At:</span>
          <span className="text-so-primary-text-color">{dayjs(stream.started_at).format("YYYY-MM-DD, HH:mm:ss")}</span>
        </div>
      )}
    </div>
  )
}