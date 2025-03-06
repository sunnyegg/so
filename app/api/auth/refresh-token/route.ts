import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";

import { Auth, TokenResponse } from "@/types/auth";

import { logger } from "@/lib/logger";
import { decrypt, encrypt } from "@/lib/encryption";
import {
  CreateResponseApiError,
  CreateResponseApiSuccess,
  truncateString
} from "@/lib/utils";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const requestId = nanoid();
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const decryptedToken = decrypt(token);
    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
    const CLIENT_SECRET = process.env.NEXT_TWITCH_CLIENT_SECRET as string;
    const url = "https://id.twitch.tv/oauth2/token";

    // log request
    logger.info("Refresh token request", {
      requestId,
      userId,
      method: "POST",
      path: "/api/auth/refresh-token",
      params: {
        token: truncateString(token, 4),
        clientId: truncateString(CLIENT_ID, 4),
        clientSecret: truncateString(CLIENT_SECRET, 4),
        decryptedToken: truncateString(decryptedToken, 4)
      }
    });

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

      // log error
      logger.error(
        "Post request to twitch failed",
        new Error(JSON.stringify(error)),
        {
          requestId,
          userId,
          method: "POST",
          path: "/api/auth/refresh-token",
          params: {
            token: truncateString(token, 4),
            clientId: truncateString(CLIENT_ID, 4),
            clientSecret: truncateString(CLIENT_SECRET, 4),
            decryptedToken: truncateString(decryptedToken, 4)
          }
        }
      );
      throw new Error(JSON.stringify(error));
    }

    const data = (await response.json()) as TokenResponse;

    // encrypt tokens
    const accessToken = encrypt(data.access_token);
    const refreshToken = encrypt(data.refresh_token);

    // log success
    logger.info("Refresh token request successful", {
      requestId,
      userId,
      method: "POST",
      path: "/api/auth/refresh-token"
    });

    return CreateResponseApiSuccess({
      accessToken,
      refreshToken,
      expiredAt: dayjs().add(30, "minutes").toISOString()
    } as Auth);
  } catch (error) {
    // log error
    logger.error(
      "Refresh token request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "POST",
        path: "/api/auth/refresh-token"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
