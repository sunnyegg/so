"use client";

import { useEffect, useRef } from "react";
import browserStorage from "store";
import { useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";

import TopBar from "@/components/common/topbar";

import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { PersistAuth } from "@/types/persist";

import { Fira_Mono } from "next/font/google";

const firaMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const socket = useRef<Socket>();

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];

  useEffect(() => {
    if (!auth.accessToken) return;

    socketInitializer();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = undefined;
      }
    };
  }, [auth]);

  const socketInitializer = async () => {
    if (socket.current) return;

    await fetch(`/api/chat/connect?channel=${auth.user.login}`, {
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
      },
    });

    socket.current = io();
    socket.current.on("connect", () => {
      console.log("connected");
    });
    socket.current.on("chat-" + auth.user.login, (msg) => {
      console.log(msg);
    });
  };

  const handleLogout = async () => {
    browserStorage.remove(PersistAuth.name);
    router.push("/");
  };

  return (
    <div className={`mx-4 my-8 md:mx-32 ${firaMono.className}`}>
      <TopBar handleLogout={handleLogout} />

      {children}
    </div>
  );
}
