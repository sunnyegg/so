"use client";

import TopBar from "@/app/components/topbar";

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
  return (
    <div className={`mx-4 my-8 md:mx-32 ${firaMono.className}`}>
      <TopBar />

      {children}
    </div>
  );
}
