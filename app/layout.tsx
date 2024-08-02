'use client';

import { Inter } from "next/font/google";

import StoreProvider from "@/context/store";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-col">
          <StoreProvider>
            {children}
          </StoreProvider>
        </main>
      </body>
    </html >
  );
}
