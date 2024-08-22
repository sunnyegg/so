import { createContext } from "react";

import usePersistState from "@/hooks/common/use-persist-state";

import { createStreamInfo } from "@/hooks/server/stream";
import { ChannelInfoResponse, StreamInfoResponse } from "@/hooks/types";
import { getChannelInfo, getStreamInfo } from "@/hooks/server/twitch";
import { STREAM } from "./types";

export interface IStreamContext {
  stream: StreamData;
  setStream: (stream: StreamData) => void;
  createStream: (token: string, stream: StreamData) => Promise<StreamInfoResponse>;
  getStream: (token: string, channel: string) => Promise<ChannelInfoResponse>;
  getLiveInfo: (token: string, channel: string) => Promise<StreamInfoResponse>;
}

export type StreamData = {
  id: number;
  title: string;
  channel: string;
  is_live: boolean;
  game_name: string;
  started_at: string;
}

const StreamContext = createContext<IStreamContext | null>(null);

const StreamProvider = ({ children }: { children: React.ReactNode }) => {
  const [stream, setStream] = usePersistState(STREAM, {});

  const getStream = async (token: string, channel: string): Promise<ChannelInfoResponse> => {
    return await getChannelInfo(token, channel);
  }

  const getLiveInfo = async (token: string, channel: string): Promise<StreamInfoResponse> => {
    return await getStreamInfo(token, channel);
  }

  const createStream = async (token: string, stream: StreamData): Promise<StreamInfoResponse> => {
    return await createStreamInfo(token, stream);
  }

  return (
    <StreamContext.Provider value={{
      stream: stream,
      setStream: setStream,
      createStream: createStream,
      getStream: getStream,
      getLiveInfo: getLiveInfo,
    }}>
      {children}
    </StreamContext.Provider>
  );
}

export { StreamContext, StreamProvider };