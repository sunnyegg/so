"use client";

import React, { useEffect, useRef, useState } from "react";
import browserStorage from "store";
import { useRouter } from "next/navigation";
import { Fira_Mono } from "next/font/google";

import TopBar from "@/components/common/topbar";
import Divider from "@/components/common/divider";
import { toast } from "@/components/ui/use-toast";
import StreamCard from "@/app/dashboard/components/stream";

import { Auth } from "@/types/auth";
import { ModeratedChannel, SelectedChannel } from "@/types/channel";
import {
  PersistAttendance,
  PersistAuth,
  PersistChannel,
  PersistVersion,
} from "@/types/persist";

import StoreProvider from "@/contexts/store";

import usePersistState from "@/hooks/use-persist-state";

import packageJson from "@/package.json";

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
  const [_, setVersion] = usePersistState(
    PersistVersion.name,
    PersistVersion.defaultValue
  ) as [string, React.Dispatch<React.SetStateAction<string>>];

  const interval = useRef<NodeJS.Timeout | null>(null);

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

    window.location.reload();
  };

  const handleLogout = () => {
    browserStorage.remove(PersistAuth.name);
    browserStorage.remove(PersistAttendance.name);
    browserStorage.remove(PersistChannel.name);
    router.replace("/");
  };

  useEffect(() => {
    if (!auth.accessToken) return;

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

    getModeratedChannels(auth.user.id, auth.accessToken).then((res) => {
      setModeratedChannels(res);
    });

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [auth]);

  useEffect(() => {
    const version =
      browserStorage.get("version") &&
      JSON.parse(browserStorage.get("version"));

    if (!version || version !== packageJson.version) {
      setVersion(packageJson.version);
    }
  }, []);

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
