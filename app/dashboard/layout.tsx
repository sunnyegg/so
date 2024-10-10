"use client";

import { useContext, useEffect, useRef, useState } from "react";
import browserStorage from "store";
import { useRouter } from "next/navigation";
import { Fira_Mono } from "next/font/google";

import { ChatClient } from "@twurple/chat";
import { EventSubWsListener } from "@twurple/eventsub-ws";

import TopBar from "@/components/common/topbar";
import Divider from "@/components/common/divider";
import { toast } from "@/components/ui/use-toast";
import StreamCard from "@/app/dashboard/components/stream";

import { Auth } from "@/types/auth";
import { Settings } from "@/types/settings";
import { Channel, ModeratedChannel, SelectedChannel } from "@/types/channel";
import {
  PersistAttendance,
  PersistAuth,
  PersistChannel,
} from "@/types/persist";

import StoreProvider from "@/contexts/store";
import { TwitchContext } from "@/contexts/twitch";

import usePersistState from "@/hooks/use-persist-state";

import { NewChatClient, NewEventSubWsClient } from "@/lib/twitch";

const firaMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type RefreshTokenResponse = {
  status: boolean;
  data: Auth;
};

type ModeratedChannelResponse = {
  status: boolean;
  data: ModeratedChannel[];
};

type ChannelResponse = {
  status: boolean;
  data: Channel;
};

type SettingsResponse = {
  status: boolean;
  data: Settings;
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const [moderatedChannels, setModeratedChannels] = useState<
    ModeratedChannel[]
  >([]);

  const [auth, setAuth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth, React.Dispatch<React.SetStateAction<Auth>>];
  const [channel, setChannel] = usePersistState(
    PersistChannel.name,
    PersistChannel.defaultValue
  ) as [SelectedChannel, React.Dispatch<React.SetStateAction<SelectedChannel>>];

  const interval = useRef<NodeJS.Timeout | null>(null);
  const chatClient = useRef<ChatClient | undefined>(undefined);
  const eventSubWsClient = useRef<EventSubWsListener | undefined>(undefined);

  const { chat, stream } = useContext(TwitchContext);

  const handleRefreshToken = async (token: string) => {
    const res = await fetch(`/api/auth/refresh-token?token=${token}`, {
      method: "GET",
    });
    if (!res.ok) {
      toast({
        title: "Failed to refresh token",
        variant: "destructive",
        duration: 3000,
      });
      setTimeout(() => {
        handleLogout();
      }, 3100);
      return;
    }

    const data = (await res.json()) as RefreshTokenResponse;
    const user = auth.user;
    setAuth({ ...data.data, user });
    router.refresh();
  };

  const handleLogout = () => {
    browserStorage.remove(PersistAuth.name);
    browserStorage.remove(PersistAttendance.name);
    browserStorage.remove(PersistChannel.name);
    router.replace("/");
  };

  const handleConnectChat = async (token: string, channel: string) => {
    if (chat.isConnectedChat) return;

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
      console.log(user, text);
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

      chat.addToShoutout(
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
      chat.setIsConnectedChat(true);
      toast({
        title: "Connected to chat",
        variant: "success",
        duration: 3000,
      });
    });

    chatClient.current.onDisconnect(() => {
      chat.setIsConnectedChat(false);
      toast({
        title: "Disconnected from chat",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  const handleEventSub = async (token: string, userId: string) => {
    if (chat.isConnectedEventSub) return;

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
      stream.setLive(true);
      toast({
        title: "Stream Online",
        description: "You are now live",
        variant: "success",
        duration: 3000,
      });
      router.refresh();
    });

    eventSubWsClient.current.onStreamOffline(userId, (e) => {
      stream.setLive(false);
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

        chat.addToShoutout(
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
      chat.setIsConnectedEventSub(true);
      toast({
        title: "Connected to eventsub",
        variant: "success",
        duration: 3000,
      });
    });

    eventSubWsClient.current.onUserSocketDisconnect((_, error) => {
      console.log(error);
      chat.setIsConnectedEventSub(false);
      toast({
        title: "Disconnected from eventsub",
        variant: "destructive",
        duration: 3000,
      });
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
    const isExpired =
      auth.expiredAt && auth.expiredAt < new Date().toISOString();

    if (isExpired) {
      handleRefreshToken(auth.refreshToken);
    }

    interval.current = setInterval(
      () => {
        if (isExpired) {
          handleRefreshToken(auth.refreshToken);
        }
      },
      1000 * 60 * 5 // 5 minutes
    );

    if (auth.accessToken) {
      getModeratedChannels(auth.user.id, auth.accessToken).then((res) => {
        setModeratedChannels(res);
      });
    }

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [auth]);

  return (
    <StoreProvider>
      <div className={`mx-4 my-8 md:mx-32 ${firaMono.className}`}>
        <TopBar
          handleLogout={handleLogout}
          moderatedChannels={moderatedChannels}
          channel={channel}
          setChannel={setChannel}
        />

        <StreamCard channel={channel.login} />

        <Divider />

        {children}
      </div>
    </StoreProvider>
  );
}

const getModeratedChannels = async (userId: string, token: string) => {
  const res = await fetch(`/api/channel/moderated?userId=${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    toast({
      title: "Failed to get moderated channels",
      variant: "destructive",
      duration: 3000,
    });
    return [];
  }

  const data = (await res.json()) as ModeratedChannelResponse;

  if (!data.data.length) return [];

  return data.data;
};
