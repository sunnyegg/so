'use client'

import tmi from "tmi.js";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Chatters, ChattersPresent, UserSession } from "./types";
import Card from "@/components/card";

export default function Home() {
  const scopes = 'user:read:email moderator:manage:shoutouts moderator:read:followers chat:read chat:edit channel:moderate whispers:read whispers:edit channel_editor user:write:chat'

  const [token, setToken] = useState("")
  const [session, setSession] = useState<UserSession>({
    id: "",
    name: "",
    image: "",
  });

  const [chatters, setChatters] = useState<Chatters[]>([]);
  const [chattersPresent, setChattersPresent] = useState<ChattersPresent>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      setSession(JSON.parse(localStorage.getItem("userSession") || ""))
    }
    setToken(accessToken || "")

    const savedChatters = localStorage.getItem('chattersPresent') ? JSON.parse(localStorage.getItem('chattersPresent') || '') : {};
    setChattersPresent(savedChatters)
  }, [])

  useEffect(() => {
    if (!session.name) {
      return
    }

    const client = new tmi.Client({
      options: { debug: false },
      identity: {
        username: session.name,
        password: `oauth:${token}`,
      },
      channels: [session.name],
    });

    client.connect();

    client.on("message", async (channel, tags, message, self) => {
      if (self) return;

      // skip yg sudah hadir
      if (Object.keys(chattersPresent).length > 0) {
        if (tags["display-name"]) {
          if (chattersPresent[tags["display-name"]]) {
            return;
          }
        }
      }

      const resUser = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users?id=${tags["user-id"]}`, {
        headers: { token }
      })
      if (!resUser.ok) {
        const errUser = await resUser.json()
        setErrors([...errors, errUser.error])
      }

      const resChannel = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/channels?broadcasterId=broadcaster_id=${tags["user-id"]}`, {
        headers: { token }
      })
      if (!resChannel.ok) {
        const errChannel = await resChannel.json()
        setErrors([...errors, errChannel.error])
      }

      const resFollower = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/followers?broadcasterId=broadcaster_id=${tags["user-id"]}`, {
        headers: { token }
      })
      if (!resFollower.ok) {
        const errFollower = await resFollower.json()
        setErrors([...errors, errFollower.error])
      }

      const { data: userData } = await resUser.json()
      const { data: channelData } = await resChannel.json()
      const { data: followerData } = await resFollower.json()

      saveChatter(tags, userData, followerData, channelData)

      // save yg udah hadir
      if (tags["display-name"]) {
        chattersPresent[tags["display-name"]] = {
          name: tags["display-name"],
          shoutout: false
        }
      }

      localStorage.setItem('chattersPresent', JSON.stringify(chattersPresent))
    });

    return () => {
      client.disconnect()
    }
  }, [token])

  const saveChatter = (tags: any, userData: any, followerData: any, channelData: any) => {
    const chatter: Chatters = {
      id: tags["user-id"] || "",
      type: "",
      name: tags["display-name"] || "",
      image: userData.data[0].profile_image_url,
      username: tags.username || "",
      followers: followerData.total,
      description: "",
      lastStreamed: channelData.data[0].game_name,
      shown: false
    }

    setChatters([...chatters, chatter])
  }

  const setShownChatter = (id: string, shown: boolean) => {
    const chatter = chatters.find((c) => c.id === id)
    if (chatter) {
      chatter.shown = shown
      setChatters([...chatters, chatter])

      setTimeout(() => {
        setChatters(chatters.filter(c => !c.shown))
      }, 2000);
    }
  }

  const logout = async () => {
    localStorage.clear()
    location.reload()
  }

  const reset = async () => {
    localStorage.removeItem('chattersPresent')
    location.reload()
  }

  const shoutout = async (id: string, name: string, idx: number) => {
    const btn = document.getElementById(`shoutout_btn_${idx}`)
    if (btn) {
      btn.innerHTML = ''
      const loading = document.createElement('div')
      loading.className = "loading loading-spinner loading-sm"
      btn.appendChild(loading)
    }

    try {
      const resShoutout = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/shoutout`, {
        headers: {
          token
        },
        body: JSON.stringify({
          from: session.id,
          to: id,
          by: session.id
        }),
        method: "POST"
      })
      if (!resShoutout.ok) {
        const resShoutoutJson = await resShoutout.json()
        throw new Error(resShoutoutJson.error)
      }

      const resChat = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat`, {
        headers: {
          token
        },
        body: JSON.stringify({
          from: session.id,
          to: name,
        }),
        method: "POST",
      })
      if (!resChat.ok) {
        const resChatJson = await resChat.json()
        throw new Error(resChatJson.error)
      }

      chattersPresent[name] = {
        name,
        shoutout: true
      }
      setChattersPresent(chattersPresent)
    } catch (error: any) {
      setErrors([...errors, error.message])
    } finally {
      if (btn) btn.innerHTML = "Shoutout"
    }
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

            <div className="space-x-2">
              <button className="btn btn-error" onClick={() => reset()}>
                Reset
              </button>

              <button className="btn hover:btn-error" onClick={() => logout()}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end items-center space-x-3">
            <a className="btn"
              href={`https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/twitch&scope=${scopes}`}
            >Login With Twitch</a>
          </div>
        )}
      </section>

      <section className="rounded-lg p-3 border-2 border-slate-500 mb-5 space-y-5 min-h-[60vh]">
        {chatters.length ?
          <>
            {chatters.map((chat, idx) => {
              return (!chat.shown ? <Card chat={chat} idx={idx} shoutout={shoutout} key={idx} setShownChatter={setShownChatter} /> : '')
            })
            }
          </>
          : <>
            {token ? <div className="justify-center items-center flex space-x-2 pt-2 animate__animated animate__fadeIn">
              <p>Waiting for someone to chat</p>
              <span className="loading loading-dots loading-sm"></span>
            </div> : ""}
          </>}

        <div className="toast">
          {errors.map((err, idx) => {
            setTimeout(() => {
              const errAlert = document.getElementById(`err_${idx}`)
              if (errAlert) {
                errAlert.classList.add('animate')
                errAlert.classList.add('animate__fadeOut')
                setTimeout(() => {
                  const removedErr = errors.splice(idx, 1)
                  setErrors(removedErr)
                }, 100);
              }
            }, 3000);
            return (
              <div id={`err_${idx}`} key={`err_${idx}`} className="alert alert-error">
                <span>{err}</span>
              </div>
            )
          })}
        </div>
      </section>

      {Object.keys(chattersPresent).length > 0 ? <section className="rounded-lg p-3 border-2 border-slate-500 space-y-5 animate__animated animate__fadeIn">
        {Object.entries(chattersPresent).map((chatter, idx) => {
          return (
            <div key={idx}>
              <p>Yang sudah hadir:</p>
              <div>- {chatter[1].name} ({chatter[1].shoutout ? 'shouted' : 'not shouted'})</div>
            </div>
          )
        })}
      </section> : ''}

      <section className="text-center mt-4">
        <p>Have feedbacks? Slide me <a href="https://twitter.com/_sunnyegg" className="link" target="_blank">DM</a></p>
        <p>Made with ❤️‍🩹</p>
      </section>
    </main>
  );
}
