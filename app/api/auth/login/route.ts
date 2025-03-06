import dayjs from "dayjs";

import { Auth, TokenResponse, User } from "@/types/auth";

import { encrypt } from "@/lib/encryption";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const scope = searchParams.get("scope");

    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
    const CLIENT_SECRET = process.env.NEXT_TWITCH_CLIENT_SECRET as string;
    const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL +
      "/auth/login") as string;

    const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}&scope=${scope}`;

    const response = await fetch(url, {
      method: "POST"
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = (await response.json()) as TokenResponse;

    const getMeResponse = await getMe(data.access_token, CLIENT_ID);
    if (getMeResponse.isError) {
      return CreateResponseApiError(
        getMeResponse.error,
        "app.api.auth.login.getMe"
      );
    }

    // encrypt tokens
    const accessToken = encrypt(data.access_token);
    const refreshToken = encrypt(data.refresh_token);

    return CreateResponseApiSuccess({
      accessToken,
      refreshToken,
      expiredAt: dayjs().add(30, "minutes").toISOString(),
      user: getMeResponse.data
    } as Auth);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error, "app.api.auth.login.handler");
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.auth.login.handler"
    );
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
