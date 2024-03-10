'use client'

import tmi from "tmi.js";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Channel, Chatters, ChattersPresent, UserSession } from "./types";
import Card from "@/components/card";
import GearIcon from '@/public/gear.svg'
import packageJson from '@/package.json'

export default function Home() {
  const scopes = 'user:read:email moderator:manage:shoutouts moderator:read:followers chat:read chat:edit channel:moderate whispers:read whispers:edit channel_editor user:write:chat user:read:moderated_channels'

  const [token, setToken] = useState("")
  const [session, setSession] = useState<UserSession>({
    id: "",
    name: "",
    image: "",
  });
  const [mySession, setMySession] = useState<UserSession>({
    id: "",
    name: "",
    image: "",
  });

  const [chatters, setChatters] = useState<Chatters[]>([]);
  const [chattersTemp, setChattersTemp] = useState<any>();
  const [chattersPresent, setChattersPresent] = useState<ChattersPresent>({});
  const [chattersWhitelist, setChattersWhitelist] = useState<string>('');

  const [channels, setChannels] = useState<Channel[]>([]);

  const [stateChattersWhitelist, setStateChattersWhitelist] = useState<string>('');

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);

  useEffect(() => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        setSession(JSON.parse(localStorage.getItem("userSession") || ""))
        setMySession(JSON.parse(localStorage.getItem("mySession") || ""))
      }
      setToken(accessToken || "")

      const savedChatters = localStorage.getItem('chattersPresent') ? JSON.parse(localStorage.getItem('chattersPresent') || '') : {};
      setChattersPresent(savedChatters)

      const whitelistedChatters = localStorage.getItem('chattersWhitelist') || '';
      setChattersWhitelist(whitelistedChatters)
      setStateChattersWhitelist(whitelistedChatters)

      const savedChannels = localStorage.getItem('userChannelModerated') ? JSON.parse(localStorage.getItem('userChannelModerated') || '') : [];
      setChannels(savedChannels)

      localStorage.setItem('appVersion', packageJson.version)
    } catch (error) {
      localStorage.clear()
    }
  }, [])

  useEffect(() => {
    if (!token) {
      return
    }

    if (!session.name) {
      return
    }

    try {
      const client = new tmi.Client({
        options: { debug: false, skipUpdatingEmotesets: true },
        identity: {
          username: session.name,
          password: `oauth:${token}`,
        },
        channels: [session.name],
      });

      client.connect();

      client.on("message", async (channel, tags, message, self) => {
        if (self) return;

        // skip yg whitelisted
        // 'nightbot,sunnyeggbot' => ['nightbot','sunnyeggbot']
        if (stateChattersWhitelist.length > 0) {
          const arrayWhitelist = stateChattersWhitelist.split(',')
          if (arrayWhitelist.find(c => c === tags["display-name"]?.toLowerCase())) {
            return;
          }
        }

        // skip yg sudah hadir
        if (Object.keys(chattersPresent).length > 0) {
          if (tags["display-name"]) {
            if (chattersPresent[tags["display-name"]]) {
              return;
            }
          }
        }

        const resUser = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users?id=${tags["user-id"]}&multiple=true`, {
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

      setSuccess([...success, `Connected to: #${session.name}`])

      return () => {
        client.disconnect()
      }
    } catch (error: any) {
      setErrors([...errors, error.message])
    }
  }, [session])

  useEffect(() => {
    if (chattersTemp) {
      setChatters([...chatters, chattersTemp])
    }
  }, [chattersTemp])

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

    setChattersTemp(chatter)
  }

  const setShownChatter = (id: string, shown: boolean) => {
    const chatter = chatters.find((c) => c.id === id)
    if (chatter) {
      chatter.shown = shown
      setChatters([...chatters, chatter])
    }
  }

  const logout = async () => {
    localStorage.removeItem('chattersPresent')
    localStorage.removeItem('userSession')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('appVersion')
    localStorage.removeItem('userChannelModerated')
    setSuccess([...success, `Logging out...`])
    location.reload()
  }

  const reset = async () => {
    localStorage.removeItem('chattersPresent')
    setSuccess([...success, `Reset attendance success`])
    location.reload()
  }

  const shoutout = async (name: string, idx: number) => {
    const btn = document.getElementById(`shoutout_btn_${idx}`)
    const btnCopy = btn?.innerHTML;
    if (btn) {
      btn.innerHTML = ''
      const loading = document.createElement('div')
      loading.className = "loading loading-spinner loading-sm"
      btn.appendChild(loading)
    }

    try {
      const resChat = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat`, {
        headers: {
          token
        },
        body: JSON.stringify({
          from: session.id,
          to: name,
          by: mySession.id
        }),
        method: "POST",
      })
      if (!resChat.ok) {
        const resChatJson = await resChat.json()
        throw new Error(resChatJson.error)
      }
    } catch (error: any) {
      setErrors([...errors, error.message])
    } finally {
      if (btn) btn.innerHTML = btnCopy || ''
      setSuccess([...success, `Shouted: ${name}`])
    }
  }

  const openWhitelistModal = () => {
    const modal = document.getElementById('whitelist_modal')
    if (modal) {
      // @ts-ignore
      modal.showModal()
    }
  }

  const onChangeWhitelist = (e: any) => {
    setStateChattersWhitelist(e.target.value)
  }

  const onSaveWhitelist = () => {
    setChattersWhitelist(stateChattersWhitelist)
    localStorage.setItem('chattersWhitelist', stateChattersWhitelist)
    setSuccess([...success, `Blacklist saved`])
    location.reload()
  }

  const onCloseWhitelist = () => {
    setStateChattersWhitelist(chattersWhitelist)
  }

  const openModalChannel = async () => {
    const modalChannel = document.getElementById('channel_modal')
    if (modalChannel) {
      // @ts-ignore
      modalChannel.showModal()
    }
  }

  const onChooseChannel = async (ch: Channel) => {
    const currentSession = {
      id: ch.broadcaster_id,
      name: ch.broadcaster_name,
      image: ch.broadcaster_image
    }
    setSession(currentSession)
    localStorage.setItem("userSession", JSON.stringify(currentSession))
    setSuccess([...success, `Changed channel to: #${ch.broadcaster_name}`])
    localStorage.removeItem('chattersPresent')
  }

  return (
    <main className="px-4 py-4 lg:px-40 h-min-screen">
      <section className="rounded-lg p-2 border-2 border-slate-500 mb-4">
        {session.name ? (
          <div className="flex justify-between items-center">
            <button className="btn flex items-center space-x-2" onClick={async () => await openModalChannel()}>
              <div className="avatar">
                <div className="rounded-full">
                  <Image
                    src={session.image || ""}
                    width={30}
                    height={30}
                    alt="Profile"
                  />
                </div>
              </div>
              <p><b>{session.name}</b></p>
            </button>

            <details className="dropdown dropdown-bottom dropdown-end">
              <summary className="btn m-2">
                <Image alt="gear icon" src={GearIcon} width={25} height={25} className="dark:invert" />
              </summary >
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32 space-y-2">
                <li> <button className="btn hover" onClick={() => openWhitelistModal()}>
                  Blacklist
                </button></li>
                <li> <button className="btn btn-error" onClick={() => reset()}>
                  Reset Attendance
                </button></li>
                <li><button className="btn hover:btn-error" onClick={() => logout()}>
                  Logout
                </button></li>
              </ul>
            </details>

            <dialog id="channel_modal" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Choose a Channel</h3>

                <div className="mb-4 space-y-2">
                  <h4>You:</h4>

                  <form method="dialog" className="flex flex-wrap justify-between">
                    <button className="space-x-2 mb-2" onClick={() => onChooseChannel({
                      broadcaster_id: mySession.id,
                      broadcaster_name: mySession.name,
                      broadcaster_image: mySession.image,
                      broadcaster_login: mySession.name
                    })}>
                      <div className="flex border-2 border-slate-500 rounded-md p-2 space-x-2 items-center">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-md">
                            <Image
                              src={mySession.image || ""}
                              width={100}
                              height={100}
                              alt="My Channel Profile"
                              priority
                            />
                          </div>
                        </div>
                        <div>{mySession.name}</div>
                      </div>
                    </button>
                  </form>
                </div>

                <div className="mb-4 space-y-2">
                  <h4>Channels You Moderated:</h4>

                  <form method="dialog" className="flex flex-wrap justify-between">
                    {
                      channels.length ? channels.map((c, idx) => {
                        return <div key={idx}>
                          <button className="mb-2" onClick={() => onChooseChannel(c)}>
                            <div className="flex border-2 border-slate-500 rounded-md p-2 space-x-2 items-center">
                              <div className="avatar">
                                <div className="w-10 h-10 rounded-md">
                                  <Image
                                    src={c.broadcaster_image || ""}
                                    width={100}
                                    height={100}
                                    alt="Channel Profile"
                                    priority
                                  />
                                </div>
                              </div>
                              <div>{c.broadcaster_name}</div>
                            </div>
                          </button>
                        </div>
                      }) : ''
                    }
                  </form>
                </div>

                <div className="modal-action">
                  <form method="dialog">
                    <button className="btn">Close</button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
        ) : (
          <div className="flex justify-end items-center space-x-2">
            <a className="btn"
              href={`https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/twitch&scope=${scopes}`}
            >Login With Twitch</a>
          </div>
        )}

        <dialog id="whitelist_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Whitelist Chatter</h3>
            <p className="py-4">{"Whitelist your chatter so they don't show up (ex: Nightbot)"}</p>
            <form action="">
              <div className="space-y-2">
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      type="text"
                      name="whitelist-chatter"
                      className="block flex-1 border-0 p-2 text:white bg-transparent"
                      placeholder="split by comma (,)"
                      value={stateChattersWhitelist}
                      onChange={(val) => onChangeWhitelist(val)}
                    />
                  </div>
                </div>
              </div>
            </form>
            <div className="modal-action">
              <form method="dialog" className="space-x-2">
                <button type="submit" className="btn btn-success" onClick={() => onSaveWhitelist()}>Save</button>
                <button className="btn" onClick={() => onCloseWhitelist()}>Close</button>
              </form>
            </div>
          </div>
        </dialog>
      </section>

      <section className="rounded-lg p-2 border-2 border-slate-500 mb-4 space-y-4 min-h-[60vh]">
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
      </section>

      {Object.keys(chattersPresent).length > 0 ? <section className="rounded-lg p-2 border-2 border-slate-500 space-y-4 animate__animated animate__fadeIn">
        <div>
          <p>Yang sudah hadir:</p>
          {Object.entries(chattersPresent).map((chatter, idx) => {
            return (
              <p key={idx}>- {chatter[1].name}</p>
            )
          })}
        </div>
      </section> : ''}

      <section className="text-center mt-4">
        <p>Have feedbacks? Slide me <a href="https://twitter.com/_sunnyegg" className="link" target="_blank">DM</a></p>
        <p>Made with ❤️‍🩹</p>
        <p className="text-xs">App Version: {packageJson.version}</p>
      </section>

      {/* toast */}
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
            <div id={`err_${idx}`} key={idx} className="alert alert-error">
              <span>{err}</span>
            </div>
          )
        })}
        {success.map((s, idx) => {
          setTimeout(() => {
            const successAlert = document.getElementById(`success_${idx}`)
            if (successAlert) {
              successAlert.classList.add('animate')
              successAlert.classList.add('animate__fadeOut')
              setTimeout(() => {
                const removedSuccess = success.splice(idx, 1)
                setErrors(removedSuccess)
              }, 100);
            }
          }, 3000);
          return (
            <div id={`success_${idx}`} key={idx} className="alert alert-success">
              <span>{s}</span>
            </div>
          )
        })}
      </div>
      {/* toast */}
    </main>
  );
}
