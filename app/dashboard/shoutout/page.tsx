"use client";

import { useContext } from "react";

import Divider from "@/components/common/divider";
import StreamCard from "@/app/dashboard/components/stream";
import ShoutoutManager from "@/app/dashboard/shoutout/components/manager";

import { TwitchContext } from "@/contexts/twitch";

export default function ShoutoutPage() {
  const { isConnectedChat } = useContext(TwitchContext).chat;
  const { isLive } = useContext(TwitchContext).stream;

  return (
    <div className="mt-8">
      <StreamCard />

      <Divider />

      {!isConnectedChat && isLive && (
        <div className="animate-fade-in mt-8 text-center">
          Connecting to chat...
        </div>
      )}

      <ShoutoutManager />

      {!isLive && (
        <div className="mt-8 text-center">
          <div className="animate-fade-in">
            It seems that you are not live right now...
          </div>
        </div>
      )}
    </div>
  );
}
