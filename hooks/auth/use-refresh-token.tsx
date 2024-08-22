import { CommonResponse } from "../types";

export default async function useRefreshToken(refreshToken: string): Promise<CommonResponse> {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/refresh`;

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const { error } = await res.json()
    return {
      error: error,
      data: "",
    }
  }

  const data = await res.json() as string;
  return {
    error: "",
    data: data,
  };
}