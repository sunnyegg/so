export type Chatter = {
  id: string;
  login: string;
  displayName: string;
  followers: number;
  lastSeenPlaying: string;
  profileImageUrl: string | undefined;
  presentAt: string;
};
