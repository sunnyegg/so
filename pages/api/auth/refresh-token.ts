import dayjs from "dayjs";

import { Auth, TokenResponse } from "@/types/auth";

import { decrypt, encrypt } from "@/lib/encryption";

export default async function handler(req: any, res: any) {
  try {
    const { token } = req.query;
    const decryptedToken = decrypt(token);
    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
    const CLIENT_SECRET = process.env.NEXT_TWITCH_CLIENT_SECRET as string;

    const url = "https://id.twitch.tv/oauth2/token";

    const formData = new URLSearchParams();
    formData.append("client_id", CLIENT_ID);
    formData.append("client_secret", CLIENT_SECRET);
    formData.append("grant_type", "refresh_token");
    formData.append("refresh_token", decryptedToken);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(error);
      throw new Error("Failed to refresh token");
    }

    const data = (await response.json()) as TokenResponse;

    // encrypt tokens
    const accessToken = encrypt(data.access_token);
    const refreshToken = encrypt(data.refresh_token);

    return res.status(200).json({
      status: true,
      data: {
        accessToken,
        refreshToken,
        expiredAt: dayjs().add(30, "minutes").toISOString(),
      } as Auth,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ status: false });
  }
}
