import { Metadata } from "next";
import { Fira_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

const fira = Fira_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "StreamEGG",
  description: "StreamEGG is a platform that allows you to create a custom stream experience for your Twitch stream!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fira.className}>
        <main className="flex flex-col">
          {children}
        </main>

        <Toaster />
      </body>
    </html >
  );
}
