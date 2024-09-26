import { ChatClient } from "@twurple/chat";
import { createContext, useCallback, useEffect, useState } from "react";

import { toast } from "@/components/ui/use-toast";

import usePersistState from "@/hooks/use-persist-state";

import { NewChatClient, NewEventSubWsClient } from "@/lib/twitch";

import { Auth } from "@/types/auth";
import { Chatter } from "@/types/chat";
import { Channel } from "@/types/channel";
import { PersistAuth } from "@/types/persist";
import { EventSubWsListener } from "@twurple/eventsub-ws";

type ChannelResponse = {
  status: boolean;
  data: Channel;
};

type TwitchChatContextType = {
  isConnectedChat: boolean;
  chatters: Chatter[];
  attendance: Chatter[];
  removeFromShoutout: (id: string) => void;
};

type TwitchStreamContextType = {
  isLive: boolean;
  setIsLive: React.Dispatch<React.SetStateAction<boolean>>;
};

type TwitchContextType = {
  chat: TwitchChatContextType;
  stream: TwitchStreamContextType;
};

export const TwitchContext = createContext<TwitchContextType>({
  chat: {
    isConnectedChat: false,
    chatters: [],
    attendance: [],
    removeFromShoutout: () => {},
  },
  stream: {
    isLive: false,
    setIsLive: () => {},
  },
});

export default function TwitchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnectedChat, setIsConnectedChat] = useState(false);
  const [isConnectedEventSub, setIsConnectedEventSub] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [attendance, setAttendance] = useState<Chatter[]>([]);
  const alreadyPresent = new Map<string, Chatter>();

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];

  let chatClient: ChatClient | undefined;
  let eventSubWsClient: EventSubWsListener | undefined;

  const addToShoutout = useCallback((chatter: Chatter) => {
    if (alreadyPresent.has(chatter.login)) {
      return;
    }

    alreadyPresent.set(chatter.login, chatter);

    setChatters((prevChatters: Chatter[]) => [...prevChatters, { ...chatter }]);
    setAttendance((prevAttendance: Chatter[]) => [
      ...prevAttendance,
      { ...chatter },
    ]);
  }, []);

  const removeFromShoutout = useCallback((id: string) => {
    setChatters((prevChatters: Chatter[]) =>
      prevChatters.filter((item) => item.id !== id)
    );
  }, []);

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
    chatClient = NewChatClient(data.data, channel);
    chatClient.connect();

    // events
    chatClient.onMessage(async (ch, user, text) => {
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

      addToShoutout({
        id: Date.now().toString(),
        login: user,
        displayName: chatterData.data.displayName,
        followers: chatterData.data.followers,
        lastSeenPlaying: chatterData.data.gameName,
        profileImageUrl: chatterData.data.profileImageUrl,
        presentAt: new Date().toISOString(),
      });
    });

    chatClient.onConnect(() => {
      setIsConnectedChat(true);
      toast({
        title: "Connected to chat",
        variant: "success",
        duration: 3000,
      });
    });

    chatClient.onDisconnect(() => {
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
    eventSubWsClient = NewEventSubWsClient(data.data);
    eventSubWsClient.start();

    // events
    eventSubWsClient.onStreamOnline(userId, (e) => {
      setIsLive(true);
      toast({
        title: "Stream Online",
        description: "You are now live",
        variant: "success",
        duration: 3000,
      });
    });

    eventSubWsClient.onChannelRedemptionAdd(userId, async (e) => {
      const chatterRes = await fetch(`/api/channel/info?login=${e.userName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!chatterRes.ok) {
        console.log("Failed to get chatter info", await chatterRes.json());
        return;
      }

      const chatterData = (await chatterRes.json()) as ChannelResponse;

      addToShoutout({
        id: Date.now().toString(),
        login: e.userName,
        displayName: chatterData.data.displayName,
        followers: chatterData.data.followers,
        lastSeenPlaying: chatterData.data.gameName,
        profileImageUrl: chatterData.data.profileImageUrl,
        presentAt: new Date().toISOString(),
      });
    });

    eventSubWsClient.onUserSocketConnect(() => {
      setIsConnectedEventSub(true);
      toast({
        title: "Connected to eventsub",
        variant: "success",
        duration: 3000,
      });
    });

    eventSubWsClient.onUserSocketDisconnect(() => {
      setIsConnectedEventSub(false);
      toast({
        title: "Disconnected from eventsub",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  useEffect(() => {
    if (auth.accessToken && isLive) {
      handleConnectChat(auth.accessToken, auth.user.login);
    }

    return () => {
      chatClient?.quit();
    };
  }, [auth, isLive]);

  useEffect(() => {
    if (auth.accessToken) {
      handleEventSub(auth.accessToken, auth.user.id);
    }

    return () => {
      eventSubWsClient?.stop();
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
        },
        stream: {
          isLive,
          setIsLive,
        },
      }}
    >
      {children}
    </TwitchContext.Provider>
  );
}
