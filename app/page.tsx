'use client'

import tmi from "tmi.js";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Chatters, ChattersPresent, UserSession } from "./types";

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

    const savedChatters = localStorage.getItem('chatters') ? JSON.parse(localStorage.getItem('chatters') || '') : {};
    setChattersPresent(savedChatters)
  }, [])

  useEffect(() => {
    if (!session.name) {
      return
    }

    const client = new tmi.Client({
      options: { debug: true },
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

      setChatters([...chatters, {
        id: tags["user-id"] || "",
        type: "",
        name: tags["display-name"] || "",
        image: userData.data[0].profile_image_url,
        username: tags.username || "",
        followers: followerData.total,
        description: "",
        lastStreamed: channelData.data[0].game_name,
      }])

      // save yg udah hadir
      if (tags["display-name"]) {
        chattersPresent[tags["display-name"]] = {
          name: tags["display-name"],
          shoutout: false
        }
      }

      localStorage.setItem('chatters', JSON.stringify(chattersPresent))
    });

    return () => {
      client.disconnect()
    }
  }, [token])

  const logout = async () => {
    localStorage.clear()
    location.reload()
  }

  const reset = async () => {
    localStorage.removeItem('chatters')
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
              href={`https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=http://localhost:3000/api/auth/callback/twitch&scope=${scopes}`}
            >Login With Twitch</a>
          </div>
        )}
      </section>

      <section className="rounded-lg p-3 border-2 border-slate-500 mb-5 space-y-5 min-h-[60vh]">
        {chatters.length > 0 ?
          <>
            {chatters.map((chat, idx) => {
              setTimeout(() => {
                const chatterCard = document.getElementById(`chatter_${idx}`)
                if (chatterCard) {
                  chatterCard.classList.remove('animate__fadeInDown')
                  chatterCard.classList.add('animate__fadeOut')
                  setTimeout(() => {
                    const removedChatter = chatters.splice(idx, 1)
                    setChatters(removedChatter)
                  }, 1000);
                }
              }, 5000);

              return (
                <div className="rounded-lg p-4 bg-slate-100 animate__animated animate__fadeInDown flex justify-between items-center"
                  key={idx} id={`chatter_${idx}`}>
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="rounded-lg border-2 border-lime-300 w-20 h-20">
                        <Image
                          src={chat.image || ""}
                          width={100}
                          height={100}
                          alt="Profile"
                          priority
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-700 font-bold">{chat.name}</p>
                      <p className="text-slate-700 text-xs mb-2">{chat.followers} Followers</p>
                      <p className="text-slate-700 text-xs">Last Streamed: <b>{chat.lastStreamed}</b></p>
                    </div>
                  </div>

                  <button className="btn text-center hover:bg-lime-200 hover:border-lime-200 bg-lime-300 border-lime-300 text-slate-700"
                    id={`shoutout_btn_${idx}`}
                    onClick={() => shoutout(chat.id, chat.name, idx)}
                  >
                    Shoutout
                  </button>
                </div>
              )
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
        {Object.entries(chattersPresent).map(chatter => {
          return (
            <div>
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
