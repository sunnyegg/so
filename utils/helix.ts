interface FetchHelix {
  ok: boolean;
  response: Response | null;
  error: Error | null;
}

export default async function fetchHelix(
  token: string,
  endpoint: string,
  method: string,
  body?: any
): Promise<FetchHelix> {
  try {
    const url = "https://api.twitch.tv/helix/" + endpoint;
    const headers = {
      Authorization: "Bearer " + token,
      "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "",
    };

    const response = await fetch(url, {
      method,
      body,
      headers,
    });

    return {
      ok: true,
      response: response,
      error: null,
    };
  } catch (error: any) {
    return {
      ok: false,
      response: null,
      error: error,
    };
  }
}
