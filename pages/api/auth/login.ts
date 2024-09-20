import dayjs from "dayjs";

import { Auth, TokenResponse, User } from "@/types/auth";

import { encrypt } from "@/lib/encryption";

type GetMeResponse = {
  status: boolean;
  data: User;
};

export default async function handler(req: any, res: any) {
  try {
    const { code, scope } = req.query;

    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
    const CLIENT_SECRET = process.env.NEXT_TWITCH_CLIENT_SECRET as string;
    const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL +
      "/auth/login") as string;

    const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}&scope=${scope}`;

    const response = await fetch(url, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(error);
      throw new Error("Failed to login");
    }

    const data = (await response.json()) as TokenResponse;

    const getMeResponse = await getMe(data.access_token, CLIENT_ID);
    if (!getMeResponse.status) {
      return res.status(500).json({ status: false });
    }

    // encrypt tokens
    const accessToken = encrypt(data.access_token);
    const refreshToken = encrypt(data.refresh_token);

    return res.status(200).json({
      status: true,
      data: {
        accessToken,
        refreshToken,
        expiredAt: dayjs().add(30, "minutes").toISOString(),
        user: getMeResponse.data,
      } as Auth,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ status: false });
  }
}

const getMe = async (
  token: string,
  clientId: string
): Promise<GetMeResponse> => {
  const output = {
    status: false,
    data: {
      id: "",
      login: "",
      displayName: "",
      profileImageUrl: "",
    },
  };

  const url = "https://api.twitch.tv/helix/users";
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    return output;
  }

  const data = await res.json();

  output.status = true;
  output.data = {
    id: data.data[0].id,
    login: data.data[0].login,
    displayName: data.data[0].display_name,
    profileImageUrl: data.data[0].profile_image_url,
  } as User;

  return output;
};
