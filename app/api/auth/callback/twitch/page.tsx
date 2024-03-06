'use client'

import { useEffect } from "react";
import { UserSession } from "@/app/types";
import { useRouter } from "next/navigation";

export default function Twitch() {
  const router = useRouter()

  useEffect(() => {
    // ambil #access_token di url callback
    let parsedHash = new URLSearchParams(window.location.hash.slice(1));
    let accessToken = parsedHash.get('access_token');
    localStorage.setItem("accessToken", accessToken || "")

    fetchAPIs(accessToken || '')
  }, [])

  const fetchAPIs = async (token: string) => {
    try {

      // get user data
      const resUser = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users`, {
        headers: {
          token
        }
      })
      if (!resUser.ok) {
        const errUser = await resUser.json()
        throw new Error(errUser.error)
      }

      const { data: userData } = await resUser.json()

      const userSession: UserSession = {
        id: userData.data[0].id,
        name: userData.data[0].display_name,
        image: userData.data[0].profile_image_url,
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
