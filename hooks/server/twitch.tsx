import { ChannelInfoResponse, ChannelInfoResponseData, CommonResponse, StreamInfoResponse, StreamInfoResponseData } from "../types";

export const getChannelInfo = async (token: string, userLogin: string): Promise<ChannelInfoResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/twitch/channel?user_login=${userLogin}`;
  let output: ChannelInfoResponse = {
    error: "",
    data: {
      game_name: "",
      title: "",
    },
  }

  const stateRes = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `bearer ${token}`,
    },
  })

  if (!stateRes.ok) {
    output.error = "Failed to get channel info";
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
    if (stateRes.status === 404) {
      output.error = "stream not found";
      return output
    }
    output.error = "Failed to get stream info";
    return output
  }

  const ch = await stateRes.json() as StreamInfoResponseData;
  output.data = ch;

  return output
};

export const connectChat = async (token: string, userLogin: string, channel: string, streamId?: number): Promise<CommonResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/twitch/chat/connect`;

  const stateRes = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      user_login: userLogin,
      channel: channel,
      stream_id: "1", // TODO: get stream id
    }),
  })

  if (!stateRes.ok) {
    return {
      error: "Failed to connect to chat",
      data: ""
    };
  }

  return {
    error: "",
    data: "Successfully connected to chat"
  };
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
    output.error = "Failed to send message";
    return output
  }

  return {
    error: "",
    data: "Successfully sent message"
  }
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
    output.error = "Failed to send shoutout";
    return output
  }

  return {
    error: "",
    data: "Successfully sent shoutout"
  }
}