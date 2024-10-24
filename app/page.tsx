"use client";

import { Fira_Mono } from "next/font/google";

import TopBar from "@/components/common/topbar";
import LoginButton from "@/components/common/login-button";
import Footer from "@/components/common/footer";

const firaMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Home() {
  return (
    <div className="mx-4 my-8 md:mx-32">
      <TopBar />

      <section className={`mt-16 text-center md:mt-32 ${firaMono.className}`}>
        <h1 className="text-[0.82rem] font-bold md:text-[1.75rem]">
          Egg-perience the Sunny Side of Streaming!
        </h1>
        <span className="text-[0.5rem] text-so-secondary-text-color md:text-sm">
          —where every stream is a chance to create something egg-ceptional
        </span>

        <div className="mx-auto mt-8 w-fit rounded-lg bg-so-secondary-color p-4">
          <ul className="text-left text-[0.6rem] md:text-sm">
            <li>• Automatically shoutout chatters in your stream</li>
            <li>• Create an attendance for each of your stream</li>
            <li>...and more!</li>
          </ul>
        </div>
      </section>

      <section className="mt-8 flex items-center justify-center">
        <LoginButton
          className="px-4 py-2 font-bold"
          variant="streamegg-outline"
          text={"Let's Start Cooking"}
        />
      </section>

      <Footer />
    </div>
  );
}
