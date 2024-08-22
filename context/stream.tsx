import { createContext } from "react";

import usePersistState from "@/hooks/common/use-persist-state";

import { createStreamInfo } from "@/hooks/server/stream";
import { ChannelInfoResponse, StreamInfoResponse } from "@/hooks/types";
import { getChannelInfo, getStreamInfo } from "@/hooks/server/twitch";
import { AUTH, STREAM } from "./types";
import useRefreshToken from "@/hooks/auth/use-refresh-token";

export interface IStreamContext {
  stream: StreamData;
  setStream: (stream: StreamData) => void;
  createStream: (stream: StreamData) => Promise<StreamInfoResponse>;
  getStream: (channel: string) => Promise<ChannelInfoResponse>;
  getLiveInfo: (channel: string) => Promise<StreamInfoResponse>;
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
  const [auth, setAuth] = usePersistState(AUTH, {});

  const getStream = async (channel: string): Promise<ChannelInfoResponse> => {
    const res = await getChannelInfo(auth.access_token, channel);
    if (res.error) {
      if (res.error === "expired token") {
        const { error, data } = await useRefreshToken(auth.access_token, auth.refresh_token);
        if (error) {
          res.error = error;
          return res;
        }
        setAuth({ ...auth, access_token: data });
        return getStream(channel);
      }
    }

    return res;
  }

  const getLiveInfo = async (channel: string): Promise<StreamInfoResponse> => {
    const res = await getStreamInfo(auth.access_token, channel);
    if (res.error) {
      if (res.error === "expired token") {
        const { error, data } = await useRefreshToken(auth.access_token, auth.refresh_token);
        if (error) {
          res.error = error;
          return res;
        }
        setAuth({ ...auth, access_token: data });
        return getLiveInfo(channel);
      }
    }

    return res;
  }

  const createStream = async (stream: StreamData): Promise<StreamInfoResponse> => {
    const res = await createStreamInfo(auth.access_token, stream);
    if (res.error) {
      if (res.error === "expired token") {
        const { error, data } = await useRefreshToken(auth.access_token, auth.refresh_token);
        if (error) {
          res.error = error;
          return res;
        }
        setAuth({ ...auth, access_token: data });
        return createStream(stream);
      }
    }

    return res;
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