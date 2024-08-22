import { createContext } from "react";
import usePersistState from "@/hooks/common/use-persist-state";

import { CHANNEL } from "./types";

export interface IChannelContext {
  channel: string;
  setChannel: (channel: string) => void;
}

const ChannelContext = createContext<IChannelContext | null>(null);

const ChannelProvider = ({ children }: { children: React.ReactNode }) => {
  const [channel, setChannel] = usePersistState(CHANNEL, "");

  return (
    <ChannelContext.Provider value={{
      channel: channel,
      setChannel: setChannel,
    }}>
      {children}
    </ChannelContext.Provider>
  );
}

export { ChannelContext, ChannelProvider };