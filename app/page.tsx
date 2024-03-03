'use client'

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="px-5 py-5 lg:px-40 h-[100vh]">
      <section className="rounded-lg p-3 border-2 border-slate-500 mb-5">
        {session?.user ? (
          <div className="flex justify-between">
            <div className="flex items-center space-x-3">
              <div className="avatar">
                <div className="rounded-full">
                  <Image
                    src={session?.user.image || ""}
                    width={40}
                    height={40}
                    alt="Profile"
                  />
                </div>
              </div>
              <p><b>{session?.user.name}</b></p>
            </div>

            <button className="btn hover:btn-error" onClick={() => signOut()}>
              Logout
            </button>
          </div>
        ) : (
          <div className="flex justify-end items-center space-x-3">
            <button className="btn" onClick={() => signIn("twitch")}>Login with Twitch</button>
          </div>
        )}
      </section>

      <section className="rounded-lg p-3 border-2 border-slate-500 space-y-5 h-[75vh]">
        {session?.user ? <div className="rounded-lg p-3 bg-slate-100 animate__animated animate__fadeInDown">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="avatar">
                <div className="rounded-lg bg-lime-300 w-20 h-20">
                  {/* img */}
                </div>
              </div>
              <div>
                <p className="text-slate-700 font-bold">{session?.user?.name}</p>
                <p className="text-slate-700 text-xs mb-2">300 Followers</p>
                <p className="text-slate-700 text-xs">Last Streamed: <b>Monster Hunter: World</b> (1d Ago)</p>
              </div>
            </div>

            <div className="space-x-0 space-y-3 md:space-y-0 md:space-x-3 text-center">
              <button className="btn hover:bg-lime-200 hover:border-lime-200 bg-lime-300 border-lime-300 text-slate-700">
                Shoutout
              </button>
              <button className="btn btn-outline hover:bg-lime-200 hover:border-lime-200 border-lime-300 text-slate-700">
                Follow
              </button>
            </div>
          </div>
        </div> : ''}
      </section>

      <section className="text-center mt-4">
        <p>Have feedbacks? Slide me <a href="https://twitter.com/_sunnyegg" className="link" target="_blank">DM</a></p>
        <p>Made with ❤️‍🩹 by sunnyegg</p>
      </section>
    </main>
  );
}
