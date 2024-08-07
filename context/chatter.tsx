import { createContext } from "react";
import usePersistState from "@/hooks/common/use-persist-state";

export interface IChatterContext {
  chatters: ChatterData[];
  setChatters: (chatters: ChatterData[]) => void;
}

export type ChatterData = {
  shown: boolean;
  user_name: string;
  user_login: string;
  user_profile_image_url: string;
  followers: number;
  last_seen_playing: string;
}

const ChatterContext = createContext<IChatterContext | null>(null);

const ChatterProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatters, setChatters] = usePersistState("chatters", []);

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