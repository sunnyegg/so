import { useContext } from "react";

import ShoutoutCard from "./card";

import { TwitchContext } from "@/contexts/twitch";

export default function ShoutoutManager() {
  const { chatters, removeFromShoutout, isConnectedChat } =
    useContext(TwitchContext).chat;

  return (
    <div>
      {isConnectedChat &&
        chatters.map((item) => (
          <ShoutoutCard
            key={item.id}
            {...item}
            removeFromShoutout={removeFromShoutout}
          />
        ))}

      {isConnectedChat && chatters.length === 0 && (
        <div className="animate-fade-in mt-8 text-center">
          Waiting for someone to chat...
        </div>
      )}
    </div>
  );
}
