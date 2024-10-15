import { createContext, useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { ChatClient } from "@twurple/chat";
import { EventSubWsListener } from "@twurple/eventsub-ws";

import { toast } from "@/components/ui/use-toast";

import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { Chatter } from "@/types/chat";
import { Settings } from "@/types/settings";
import { Broadcast } from "@/types/broadcast";
import { Channel, SelectedChannel } from "@/types/channel";
import { PersistAuth, PersistChannel, PersistStream } from "@/types/persist";

import { NewChatClient, NewEventSubWsClient } from "@/lib/twitch";

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
  setAttendance: React.Dispatch<React.SetStateAction<Chatter[]>>;
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
    setAttendance: () => {},
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
  const router = useRouter();

  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [attendance, setAttendance] = useState<Chatter[]>([]);
  const [isConnectedChat, setIsConnectedChat] = useState(false);
  const [isConnectedEventSub, setIsConnectedEventSub] = useState(false);
  const [isStreamLive, setIsStreamLive] = useState(false);

  const alreadyPresent = new Map<string, Chatter>();

  const [auth, setAuth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth, React.Dispatch<React.SetStateAction<Auth>>];
  const [channel, setChannel] = usePersistState(
    PersistChannel.name,
    PersistChannel.defaultValue
  ) as [SelectedChannel, React.Dispatch<React.SetStateAction<SelectedChannel>>];
  const [stream, setStream] = usePersistState(
    PersistStream.name,
    PersistStream.defaultValue
  ) as [Broadcast, React.Dispatch<React.SetStateAction<Broadcast>>];

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
    setIsStreamLive(live);
  };

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
      getOrCreateBroadcast(e.broadcasterName, auth.accessToken).then((res) => {
        if (res.status) {
          const data = res.data as Broadcast;
          setStream(data);
          return;
        }
      });

      toast({
        title: "Stream Online",
        description: "You are now live",
        variant: "success",
        duration: 3000,
      });
      router.refresh();
    });

    eventSubWsClient.current.onStreamOffline(userId, (e) => {
      setStream((prevStream) => ({
        ...prevStream,
        isLive: false,
      }));

      toast({
        title: "Stream Offline",
        description: "You are offline",
        duration: 3000,
      });
      router.refresh();
    });

    if (userId === auth.user.id) {
      eventSubWsClient.current.onChannelRedemptionAdd(userId, async (e) => {
        if (e.userId === userId) return;

        if (!stream.isLive) return;

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
    }

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

  const intervalAttendance = useRef<NodeJS.Timeout | null>(null);
  const saveAttendance = async (
    token: string,
    stream: Broadcast,
    attendance: Chatter[]
  ) => {
    const body = {
      streamId: stream.streamId,
      broadcasterId: stream.broadcasterId,
      chatters: attendance,
    };

    fetch("/api/broadcast/save-attendance", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  };

  useEffect(() => {
    if (auth.accessToken && stream.isLive) {
      handleConnectChat(auth.accessToken, channel.login);
    }

    return () => {
      chatClient.current?.quit();
      chatClient.current = undefined;
    };
  }, [auth, stream.isLive]);

  useEffect(() => {
    if (auth.accessToken) {
      handleEventSub(auth.accessToken, channel.id);
    }

    return () => {
      eventSubWsClient.current?.stop();
      eventSubWsClient.current = undefined;
    };
  }, [auth]);

  useEffect(() => {
    if (!auth.accessToken) return;
    if (!isStreamLive) return;
    if (!attendance.length) return;
    if (!stream.streamId) return;

    intervalAttendance.current = setInterval(
      () => {
        saveAttendance(auth.accessToken, stream, attendance);
      },
      1000 * 60 * 5 // every 5 minutes
    );

    return () => {
      if (intervalAttendance.current) {
        clearInterval(intervalAttendance.current);
      }
    };
  }, [auth, stream, isStreamLive, attendance]);

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
          setAttendance,
        },
        stream: {
          isLive: isStreamLive,
          setLive,
        },
      }}
    >
      {children}
    </TwitchContext.Provider>
  );
}

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
