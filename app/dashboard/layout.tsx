"use client";

import browserStorage from "store";
import { useRouter } from "next/navigation";

import TopBar from "@/components/common/topbar";

import { PersistAuth } from "@/types/persist";

import { Fira_Mono } from "next/font/google";
import StoreProvider from "@/contexts/store";

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

  const handleLogout = async () => {
    browserStorage.remove(PersistAuth.name);
    router.push("/");
  };

  return (
    <StoreProvider>
      <div className={`mx-4 my-8 md:mx-32 ${firaMono.className}`}>
        <TopBar handleLogout={handleLogout} />

        {children}
      </div>
    </StoreProvider>
  );
}
