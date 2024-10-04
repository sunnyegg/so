import { Auth } from "./auth";
import { Chatter } from "./chat";
import { Stream } from "./stream";
import { Settings } from "./settings";

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

export const PersistSettings = {
  name: "settings",
  defaultValue: {} as Settings,
};

export const PersistStream = {
  name: "stream",
  defaultValue: {} as Stream,
};
