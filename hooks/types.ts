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
  followers: number;
  user: UserInfoResponseData;
};

export type ChannelInfoResponse = {
  error: string;
  data: ChannelInfoResponseData;
};

export type StreamInfoResponseData = {
  id: number;
  game_name: string;
  title: string;
  started_at: string;
};

export type StreamInfoResponse = {
  error: string;
  data: StreamInfoResponseData;
};

export type GetAttendanceResponseData = {
  title: string;
  game_name: string;
  started_at: string;
  username: string;
  is_shouted: boolean;
  present_at: string;
};

export type GetAttendanceResponse = {
  error: string;
  data: GetAttendanceResponseData[];
};

export type UserInfoResponseData = {
  login: string;
  display_name: string;
  profile_image_url: string;
};
