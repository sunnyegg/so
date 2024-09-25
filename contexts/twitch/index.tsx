import { ChatClient } from "@twurple/chat";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

import { toast } from "@/components/ui/use-toast";

import usePersistState from "@/hooks/use-persist-state";

import { NewChatClient } from "@/lib/twitch";

import { Auth } from "@/types/auth";
import { Channel } from "@/types/channel";
import { PersistAuth } from "@/types/persist";

type Chatter = {
  id: string;
  login: string;
  displayName: string;
  followers: number;
  lastSeenPlaying: string;
  profileImageUrl: string | undefined;
};

type ChannelResponse = {
  status: boolean;
  data: Channel;
};

type TwitchChatContextType = {
  isConnectedChat: boolean;
  chatters: Chatter[];
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
  const [isLive, setIsLive] = useState(false);
  const [chatters, setChatters] = useState<Chatter[]>([]);

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];

  const chatClient = useRef<ChatClient>();

  const addToShoutout = useCallback((chatter: Chatter) => {
    setChatters((prevChatters: Chatter[]) => [...prevChatters, { ...chatter }]);
  }, []);

  const removeFromShoutout = useCallback((id: string) => {
    setChatters((prevChatters: Chatter[]) =>
      prevChatters.filter((item) => item.id !== id)
    );
  }, []);

  const handleConnectChat = async (token: string, channel: string) => {
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
      const id = Date.now().toString();

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
        id,
        login: user,
        displayName: chatterData.data.name,
        followers: chatterData.data.followers,
        lastSeenPlaying: chatterData.data.gameName,
        profileImageUrl: chatterData.data.profileImageUrl,
      });
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

  useEffect(() => {
    if (auth.accessToken && isLive) {
      handleConnectChat(auth.accessToken, auth.user.login);
    }

    return () => {
      chatClient.current?.quit();
    };
  }, [auth.accessToken, isLive]);

  return (
    <TwitchContext.Provider
      value={{
        chat: {
          isConnectedChat,
          chatters,
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
