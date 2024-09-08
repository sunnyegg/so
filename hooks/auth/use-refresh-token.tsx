import { CommonResponse } from "../types";

export default async function useRefreshToken(refreshToken: string): Promise<CommonResponse> {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/refresh`;
  let output: CommonResponse = {
    error: "",
    data: "",
  }

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const { error } = await res.json()
    output.error = error;
    return output
  }

  const data = await res.json() as string;
  output.data = data;
  return output
}