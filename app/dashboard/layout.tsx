"use client";

import { useEffect } from "react";
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

let socket: Socket;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];

  useEffect(() => {
    if (!auth.accessToken) return;
    socketInitializer();

    return () => {
      socket.disconnect();
    };
  }, [auth]);

  const socketInitializer = async () => {
    await fetch(`/api/chat/connect?channel=${auth.user.login}`, {
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
      },
    });

    socket = io();
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("chat", (msg) => {
      console.log(msg);
    });
  };

  return (
    <div className={`mx-4 my-8 md:mx-32 ${firaMono.className}`}>
      <TopBar />

      {children}
    </div>
  );
}
