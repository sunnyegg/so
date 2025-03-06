import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";

import { Auth, TokenResponse, User } from "@/types/auth";

import { logger } from "@/lib/logger";
import { encrypt } from "@/lib/encryption";
import {
  CreateResponseApiError,
  CreateResponseApiSuccess,
  truncateString
} from "@/lib/utils";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const requestId = nanoid();
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const scope = searchParams.get("scope");

    if (!code || !scope) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
    const CLIENT_SECRET = process.env.NEXT_TWITCH_CLIENT_SECRET as string;
    const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL +
      "/auth/login") as string;

    // log the request
    logger.info("Login request", {
      requestId,
      method: "GET",
      path: "/api/auth/login",
      params: {
        code,
        scope,
        CLIENT_ID: truncateString(CLIENT_ID, 4),
        CLIENT_SECRET: truncateString(CLIENT_SECRET, 4),
        REDIRECT_URI
      }
    });

    const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}&scope=${scope}`;

    const response = await fetch(url, {
      method: "POST"
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = JSON.stringify(error);
      logger.error("Post request to twitch failed", new Error(errorMessage), {
        requestId,
        method: "POST",
        path: "/api/auth/login",
        params: {
          url
        }
      });
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as TokenResponse;

    const getMeResponse = await getMe(data.access_token, CLIENT_ID);
    if (getMeResponse.isError) {
      const errorMessage = JSON.stringify(getMeResponse.error);
      logger.error("Get me request failed", new Error(errorMessage), {
        requestId,
        method: "GET",
        path: "/api/auth/login",
        params: {
          accessToken: truncateString(data.access_token, 4),
          clientId: truncateString(CLIENT_ID, 4)
        }
      });
      throw new Error(errorMessage);
    }

    // encrypt tokens
    const accessToken = encrypt(data.access_token);
    const refreshToken = encrypt(data.refresh_token);

    // log success
    logger.info("Login successful", {
      requestId,
      method: "GET",
      path: "/api/auth/login"
    });

    return CreateResponseApiSuccess({
      accessToken,
      refreshToken,
      expiredAt: dayjs().add(30, "minutes").toISOString(),
      user: getMeResponse.data
    } as Auth);
  } catch (error) {
    // log error
    logger.error(
      "Login request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "GET",
        path: "/api/auth/login"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}

type GetMeResponseSuccess = {
  isError: false;
  data: User;
};

type GetMeResponseError = {
  isError: true;
  error: Error;
};

const getMe = async (
  token: string,
  clientId: string
): Promise<GetMeResponseSuccess | GetMeResponseError> => {
  const url = "https://api.twitch.tv/helix/users";
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    return {
      isError: true,
      error: new Error(JSON.stringify(error))
    };
  }

  const data = await res.json();

  return {
    isError: false,
    data: {
      id: data.data[0].id,
      login: data.data[0].login,
      displayName: data.data[0].display_name,
      profileImageUrl: data.data[0].profile_image_url
    } as User
  };
};
