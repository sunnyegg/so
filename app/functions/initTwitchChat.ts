import tmi from "tmi.js";
import { CHATTERS_BLACKLIST, CHATTERS_PRESENT } from "@/const/keys";

import SaveChatter from "./saveChatter";
import { ChattersPresent } from "../types";

export default function InitTwitchChat(
  token: any,
  session: any,
  chattersPresent: any,
  setChattersPresent: any,
  setChattersTemp: any,
  errors: any,
  setErrors: any,
  success: any,
  setSuccess: any
) {
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

      if (tags["message-type"] !== "chat") return;

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
    });

    setSuccess([...success, `Connected to: #${session.name}`]);

    return () => {
      client.disconnect();
    };
  } catch (error: any) {
    setErrors([...errors, error.message]);
  }
}
