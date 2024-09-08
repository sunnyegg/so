import { createContext } from "react";
import usePersistState from "@/hooks/common/use-persist-state";
import { CHATTER } from "./types";

export interface IChatterContext {
  chatters: ChatterData[];
  setChatters: (chatters: ChatterData[]) => void;
}

export type ChatterData = {
  shown: boolean;
  channel: string;
  user_name: string;
  user_login: string;
  followers: number;
  profile_image_url: string;
  last_seen_playing: string;
}

export type EventsubData = {
  channel: string;
  redeemer?: string;
  type: string;
}

export const STREAM_ONLINE = "stream.online";
export const STREAM_OFFLINE = "stream.offline";
export const CHANNEL_REDEMPTION = "channel.channel_points_custom_reward_redemption.add";

const ChatterContext = createContext<IChatterContext | null>(null);

const ChatterProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatters, setChatters] = usePersistState(CHATTER, []);

  return (
    <ChatterContext.Provider value={{
      chatters: chatters,
      setChatters: setChatters,
    }}>
      {children}
    </ChatterContext.Provider>
  );
}

export { ChatterContext, ChatterProvider };