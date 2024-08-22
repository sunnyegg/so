import { StreamData } from "@/context/stream";
import { StreamInfoResponse, StreamInfoResponseData } from "../types";

export const createStreamInfo = async (token: string, stream: StreamData): Promise<StreamInfoResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/streams`;
  let output: StreamInfoResponse = {
    error: "",
    data: {
      id: 0,
      game_name: "",
      title: "",
      started_at: "",
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      game_name: stream.game_name,
      title: stream.title,
      started_at: stream.started_at,
    }),
  })

  if (!res.ok) {
    const { error } = await res.json()
    output.error = error;
    return output
  }

  const data = await res.json() as StreamInfoResponseData;
  output.data = data;

  return output
}