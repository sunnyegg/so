"use client";

import { useEffect, useRef } from "react";
import browserStorage from "store";
import { useRouter } from "next/navigation";
import { Fira_Mono } from "next/font/google";

import TopBar from "@/components/common/topbar";
import { toast } from "@/components/ui/use-toast";

import { Auth } from "@/types/auth";
import {
  PersistAttendance,
  PersistAuth,
  PersistChannel,
} from "@/types/persist";

import StoreProvider from "@/contexts/store";

import usePersistState from "@/hooks/use-persist-state";

const firaMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type RefreshTokenResponse = {
  status: boolean;
  data: Auth;
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [auth, setAuth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth, React.Dispatch<React.SetStateAction<Auth>>];

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
    router.refresh();
  };

  const handleLogout = () => {
    browserStorage.remove(PersistAuth.name);
    browserStorage.remove(PersistAttendance.name);
    browserStorage.remove(PersistChannel.name);
    router.replace("/");
  };

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

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [auth]);

  return (
    <StoreProvider>
      <div className={`mx-4 my-8 md:mx-32 ${firaMono.className}`}>
        <TopBar handleLogout={handleLogout} />

        {children}
      </div>
    </StoreProvider>
  );
}
