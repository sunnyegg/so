'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { UserSession } from "./types";

export default function Home() {
  const scopes = 'user:read:email moderator:manage:shoutouts user:read:chat user:write:chat moderator:read:followers'
  const [session, setSession] = useState<UserSession>({
    id: "",
    type: "",
    name: "",
    image: "",
    username: "",
    description: "",
    followers: 0,
    lastStreamed: "",
  });


  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      setSession(JSON.parse(localStorage.getItem("userSession") || ""))
    }
  }, [])

  const logout = () => {
    localStorage.clear()
    location.reload()
  }

  return (
    <main className="px-5 py-5 lg:px-40 h-[100vh]">
      <section className="rounded-lg p-3 border-2 border-slate-500 mb-5">
        {session.name ? (
          <div className="flex justify-between">
            <div className="flex items-center space-x-3">
              <div className="avatar">
                <div className="rounded-full">
                  <Image
                    src={session.image || ""}
                    width={40}
                    height={40}
                    alt="Profile"
                  />
                </div>
              </div>
              <p><b>{session.name}</b></p>
            </div>

            <button className="btn hover:btn-error" onClick={() => logout()}>
              Logout
            </button>
          </div>
        ) : (
          <div className="flex justify-end items-center space-x-3">
            <a className="btn" href={`https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=http://localhost:3000/api/auth/callback/twitch&scope=${scopes}`}>Login With Twitch</a>
          </div>
        )}
      </section>

      <section className="rounded-lg p-3 border-2 border-slate-500 space-y-5 h-[75vh]">
        {session.name ? <div className="rounded-lg p-4 bg-slate-100 animate__animated animate__fadeInDown">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="avatar">
                <div className="rounded-lg border-2 border-lime-300 w-20 h-20">
                  <Image
                    src={session.image || ""}
                    width={100}
                    height={100}
                    alt="Profile"
                    priority
                  />
                </div>
              </div>
              <div>
                <p className="text-slate-700 font-bold">{session.name}</p>
                <p className="text-slate-700 text-xs mb-2">{session.followers} Followers</p>
                <p className="text-slate-700 text-xs">Last Streamed: <b>{session.lastStreamed}</b></p>
              </div>
            </div>

            <div className="text-center">
              <button className="btn hover:bg-lime-200 hover:border-lime-200 bg-lime-300 border-lime-300 text-slate-700">
                Shoutout
              </button>
            </div>
          </div>
        </div> : ''}
      </section>

      <section className="text-center mt-4">
        <p>Have feedbacks? Slide me <a href="https://twitter.com/_sunnyegg" className="link" target="_blank">DM</a></p>
        <p>Made with ❤️‍🩹</p>
      </section>
    </main>
  );
}
