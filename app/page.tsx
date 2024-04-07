"use client";

import tmi from "tmi.js";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { Channel, Chatters, ChattersPresent, UserSession } from "./types";
import GearIcon from "@/public/gear.svg";
import packageJson from "@/package.json";
import ModalBlacklist from "@/components/modalBlacklist";
import ModalChannel from "@/components/modalChannel";
import ModalShoutout from "@/components/modalShoutout";
import ModalConfirmation from "@/components/modalConfirmation";
import ModalTimerCard from "@/components/modalTimerCard";
import {
  ACCESS_TOKEN,
  APP_VERSION,
  CHATTERS_BLACKLIST,
  CHATTERS_PRESENT,
  MY_SESSION,
  TIMER_CARD,
  USER_CHANNEL_MODERATED,
  USER_SESSION,
} from "@/const/keys";
import Attendance from "@/components/attendance";
import Shoutout from "@/components/shoutout";

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
  const [timerValue, setTimerValue] = useState<string>("60");

  const [channels, setChannels] = useState<Channel[]>([]);

  const [stateChattersBlacklist, setStateChattersBlacklist] =
    useState<string>(chattersBlacklist);

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);

  useEffect(() => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN) || "";

      if (accessToken) {
        const savedUserSession: UserSession = localStorage.getItem(USER_SESSION)
          ? JSON.parse(localStorage.getItem(USER_SESSION) || "")
          : {
            id: "",
            image: "",
            name: "",
          };
        setSession(savedUserSession);

        const savedMySession: UserSession = localStorage.getItem(MY_SESSION)
          ? JSON.parse(localStorage.getItem(MY_SESSION) || "")
          : {
            id: "",
            image: "",
            name: "",
          };
        setMySession(savedMySession);

        const savedChannels: Channel[] = localStorage.getItem(
          USER_CHANNEL_MODERATED
        )
          ? JSON.parse(localStorage.getItem(USER_CHANNEL_MODERATED) || "")
          : [];
        setChannels(savedChannels);
      }
      setToken(accessToken);

      const currentTimer = localStorage.getItem(TIMER_CARD) || "60";
      setTimerValue(currentTimer);

      localStorage.setItem(APP_VERSION, packageJson.version);
    } catch (error) {
      localStorage.clear();
    }
  }, []);

  useEffect(() => {
    const savedChattersPerChannel: ChattersPresent = localStorage.getItem(
      `${CHATTERS_PRESENT}-${session.id}`
    )
      ? JSON.parse(
        localStorage.getItem(`${CHATTERS_PRESENT}-${session.id}`) || ""
      )
      : {};
    setChattersPresent(savedChattersPerChannel);

    const blacklistedChatters =
      localStorage.getItem(`${CHATTERS_BLACKLIST}-${session.id}`) || "";
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

        if (tags["message-type"] !== 'chat') return;

        const savedChattersPerChannel: ChattersPresent = localStorage.getItem(
          `${CHATTERS_PRESENT}-${session.id}`
        )
          ? JSON.parse(
            localStorage.getItem(`${CHATTERS_PRESENT}-${session.id}`) || ""
          )
          : {};

        const blacklistedChatters =
          localStorage.getItem(`${CHATTERS_BLACKLIST}-${session.id}`) || "";

        // skip yg Blacklisted
        // 'nightbot,sunnyeggbot' => ['nightbot','sunnyeggbot']
        if (blacklistedChatters.length > 0) {
          const arrayBlacklist = blacklistedChatters.split(",");
          if (
            arrayBlacklist.find(
              (c) => c === tags["display-name"]?.toLowerCase()
            )
          ) {
            return;
          }
        }

        // skip yg sudah hadir
        if (Object.keys(savedChattersPerChannel).length > 0) {
          if (tags["display-name"]) {
            if (savedChattersPerChannel[tags["display-name"]]) {
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
        if (tags["display-name"] && tags.username) {
          chattersPresent[tags["display-name"]] = {
            display_name: tags["display-name"],
            username: tags.username,
            shoutout: false,
            image: userData.data[0].profile_image_url,
            time: new Date().toISOString()
          };
        }

        localStorage.setItem(
          `${CHATTERS_PRESENT}-${session.id}`,
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
    const chatter = chatters.map((c) => {
      if (c.id === id) {
        c.shown = shown;
      }
      return c;
    });
    if (chatter) {
      setChatters(chatter);
    }
  };

  const logout = async () => {
    localStorage.removeItem(`${CHATTERS_PRESENT}-${session.id}`);
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(USER_SESSION);
    localStorage.removeItem(MY_SESSION);
    localStorage.removeItem(APP_VERSION);
    localStorage.removeItem(USER_CHANNEL_MODERATED);
    setSuccess([...success, `Logging out...`]);
    location.reload();
  };

  const reset = async () => {
    localStorage.removeItem(`${CHATTERS_PRESENT}-${session.id}`);
    setSuccess([
      ...success,
      `Reset attendance success. Channel: ${session.name}`,
    ]);
    location.reload();
  };

  const shoutout = async (
    name: string,
    setStateLoading: any,
    card?: any,
    id?: string
  ) => {
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

      setStateLoading(false);
      setSuccess([...success, `Shouted: ${name}`]);
      if (card && id) {
        card.classList.add("animate__fadeOut");

        setTimeout(() => {
          setShownChatter(id, true);
        }, 1000);
      }
    } catch (error: any) {
      setStateLoading(false);
      setErrors([...errors, error.message]);
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
    localStorage.setItem(`${CHATTERS_BLACKLIST}-${session.id}`, blacklist);
    setSuccess([...success, `Blacklist saved`]);
    location.reload();
  };

  const onCloseBlacklist = () => {
    setStateChattersBlacklist(chattersBlacklist);
  };

  const onChangeBlacklist = (e: any) => {
    setStateChattersBlacklist(e.target.value);
  };

  const openModalChannel = () => {
    const modalChannel = document.getElementById("channel_modal");
    if (modalChannel) {
      // @ts-ignore
      modalChannel.showModal();
    }
  };

  const onChooseChannel = (ch: Channel) => {
    const currentSession = {
      id: ch.broadcaster_id,
      name: ch.broadcaster_name,
      image: ch.broadcaster_image,
    };
    setSession(currentSession);
    localStorage.setItem(USER_SESSION, JSON.stringify(currentSession));
    setSuccess([...success, `Changed channel to: #${ch.broadcaster_name}`]);
  };

  const openShoutoutModal = () => {
    const modal = document.getElementById("shoutout_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const openConfirmationResetModal = () => {
    const modal = document.getElementById("confirmation_reset_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const openConfirmationLogoutModal = () => {
    const modal = document.getElementById("confirmation_logout_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const openTimerCardModal = () => {
    const modal = document.getElementById("timer_card_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  return (
    <>
      <section className="mb-4 rounded-lg bg-base-200 p-2">
        {session.name ? (
          <div className="flex items-center justify-between">
            <button
              className="btn btn-ghost flex items-center space-x-2 text-xs md:text-base"
              onClick={() => openModalChannel()}
            >
              <div className="avatar">
                <div className="h-7 w-7 md:h-10 md:w-10 relative">
                  {session.image === "" ? (
                    ""
                  ) : (
                    <Image
                      src={session.image}
                      alt="Profile"
                      layout="fill"
                      className="rounded-full"
                    />
                  )}
                </div>
              </div>
              <p>
                <b>{session.name}</b>
              </p>
            </button>

            <details className="dropdown dropdown-end dropdown-bottom">
              <summary className="btn btn-ghost my-2">
                {GearIcon ? (
                  <Image
                    alt="gear icon"
                    src={GearIcon}
                    width={20}
                    height={20}
                    className="dark:invert"
                  />
                ) : (
                  ""
                )}
              </summary>
              <div className="menu dropdown-content z-[100] grid w-48 md:w-56 grid-cols-2 md:grid-cols-1 rounded-box bg-base-100 p-2 shadow">
                <button className="btn m-1 text-xs md:text-base" onClick={() => openShoutoutModal()}>
                  Shoutout
                </button>
                <button
                  className="btn m-1 text-xs md:text-base"
                  onClick={() => openBlacklistModal()}
                >
                  Blacklist
                </button>
                <button
                  className="btn m-1 text-xs md:text-base"
                  onClick={() => openTimerCardModal()}
                >
                  Timer Card
                </button>
                <button
                  className="btn btn-error m-1 text-xs md:text-base"
                  onClick={() => openConfirmationResetModal()}
                >
                  Reset Attendance
                </button>
                <button
                  className="btn m-1 hover:btn-error text-xs md:text-base"
                  onClick={() => openConfirmationLogoutModal()}
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

            <ModalConfirmation
              id="confirmation_reset_modal"
              action={reset}
              content="Reset Attendance"
            />

            <ModalConfirmation
              id="confirmation_logout_modal"
              action={logout}
              content="Logout"
            />

            <ModalTimerCard currentTimer={timerValue} />
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

      <Shoutout chatters={chatters} setShownChatter={setShownChatter} shoutout={shoutout} token={token} />

      <Attendance chattersPresent={chattersPresent} />

      <section className="mt-10 text-center text-xs md:text-base">
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
        <p className="text-[0.65rem] md:text-xs">App Version: {packageJson.version}</p>
        <br />
      </section>

      {/* toast */}
      <div className="toast text-xs md:text-base">
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
                setSuccess(removedSuccess);
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
    </>
  )
}
