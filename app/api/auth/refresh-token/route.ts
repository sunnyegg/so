import dayjs from "dayjs";

import { Auth, TokenResponse } from "@/types/auth";

import { decrypt, encrypt } from "@/lib/encryption";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";

export const runtime = "edge";

export default async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.auth.refresh-token.handler",
        401
      );
    }

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
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = (await response.json()) as TokenResponse;

    // encrypt tokens
    const accessToken = encrypt(data.access_token);
    const refreshToken = encrypt(data.refresh_token);

    return CreateResponseApiSuccess({
      accessToken,
      refreshToken,
      expiredAt: dayjs().add(30, "minutes").toISOString()
    } as Auth);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(
        error,
        "app.api.auth.refresh-token.handler"
      );
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.auth.refresh-token.handler"
    );
  }
}
