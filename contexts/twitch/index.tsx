import { createContext, useCallback, useState } from "react";

import { toast } from "@/components/ui/use-toast";

import usePersistState from "@/hooks/use-persist-state";

import { Chatter } from "@/types/chat";
import { Stream } from "@/types/stream";
import { Channel } from "@/types/channel";
import { Settings } from "@/types/settings";
import { PersistStream } from "@/types/persist";

type ChannelResponse = {
  status: boolean;
  data: Channel;
};

type SettingsResponse = {
  status: boolean;
  data: Settings;
};

type TwitchChatContextType = {
  isConnectedChat: boolean;
  setIsConnectedChat: React.Dispatch<React.SetStateAction<boolean>>;
  isConnectedEventSub: boolean;
  setIsConnectedEventSub: React.Dispatch<React.SetStateAction<boolean>>;
  chatters: Chatter[];
  attendance: Chatter[];
  addToShoutout: (
    chatter: Chatter,
    token: string,
    login: string
  ) => Promise<void>;
  removeFromShoutout: (id: string) => void;
  sendMessageSO: (token: string, login: string, ch: string) => Promise<string>;
  sendSO: (token: string, login: string, ch: string) => Promise<string>;
};

type TwitchStreamContextType = {
  isLive: boolean;
  setLive: (live: boolean) => void;
};

type TwitchContextType = {
  chat: TwitchChatContextType;
  stream: TwitchStreamContextType;
};

export const TwitchContext = createContext<TwitchContextType>({
  chat: {
    isConnectedChat: false,
    isConnectedEventSub: false,
    chatters: [],
    attendance: [],
    addToShoutout: (chatter, token, login) => {
      return Promise.resolve();
    },
    removeFromShoutout: () => {},
    sendMessageSO: (token: string, login: string, ch: string) => {
      return Promise.resolve("");
    },
    sendSO: (token: string, login: string, ch: string) => {
      return Promise.resolve("");
    },
    setIsConnectedChat: () => {},
    setIsConnectedEventSub: () => {},
  },
  stream: {
    isLive: false,
    setLive: () => {},
  },
});

export default function TwitchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [attendance, setAttendance] = useState<Chatter[]>([]);
  const [isConnectedChat, setIsConnectedChat] = useState(false);
  const [isConnectedEventSub, setIsConnectedEventSub] = useState(false);

  const alreadyPresent = new Map<string, Chatter>();

  const [stream, setStream] = usePersistState(
    PersistStream.name,
    PersistStream.defaultValue
  ) as [Stream, React.Dispatch<React.SetStateAction<Stream>>];

  const addToShoutout = useCallback(
    async (chatter: Chatter, token: string, login: string) => {
      if (alreadyPresent.has(chatter.login)) {
        return;
      }

      alreadyPresent.set(chatter.login, chatter);

      setChatters((prevChatters: Chatter[]) => [
        ...prevChatters,
        { ...chatter },
      ]);
      setAttendance((prevAttendance: Chatter[]) => [
        ...prevAttendance,
        { ...chatter },
      ]);

      const settingsRes = await fetch(`/api/settings/list?login=${login}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!settingsRes.ok) {
        toast({
          title: "Failed to get settings",
          description: "Please refresh the page",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const settingsData = (await settingsRes.json()) as SettingsResponse;

      if (settingsData.data.autoSo) {
        setTimeout(async () => {
          const smSORes = await sendMessageSO(token, chatter.login, login);
          const sSORes = await sendSO(token, chatter.login, login);

          if (smSORes !== "") {
            toast({
              title: "Shoutout Error",
              description: smSORes,
              variant: "destructive",
              duration: 2000,
            });
            return;
          }

          if (sSORes !== "") {
            toast({
              title: "Shoutout Error",
              description: sSORes,
              variant: "destructive",
              duration: 2000,
            });
            return;
          }
        }, settingsData.data.autoSoDelay * 1000);
      }
    },
    []
  );

  const removeFromShoutout = useCallback((id: string) => {
    setChatters((prevChatters: Chatter[]) =>
      prevChatters.filter((item) => item.id !== id)
    );
  }, []);

  const sendMessageSO = useCallback(
    async (token: string, login: string, ch: string): Promise<string> => {
      if (ch === login) {
        return "You cannot shoutout the broadcaster";
      }

      const message = `!so @${login}`;

      const res = await fetch(`/api/chat/send-message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ channel: ch, message }),
      });
      if (!res.ok) {
        return "Failed to send shoutout";
      }

      return "";
    },
    []
  );

  const sendSO = useCallback(
    async (token: string, login: string, ch: string): Promise<string> => {
      if (ch === login) {
        return "You cannot shoutout the broadcaster";
      }

      const res = await fetch(`/api/chat/send-shoutout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ from: login, to: ch }),
      });
      if (!res.ok) {
        return "Failed to send shoutout";
      }

      return "";
    },
    []
  );

  const setLive = (live: boolean) => {
    setStream((prevStream) => ({
      ...prevStream,
      isLive: live,
    }));
  };

  return (
    <TwitchContext.Provider
      value={{
        chat: {
          isConnectedChat,
          isConnectedEventSub,
          setIsConnectedChat,
          setIsConnectedEventSub,
          chatters,
          attendance,
          addToShoutout,
          removeFromShoutout,
          sendMessageSO,
          sendSO,
        },
        stream: {
          isLive: stream.isLive,
          setLive,
        },
      }}
    >
      {children}
    </TwitchContext.Provider>
  );
}
