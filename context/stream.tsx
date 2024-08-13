import { createContext, useEffect, useState } from "react";

import usePersistState from "@/hooks/common/use-persist-state";

import { getChannelInfo, getStreamInfo } from "@/hooks/server/twitch";

export interface IStreamContext {
  stream: StreamData;
  setStream: (stream: StreamData) => void;
}

export type StreamData = {
  title: string;
  channel: string;
  is_live: boolean;
  game_name: string;
  started_at: string;
}

const StreamContext = createContext<IStreamContext | null>(null);

const StreamProvider = ({ children }: { children: React.ReactNode }) => {
  const [stream, setStream] = usePersistState("stream", {});
  const [auth, _] = usePersistState("auth", {});
  const [numberOfRetries, setNumberOfRetries] = useState(0);

  const fetchStream = async (token: string, userLogin: string) => {
    const { error, data } = await getStreamInfo(token, userLogin);
    if (error === "stream not found") {
      const ch = await getChannelInfo(token, userLogin);
      if (ch.error === "") {
        setStream({ ...ch.data, is_live: false, channel: userLogin });
      }
    }

    if (error === "") {
      setStream({ ...data, is_live: true, channel: userLogin });
    }
  }

  useEffect(() => {
    if (numberOfRetries >= 1) return;

    const ch = stream.channel || auth?.user?.user_login;

    if (ch && !stream.is_live) {
      fetchStream(auth.access_token, ch)
      setNumberOfRetries(numberOfRetries + 1);
    }
  }, [auth, stream, numberOfRetries])

  return (
    <StreamContext.Provider value={{
      stream: stream,
      setStream: setStream,
    }}>
      {children}
    </StreamContext.Provider>
  );
}

export { StreamContext, StreamProvider };