export type Auth = {
  accessToken: string;
  refreshToken: string;
  expiredAt: string;
  user: User;
};

export type User = {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
};
