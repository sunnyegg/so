import { Auth } from "./auth";
import { Chatter } from "./chat";

export const PersistAuth = {
  name: "auth",
  defaultValue: {} as Auth,
};

export const PersistChannel = {
  name: "channel",
  defaultValue: "",
};

export const PersistAttendance = {
  name: "attendance",
  defaultValue: [] as Chatter[],
};
