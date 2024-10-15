import { Chatter } from "./chat";

export type Broadcast = {
  id?: number;
  streamId: string;
  broadcasterId: string;
  gameName: string;
  title: string;
  startDate: string;
  isLive: boolean;
};

export type Attendance = {
  streamId: string;
  broadcasterId: string;
  chatters: Chatter[];
};
