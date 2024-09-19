export type Auth = {
  accessToken: string;
  user: User;
};

export type User = {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
};
