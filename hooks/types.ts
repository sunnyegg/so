export type CommonResponse = {
  error: string;
  data: string;
};

export type StateResponse = {
  url: string;
};

export type ChannelInfoResponseData = {
  game_name: string;
  title: string;
};

export type ChannelInfoResponse = {
  error: string;
  data: ChannelInfoResponseData;
};

export type StreamInfoResponseData = {
  game_name: string;
  title: string;
  started_at: string;
};

export type StreamInfoResponse = {
  error: string;
  data: StreamInfoResponseData;
};
