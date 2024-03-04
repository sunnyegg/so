'use client'

import { useEffect } from "react";
import { useRouter } from 'next/navigation'
import { UserSession } from "@/app/types";

export default function Twitch() {
  const router = useRouter()

  useEffect(() => {
    // ambil #access_token di url callback
    let parsedHash = new URLSearchParams(window.location.hash.slice(1));
    let accessToken = parsedHash.get('access_token');
    localStorage.setItem("accessToken", accessToken || "")

    getUserData(accessToken || '')
  }, [])

  const getUserData = async (token: string) => {
    try {
      const resUser = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users?token=${token}`)
      const { data: userData } = await resUser.json()

      const resChannel = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/channels?token=${token}&broadcasterId=broadcaster_id=${userData.data[0].id}`)
      const { data: channelData } = await resChannel.json()

      const resFollower = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/followers?token=${token}&broadcasterId=broadcaster_id=${userData.data[0].id}`)
      const { data: followerData } = await resFollower.json()

      const userSession: UserSession = {
        id: userData.data[0].id,
        type: userData.data[0].broadcaster_type,
        name: userData.data[0].display_name,
        image: userData.data[0].profile_image_url,
        username: userData.data[0].login,
        description: userData.data[0].description,
        followers: followerData.total,
        lastStreamed: channelData.data[0].game_name,
      }

      localStorage.setItem("userSession", JSON.stringify(userSession))
      router.push('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <main className="px-5 py-5 lg:px-40 h-[100vh]">
      Success
    </main>
  );
}
