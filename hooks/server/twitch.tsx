import { ChannelInfoResponse, ChannelInfoResponseData, CommonResponse, StreamInfoResponse, StreamInfoResponseData } from "../types";

export const getChannelInfo = async (token: string, userLogin: string): Promise<ChannelInfoResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/twitch/channel?user_login=${userLogin}`;
  let output: ChannelInfoResponse = {
    error: "",
    data: {
      game_name: "",
      title: "",
      followers: 0,
      user: {
        login: "",
        display_name: "",
        profile_image_url: "",
      },
    },
  }

  const stateRes = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `bearer ${token}`,
    },
  })

  if (!stateRes.ok) {
    const { error } = await stateRes.json()
    output.error = error
    return output
  }

  const ch = await stateRes.json() as ChannelInfoResponseData;
  output.data = ch;

  return output
};

export const getStreamInfo = async (token: string, userLogin: string): Promise<StreamInfoResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/twitch/stream?user_login=${userLogin}`;
  let output: StreamInfoResponse = {
    error: "",
    data: {
      id: 0,
      game_name: "",
      title: "",
      started_at: "",
    },
  }

  const stateRes = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `bearer ${token}`,
    },
  })

  if (!stateRes.ok) {
    const { error } = await stateRes.json()
    output.error = error;
    return output
  }

  const ch = await stateRes.json() as StreamInfoResponseData;
  output.data = ch;

  return output
};

export const connectChat = async (token: string, userLogin: string, channel: string, streamId: number): Promise<CommonResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/twitch/chat/connect`;
  let output: CommonResponse = {
    error: "",
    data: ""
  }

  const stateRes = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      user_login: userLogin,
      channel: channel,
      stream_id: streamId?.toString() || "",
    }),
  })

  if (!stateRes.ok) {
    const { error } = await stateRes.json()
    output.error = error;
    return output
  }

  output.data = "Successfully connected to chat";
  return output
}

export const sendMessage = async (token: string, channel: string, message: string): Promise<CommonResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/twitch/chat/message`;
  let output: CommonResponse = {
    error: "",
    data: "",
  }

  const stateRes = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      channel: channel,
      message: message,
    }),
  })

  if (!stateRes.ok) {
    const { error } = await stateRes.json()
    output.error = error;
    return output
  }

  output.data = "Successfully sent message";
  return output
}

export const sendShoutout = async (token: string, fromID: string, toID: string, moderatorID: string): Promise<CommonResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/twitch/chat/shoutout`;
  let output: CommonResponse = {
    error: "",
    data: "",
  }

  const stateRes = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      from_id: fromID,
      to_id: toID,
      moderator_id: moderatorID,
    }),
  })

  if (!stateRes.ok) {
    const { error } = await stateRes.json()
    output.error = error;
    return output
  }

  output.data = "Successfully sent shoutout";
  return output
}