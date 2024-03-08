export interface UserSession {
  id: string;
  name: string;
  image: string;
}

export interface Chatters {
  id: string;
  name: string;
  type: string;
  image: string;
  username: string;
  followers: number;
  description: string;
  lastStreamed: string;
  shown: boolean;
}

export interface ChattersPresent {
  [key: string]: {
    name: string;
    shoutout: boolean;
  };
}
