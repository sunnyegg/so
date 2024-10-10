export type Channel = {
  id: string;
  login: string;
  displayName: string;
  gameName: string;
  title: string;
  profileImageUrl: string;
  followers: number;
};

export type ModeratedChannel = {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
};

export type SelectedChannel = {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
};
