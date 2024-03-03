import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'animate.css';
import Provider from "@/components/Provider";

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
      <body className={inter.className + " background"}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
