"use client";

import { useEffect } from "react";
import { UserSession } from "@/app/types";

export default function Twitch() {
  useEffect(() => {
    // ambil #access_token di url callback
    let parsedHash = new URLSearchParams(window.location.hash.slice(1));
    let accessToken = parsedHash.get("access_token");
    localStorage.setItem("accessToken", accessToken || "");

    fetchAPIs(accessToken || "");
  }, []);

  const fetchAPIs = async (token: string) => {
    try {
      // get user data
      const resUser = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/users`,
        {
          headers: {
            token,
          },
        }
      );
      if (!resUser.ok) {
        const errUser = await resUser.json();
        throw new Error(errUser.error);
      }

      const { data: userData } = await resUser.json();

      const userSession: UserSession = {
        id: userData.data[0].id,
        name: userData.data[0].display_name,
        image: userData.data[0].profile_image_url,
      };

      // get channel data
      const resChannels = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/moderator?id=${userSession.id}`,
        {
          headers: {
            token,
          },
        }
      );

      if (!resChannels.ok) {
        const errUser = await resChannels.json();
        throw new Error(errUser.error);
      }

      const { data: channelsData } = await resChannels.json();

      const remapId = channelsData.data.map((c: any) => c.broadcaster_id);

      // get channel image
      const eachUserData = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/users?id=${remapId.join(",")}&multiple=true`,
        {
          headers: {
            token,
          },
        }
      );
      if (!eachUserData.ok) {
        const errUser = await eachUserData.json();
        throw new Error(errUser.error);
      }

      const { data: eachUserDataJson } = await eachUserData.json();

      const remapChannelsData = channelsData.data.map((c: any) => {
        const u = eachUserDataJson.data.find(
          (d: any) => c.broadcaster_id === d.id
        );

        return {
          broadcaster_id: c.broadcaster_id,
          broadcaster_login: c.broadcaster_login,
          broadcaster_name: c.broadcaster_name,
          broadcaster_image: u.profile_image_url,
        };
      });

      localStorage.setItem("userSession", JSON.stringify(userSession));
      localStorage.setItem("mySession", JSON.stringify(userSession));
      localStorage.setItem(
        "userChannelModerated",
        JSON.stringify(remapChannelsData)
      );
      location.replace("/");
    } catch (error) {
      console.log(error);
    }
  };

  return <main className="h-[100vh] px-4 py-4 lg:px-40">Success</main>;
}
