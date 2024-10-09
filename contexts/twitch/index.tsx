import { ChatClient } from "@twurple/chat";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

import { toast } from "@/components/ui/use-toast";

import usePersistState from "@/hooks/use-persist-state";

import { NewChatClient, NewEventSubWsClient } from "@/lib/twitch";

import { Auth } from "@/types/auth";
import { Chatter } from "@/types/chat";
import { Stream } from "@/types/stream";
import { Channel } from "@/types/channel";
import { Settings } from "@/types/settings";
import { PersistAuth, PersistStream } from "@/types/persist";

import { EventSubWsListener } from "@twurple/eventsub-ws";

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
  chatters: Chatter[];
  attendance: Chatter[];
  removeFromShoutout: (id: string) => void;
  sendMessageSO: (token: string, login: string, ch: string) => Promise<string>;
  sendSO: (token: string, login: string, ch: string) => Promise<string>;
};

type TwitchContextType = {
  chat: TwitchChatContextType;
  stream: Stream;
  setLive: (live: boolean) => void;
  setStream: React.Dispatch<React.SetStateAction<Stream>>;
};

export const TwitchContext = createContext<TwitchContextType>({
  chat: {
    isConnectedChat: false,
    chatters: [],
    attendance: [],
    removeFromShoutout: () => {},
    sendMessageSO: (token: string, login: string, ch: string) => {
      return Promise.resolve("");
    },
    sendSO: (token: string, login: string, ch: string) => {
      return Promise.resolve("");
    },
  },
  stream: {
    streamId: "",
    gameName: "",
    title: "",
    startDate: "",
    isLive: false,
  },
  setLive: () => {},
  setStream: () => {},
});

export default function TwitchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnectedChat, setIsConnectedChat] = useState(false);
  const [isConnectedEventSub, setIsConnectedEventSub] = useState(false);
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [attendance, setAttendance] = useState<Chatter[]>([]);
  const alreadyPresent = new Map<string, Chatter>();

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];
  const [stream, setStream] = usePersistState(
    PersistStream.name,
    PersistStream.defaultValue
  ) as [Stream, React.Dispatch<React.SetStateAction<Stream>>];

  const chatClient = useRef<ChatClient | undefined>(undefined);
  const eventSubWsClient = useRef<EventSubWsListener | undefined>(undefined);

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
        body: JSON.stringify({ from: ch, to: login }),
      });
      if (!res.ok) {
        return "Failed to send shoutout";
      }

      return "";
    },
    []
  );

  const handleConnectChat = async (token: string, channel: string) => {
    if (isConnectedChat) return;

    const res = await fetch("/api/chat/connect", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      toast({
        title: "Failed to connect chat",
        description: "Please refresh the page",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const data = await res.json();
    chatClient.current = NewChatClient(data.data, channel);
    chatClient.current.connect();

    // events
    chatClient.current.onMessage(async (ch, user, text) => {
      // skip own messages
      if (user === channel) {
        return;
      }

      const settingsRes = await fetch(`/api/settings/list?login=${channel}`, {
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

      if (settingsData.data.blacklistUsernames.length > 0) {
        const blacklisted = settingsData.data.blacklistUsernames
          .toLowerCase()
          .includes(user.toLocaleLowerCase());
        if (blacklisted) return;
      }

      if (settingsData.data.blacklistWords.length > 0) {
        const blacklisted = settingsData.data.blacklistWords
          .toLowerCase()
          .includes(text.toLocaleLowerCase());
        if (blacklisted) return;
      }

      const chatterRes = await fetch(`/api/channel/info?login=${user}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!chatterRes.ok) {
        console.log("Failed to get chatter info", await chatterRes.json());
        return;
      }

      const chatterData = (await chatterRes.json()) as ChannelResponse;

      addToShoutout(
        {
          id: Date.now().toString(),
          login: user,
          displayName: chatterData.data.displayName,
          followers: chatterData.data.followers,
          lastSeenPlaying: chatterData.data.gameName,
          profileImageUrl: chatterData.data.profileImageUrl,
          presentAt: new Date().toISOString(),
        },
        token,
        channel
      );
    });

    chatClient.current.onConnect(() => {
      setIsConnectedChat(true);
      toast({
        title: "Connected to chat",
        variant: "success",
        duration: 3000,
      });
    });

    chatClient.current.onDisconnect(() => {
      setIsConnectedChat(false);
      toast({
        title: "Disconnected from chat",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  const handleEventSub = async (token: string, userId: string) => {
    if (isConnectedEventSub) return;

    const res = await fetch("/api/eventsub/connect", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      toast({
        title: "Failed to connect eventsub",
        description: "Please refresh the page",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const data = await res.json();
    eventSubWsClient.current = NewEventSubWsClient(data.data);
    eventSubWsClient.current.start();

    // events
    eventSubWsClient.current.onStreamOnline(userId, async (e) => {
      const getOrCreateBroadcastRes = await getOrCreateBroadcast(
        e.broadcasterName,
        token
      );
      if (!getOrCreateBroadcastRes.status) {
        console.log("Failed to get or create broadcast", e);
        toast({
          title: "Failed to get or create broadcast",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const streamData: Stream = getOrCreateBroadcastRes.data;
      setStream(streamData);

      toast({
        title: "Stream Online",
        description: "You are now live",
        variant: "success",
        duration: 3000,
      });

      eventSubWsClient.current?.onChannelRedemptionAdd(userId, async (e) => {
        if (e.userId === userId) return;

        const chatterRes = await fetch(
          `/api/channel/info?login=${e.userName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!chatterRes.ok) {
          console.log("Failed to get chatter info", await chatterRes.json());
          return;
        }

        const chatterData = (await chatterRes.json()) as ChannelResponse;

        addToShoutout(
          {
            id: Date.now().toString(),
            login: e.userName,
            displayName: chatterData.data.displayName,
            followers: chatterData.data.followers,
            lastSeenPlaying: chatterData.data.gameName,
            profileImageUrl: chatterData.data.profileImageUrl,
            presentAt: new Date().toISOString(),
          },
          token,
          e.broadcasterName
        );
      });
    });

    eventSubWsClient.current.onStreamOffline(userId, (e) => {
      setLive(false);
      toast({
        title: "Stream Offline",
        description: "You are offline",
        duration: 3000,
      });
    });

    eventSubWsClient.current.onUserSocketConnect(() => {
      setIsConnectedEventSub(true);
      toast({
        title: "Connected to eventsub",
        variant: "success",
        duration: 3000,
      });
    });

    eventSubWsClient.current.onUserSocketDisconnect((_, error) => {
      console.log(error);
      setIsConnectedEventSub(false);
      toast({
        title: "Disconnected from eventsub",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  const setLive = (live: boolean) => {
    setStream((prevStream) => ({
      ...prevStream,
      isLive: live,
    }));
  };

  const getOrCreateBroadcast = async (login: string, token: string) => {
    const res = await fetch(`/api/broadcast/get-or-create?login=${login}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      return {
        code: res.status,
        status: false,
      };
    }

    const data = await res.json();
    return data;
  };

  useEffect(() => {
    if (auth.accessToken && stream.isLive) {
      handleConnectChat(auth.accessToken, auth.user.login);
    }

    return () => {
      chatClient.current?.quit();
      chatClient.current = undefined;
    };
  }, [auth, stream.isLive]);

  useEffect(() => {
    if (auth.accessToken) {
      handleEventSub(auth.accessToken, auth.user.id);
    }

    return () => {
      eventSubWsClient.current?.stop();
      eventSubWsClient.current = undefined;
    };
  }, [auth]);

  return (
    <TwitchContext.Provider
      value={{
        chat: {
          isConnectedChat,
          chatters,
          attendance,
          removeFromShoutout,
          sendMessageSO,
          sendSO,
        },
        stream,
        setLive,
        setStream,
      }}
    >
      {children}
    </TwitchContext.Provider>
  );
}
