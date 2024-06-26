"use client";

import Image from "next/legacy/image";
import { useEffect, useRef, useState } from "react";
import useWebSocket from 'react-use-websocket';

import { Channel, Chatters, ChattersPresent, UserSession } from "./types";
import GearIcon from "@/public/gear.svg";
import packageJson from "@/package.json";
import ModalBlacklist from "@/components/modalBlacklist";
import ModalChannel from "@/components/modalChannel";
import ModalShoutout from "@/components/modalShoutout";
import ModalConfirmation from "@/components/modalConfirmation";
import ModalTimerCard from "@/components/modalTimerCard";
import {
  CHATTERS_BLACKLIST,
  CHATTERS_PRESENT,
  IS_ANNOUNCEMENT_READ,
  USER_SESSION,
} from "@/const/keys";
import Attendance from "@/components/attendance";
import Shoutout from "@/components/shoutout";
import LoadData from "./functions/loadData";
import InitTwitchChat from "./functions/initTwitchChat";
import Logout from "./functions/logout";
import SaveChatter from "./functions/saveChatter";
import ModalAnnouncement from "@/components/modalAnnouncement";

export default function Home() {
  const scopes =
    "user:read:email moderator:manage:shoutouts moderator:read:followers chat:read chat:edit channel:moderate whispers:read whispers:edit channel_editor user:write:chat user:read:moderated_channels channel:read:redemptions";

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

  const [isConnectedWebsocket, setIsConnectedWebsocket] = useState<boolean>(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const { lastMessage } = useWebSocket('wss://eventsub.wss.twitch.tv/ws');

  const refButton = useRef(null)

  useEffect(() => {
    LoadData(setSession, setMySession, setChannels, setToken, setTimerValue)

    if (localStorage.getItem(IS_ANNOUNCEMENT_READ) !== "true") {
      setTimeout(() => {
        // @ts-ignore
        if (refButton) refButton.current.click()
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  useEffect(() => {
    const initConn = async (session_id: any) => {
      const resWebsocket = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/event-twitch`,
        {
          headers: {
            token,
          },
          body: JSON.stringify({
            broadcaster_user_id: session.id,
            moderator_user_id: mySession.id,
            session_id
          }),
          method: "POST",
        }
      )

      if (!resWebsocket.ok) {
        const jsonData = await resWebsocket.json()
        throw new Error(jsonData.error)
      }
    }

    if (!token) return

    if (messageHistory.length) {
      const dataWebsocket: any = messageHistory.map(val => JSON.parse(val.data))
      const sessionWelcome = dataWebsocket.filter((val: any) => val.metadata.message_type === 'session_welcome');

      const savedChattersPerChannel: ChattersPresent = localStorage.getItem(
        `${CHATTERS_PRESENT}-${session.id}`
      )
        ? JSON.parse(
          localStorage.getItem(`${CHATTERS_PRESENT}-${session.id}`) || ""
        )
        : {};

      const blacklistedChatters =
        localStorage.getItem(`${CHATTERS_BLACKLIST}-${session.id}`) || "";

      if (sessionWelcome.length && !isConnectedWebsocket) {
        const data = sessionWelcome[0]
        const session_id = data.payload.session.id

        initConn(session_id).then(() => {
          setIsConnectedWebsocket(true);
          setSuccess([...success, "Connected to Websocket"])
        }).catch(err => {
          setErrors([...errors, err.message])
        })
      }

      const notifications = dataWebsocket.filter((val: any) => val.metadata.message_type === 'notification');

      // save yg udah hadir
      if (notifications.length) {
        notifications.forEach(async (n: any) => {
          const display_name = n.payload.event.user_name;
          const username = n.payload.event.user_login;
          const userid = n.payload.event.user_id;

          try {
            const tags = { 'user-id': userid, 'display-name': display_name, username }

            // skip yg Blacklisted
            // 'nightbot,sunnyeggbot' => ['nightbot','sunnyeggbot']
            if (blacklistedChatters.length > 0) {
              const arrayBlacklist = blacklistedChatters.split(",");
              if (
                arrayBlacklist.find((c) => c === tags["display-name"]?.toLowerCase())
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

            SaveChatter(tags, userData, followerData, channelData, setChattersTemp);

            // save yg udah hadir
            if (tags["display-name"] && tags.username) {
              chattersPresent[tags["display-name"]] = {
                display_name: tags["display-name"],
                username: tags.username,
                shoutout: false,
                image: userData.data[0].profile_image_url,
                time: new Date().toISOString(),
              };
            }

            localStorage.setItem(
              `${CHATTERS_PRESENT}-${session.id}`,
              JSON.stringify(chattersPresent)
            );
            setChattersPresent(chattersPresent);
          } catch (error: any) {
            setErrors([...errors, error.message])
          }
        });
      }

      // done with the data, clear
      setMessageHistory([])
    }
  }, [messageHistory, token])

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

    InitTwitchChat(token, session, chattersPresent, setChattersPresent, setChattersTemp, errors, setErrors, success, setSuccess)
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

  const openAnnouncementModal = () => {
    const modal = document.getElementById("announcement_modal");
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
              action={() => Logout(success, setSuccess, session)}
              content="Logout"
            />

            <ModalTimerCard currentTimer={timerValue} />

            <button ref={refButton} className="hidden" onClick={() => openAnnouncementModal()}></button>
            <ModalAnnouncement />
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
          Have feedbacks? Please report it on{" "}
          <a
            href="https://github.com/sunnyegg/so/issues"
            className="link"
            target="_blank"
          >
            Github
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
