import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "animate.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shoutout Tool",
  description: "Shoutout Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-col px-4 py-4 lg:px-40">
          {children}
        </main>
      </body>
    </html >
  );
}
