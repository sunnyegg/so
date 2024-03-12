"use client";

import tmi from "tmi.js";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Channel, Chatters, ChattersPresent, UserSession } from "./types";
import Card from "@/components/card";
import GearIcon from "@/public/gear.svg";
import packageJson from "@/package.json";
import ModalBlacklist from "@/components/modalBlacklist";
import ModalChannel from "@/components/modalChannel";
import ModalShoutout from "@/components/modalShoutout";

export default function Home() {
  const scopes =
    "user:read:email moderator:manage:shoutouts moderator:read:followers chat:read chat:edit channel:moderate whispers:read whispers:edit channel_editor user:write:chat user:read:moderated_channels";

  const [token, setToken] = useState("");
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
  const [chattersBlacklist, setChattersBlacklist] = useState<string>("");

  const [channels, setChannels] = useState<Channel[]>([]);

  const [stateChattersBlacklist, setStateChattersBlacklist] =
    useState<string>(chattersBlacklist);

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);

  useEffect(() => {
    try {
      const accessToken = localStorage.getItem("accessToken") || "";

      if (accessToken) {
        const savedUserSession: UserSession = localStorage.getItem(
          "userSession"
        )
          ? JSON.parse(localStorage.getItem("userSession") || "")
          : {
            id: "",
            image: "",
            name: "",
          };
        setSession(savedUserSession);

        const savedMySession: UserSession = localStorage.getItem("mySession")
          ? JSON.parse(localStorage.getItem("mySession") || "")
          : {
            id: "",
            image: "",
            name: "",
          };
        setMySession(savedMySession);

        const savedChannels: Channel[] = localStorage.getItem(
          "userChannelModerated"
        )
          ? JSON.parse(localStorage.getItem("userChannelModerated") || "")
          : [
            {
              broadcaster_id: "",
              broadcaster_image: "",
              broadcaster_login: "",
              broadcaster_name: "",
            },
          ];
        setChannels(savedChannels);
      }
      setToken(accessToken);

      localStorage.setItem("appVersion", packageJson.version);
    } catch (error) {
      localStorage.clear();
    }
  }, []);

  useEffect(() => {
    // kehadiran per channel
    // delete after update
    const savedChatters = localStorage.getItem("chattersPresent");
    if (savedChatters) {
      localStorage.setItem(`chattersPresent-${session.id}`, savedChatters);
      localStorage.removeItem("chattersPresent");
    }

    const savedChattersPerChannel: ChattersPresent = localStorage.getItem(
      `chattersPresent-${session.id}`
    )
      ? JSON.parse(localStorage.getItem(`chattersPresent-${session.id}`) || "")
      : {};
    setChattersPresent(savedChattersPerChannel);

    // handle client lama yg pakai key whitelist
    // delete after update
    const whitelist = localStorage.getItem("chattersWhitelist");
    if (whitelist) {
      localStorage.setItem(`chattersBlacklist-${session.id}`, whitelist);
      localStorage.removeItem("chattersWhitelist");
    }

    const blacklistedChatters =
      localStorage.getItem(`chattersBlacklist-${session.id}`) || "";
    setChattersBlacklist(blacklistedChatters);
    setStateChattersBlacklist(blacklistedChatters);
  }, [session]);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!session.name) {
      return;
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

        // skip yg Blacklisted
        // 'nightbot,sunnyeggbot' => ['nightbot','sunnyeggbot']
        if (chattersBlacklist.length > 0) {
          const arrayBlacklist = chattersBlacklist.split(",");
          if (
            arrayBlacklist.find(
              (c) => c === tags["display-name"]?.toLowerCase()
            )
          ) {
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

        const resUser = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/users?id=${tags["user-id"]}&multiple=true`,
          {
            headers: { token },
          }
        );
        if (!resUser.ok) {
          const errUser = await resUser.json();
          setErrors([...errors, errUser.error]);
        }

        const resChannel = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/channels?broadcasterId=broadcaster_id=${tags["user-id"]}`,
          {
            headers: { token },
          }
        );
        if (!resChannel.ok) {
          const errChannel = await resChannel.json();
          setErrors([...errors, errChannel.error]);
        }

        const resFollower = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/followers?broadcasterId=broadcaster_id=${tags["user-id"]}`,
          {
            headers: { token },
          }
        );
        if (!resFollower.ok) {
          const errFollower = await resFollower.json();
          setErrors([...errors, errFollower.error]);
        }

        const { data: userData } = await resUser.json();
        const { data: channelData } = await resChannel.json();
        const { data: followerData } = await resFollower.json();

        saveChatter(tags, userData, followerData, channelData);

        // save yg udah hadir
        if (tags["display-name"]) {
          chattersPresent[tags["display-name"]] = {
            name: tags["display-name"],
            shoutout: false,
            image: userData.data[0].profile_image_url,
          };
        }

        localStorage.setItem(
          `chattersPresent-${session.id}`,
          JSON.stringify(chattersPresent)
        );
        setChattersPresent(chattersPresent);
      });

      setSuccess([...success, `Connected to: #${session.name}`]);

      return () => {
        client.disconnect();
      };
    } catch (error: any) {
      setErrors([...errors, error.message]);
    }
  }, [session]);

  useEffect(() => {
    if (chattersTemp) {
      setChatters([...chatters, chattersTemp]);
    }
  }, [chattersTemp]);

  // check every 2s for card that already timed out
  // idk about the impact in performance, let's see after release
  useEffect(() => {
    const filterOutShownChatter = chatters.filter((c) => !c.shown);
    const interval = setInterval(() => {
      setChatters(filterOutShownChatter);
    }, 2000);

    return () => clearInterval(interval);
  }, [chatters]);

  const saveChatter = (
    tags: any,
    userData: any,
    followerData: any,
    channelData: any
  ) => {
    const chatter: Chatters = {
      id: tags["user-id"] || "",
      type: "",
      name: tags["display-name"] || "",
      image: userData.data[0].profile_image_url,
      username: tags.username || "",
      followers: followerData.total,
      description: "",
      lastStreamed: channelData.data[0].game_name,
      shown: false,
    };

    setChattersTemp(chatter);
  };

  const setShownChatter = (id: string, shown: boolean) => {
    const chatter = chatters.find((c) => c.id === id);
    if (chatter) {
      chatter.shown = shown;
      setChatters([...chatters, chatter]);
    }
  };

  const logout = async () => {
    localStorage.removeItem(`chattersPresent-${session.id}`);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userSession");
    localStorage.removeItem("mySession");
    localStorage.removeItem("appVersion");
    localStorage.removeItem("userChannelModerated");
    setSuccess([...success, `Logging out...`]);
    location.reload();
  };

  const reset = async () => {
    localStorage.removeItem(`chattersPresent-${session.id}`);
    setSuccess([
      ...success,
      `Reset attendance success. Channel: ${session.name}`,
    ]);
    location.reload();
  };

  const shoutout = async (name: string, setStateLoading: any) => {
    setStateLoading(true);
    try {
      const resChat = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/chat`,
        {
          headers: {
            token,
          },
          body: JSON.stringify({
            from: session.id,
            to: name,
            by: mySession.id,
          }),
          method: "POST",
        }
      );
      if (!resChat.ok) {
        const resChatJson = await resChat.json();
        throw new Error(resChatJson.error);
      }
    } catch (error: any) {
      setErrors([...errors, error.message]);
    } finally {
      setStateLoading(false);
      setSuccess([...success, `Shouted: ${name}`]);
    }
  };

  const openBlacklistModal = () => {
    const modal = document.getElementById("blacklist_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const onSaveBlacklist = (blacklist: string) => {
    localStorage.setItem(`chattersBlacklist-${session.id}`, blacklist);
    setSuccess([...success, `Blacklist saved`]);
    location.reload();
  };

  const onCloseBlacklist = () => {
    setStateChattersBlacklist(chattersBlacklist);
  };

  const onChangeBlacklist = (e: any) => {
    setStateChattersBlacklist(e.target.value);
  };

  const openModalChannel = async () => {
    const modalChannel = document.getElementById("channel_modal");
    if (modalChannel) {
      // @ts-ignore
      modalChannel.showModal();
    }
  };

  const onChooseChannel = async (ch: Channel) => {
    const currentSession = {
      id: ch.broadcaster_id,
      name: ch.broadcaster_name,
      image: ch.broadcaster_image,
    };
    setSession(currentSession);
    localStorage.setItem("userSession", JSON.stringify(currentSession));
    setSuccess([...success, `Changed channel to: #${ch.broadcaster_name}`]);
    localStorage.removeItem("chattersPresent");
  };

  const openShoutoutModal = () => {
    const modal = document.getElementById("shoutout_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  return (
    <main className="h-screen px-4 py-4 lg:px-40">
      <section className="mb-4 rounded-lg border-2 border-slate-500 p-2">
        {session.name ? (
          <div className="flex items-center justify-between">
            <button
              className="btn flex items-center space-x-2"
              onClick={async () => await openModalChannel()}
            >
              <div className="avatar">
                <div className="rounded-full">
                  {session.image === "" ? (
                    ""
                  ) : (
                    <Image
                      src={session.image}
                      width={30}
                      height={30}
                      alt="Profile"
                    />
                  )}
                </div>
              </div>
              <p>
                <b>{session.name}</b>
              </p>
            </button>

            <details className="dropdown dropdown-end dropdown-bottom">
              <summary className="btn m-2">
                {GearIcon ? (
                  <Image
                    alt="gear icon"
                    src={GearIcon}
                    width={25}
                    height={25}
                    className="dark:invert"
                  />
                ) : (
                  ""
                )}
              </summary>
              <div className="menu dropdown-content z-[1] grid w-56 grid-cols-2 rounded-box bg-base-100 p-2 shadow">
                <button className="btn m-1" onClick={() => openShoutoutModal()}>
                  Shoutout
                </button>
                <button
                  className="btn m-1"
                  onClick={() => openBlacklistModal()}
                >
                  Blacklist
                </button>
                <button className="btn btn-error m-1" onClick={() => reset()}>
                  Reset Attendance
                </button>
                <button
                  className="btn m-1 hover:btn-error"
                  onClick={() => logout()}
                >
                  Logout
                </button>
              </div>
            </details>

            <ModalChannel
              channels={channels}
              mySession={mySession}
              onChooseChannel={onChooseChannel}
            />
            <ModalShoutout
              chattersPresent={chattersPresent}
              shoutout={shoutout}
            />
          </div>
        ) : (
          <div className="flex items-center justify-end space-x-2">
            <a
              className="btn"
              href={`https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/twitch&scope=${scopes}`}
            >
              Login With Twitch
            </a>
          </div>
        )}

        <ModalBlacklist
          onSaveBlacklist={onSaveBlacklist}
          stateChattersBlacklist={stateChattersBlacklist}
          onChangeBlacklist={onChangeBlacklist}
          onCloseBlacklist={onCloseBlacklist}
        />
      </section>

      <section className="mb-4 min-h-[60vh] space-y-4 rounded-lg border-2 border-slate-500 p-2">
        {chatters.length ? (
          <>
            {chatters.map((chat, idx) => {
              return !chat.shown ? (
                <Card
                  chat={chat}
                  idx={idx}
                  shoutout={shoutout}
                  key={idx}
                  setShownChatter={setShownChatter}
                />
              ) : (
                ""
              );
            })}
          </>
        ) : (
          <>
            {token ? (
              <div className="animate__animated animate__fadeIn flex items-center justify-center space-x-2 pt-2">
                <p>Waiting for someone to chat</p>
                <span className="loading loading-dots loading-sm"></span>
              </div>
            ) : (
              ""
            )}
          </>
        )}
      </section>

      {Object.keys(chattersPresent).length > 0 ? (
        <section className="animate__animated animate__fadeIn space-y-4 rounded-lg border-2 border-slate-500 p-2">
          <div>
            <p>Attendance:</p>
            {Object.entries(chattersPresent).map((chatter, idx) => {
              return <p key={idx}>- {chatter[1].name}</p>;
            })}
          </div>
        </section>
      ) : (
        ""
      )}

      <section className="mt-4 text-center">
        <p>
          Have feedbacks? Slide me{" "}
          <a
            href="https://twitter.com/_sunnyegg"
            className="link"
            target="_blank"
          >
            DM
          </a>
        </p>
        <p>Made with ❤️‍🩹</p>
        <p className="text-xs">App Version: {packageJson.version}</p>
        <br />
      </section>

      {/* toast */}
      <div className="toast">
        {errors.map((err, idx) => {
          setTimeout(() => {
            const errAlert = document.getElementById(`err_${idx}`);
            if (errAlert) {
              errAlert.classList.add("animate");
              errAlert.classList.add("animate__fadeOut");
              setTimeout(() => {
                const removedErr = errors.splice(idx, 1);
                setErrors(removedErr);
              }, 100);
            }
          }, 3000);
          return (
            <div id={`err_${idx}`} key={idx} className="alert alert-error">
              <span>{err}</span>
            </div>
          );
        })}
        {success.map((s, idx) => {
          setTimeout(() => {
            const successAlert = document.getElementById(`success_${idx}`);
            if (successAlert) {
              successAlert.classList.add("animate");
              successAlert.classList.add("animate__fadeOut");
              setTimeout(() => {
                const removedSuccess = success.splice(idx, 1);
                setErrors(removedSuccess);
              }, 100);
            }
          }, 3000);
          return (
            <div
              id={`success_${idx}`}
              key={idx}
              className="alert alert-success"
            >
              <span>{s}</span>
            </div>
          );
        })}
      </div>
      {/* toast */}
    </main>
  );
}
