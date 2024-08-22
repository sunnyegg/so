"use client";

import { Fira_Mono } from "next/font/google";

import TopBar from "@/components/common/topbar";
import AuthButton from "@/components/auth/button";
import StoreProvider from "@/context/store";

const firaMono = Fira_Mono({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function Home() {
  return (
    <StoreProvider>
      <div className="mx-4 md:mx-32 my-8">
        <TopBar />

        <section className={`mt-16 md:mt-32 text-center ${firaMono.className}`}>
          <h1 className="text-[0.82rem] md:text-[1.75rem] font-bold">
            Egg-perience the Sunny Side of Streaming!
          </h1>
          <span className="text-[0.5rem] md:text-sm text-so-secondary-text-color">—where every stream is a chance to create something egg-ceptional</span>

          <div className="mt-8 bg-so-secondary-color p-4 rounded-lg mx-auto w-fit">
            <ul className="text-left text-[0.6rem] md:text-sm">
              <li>• Automatically shoutout chatters in your stream</li>
              <li>• Create an attendance for each of your stream</li>
              <li>...and more!</li>
            </ul>
          </div>
        </section>

        <section className="mt-8 flex items-center justify-center">
          <AuthButton
            className="font-bold px-4 py-2"
            variant="streamegg-outline">
            Let's Start Cooking
          </AuthButton>
        </section>

        <section className="md:hidden absolute bottom-8 left-0 w-full flex gap-4 text-[0.8rem] justify-center">
          <div className="p-2 hover:bg-so-secondary-color hover:rounded-md transition-all">SUPPORT</div>
          <div className="p-2 hover:bg-so-secondary-color hover:rounded-md transition-all">ABOUT</div>
          <div className="p-2 hover:bg-so-secondary-color hover:rounded-md transition-all">HOW IT WORKS?</div>
        </section>
      </div>
    </StoreProvider>
  )
}
