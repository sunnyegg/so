import { Auth } from "./auth";
import { Chatter } from "./chat";
import { Stream } from "./stream";
import { Settings } from "./settings";
import { SelectedChannel } from "./channel";

export const PersistAuth = {
  name: "auth",
  defaultValue: {} as Auth,
};

export const PersistChannel = {
  name: "channel",
  defaultValue: {} as SelectedChannel,
};

export const PersistAttendance = {
  name: "attendance",
  defaultValue: [] as Chatter[],
};

export const PersistSettings = {
  name: "settings",
  defaultValue: {
    autoSo: false,
    autoSoDelay: 0,
    blacklistUsernames: "",
    blacklistWords: "",
  } as Settings,
};

export const PersistStream = {
  name: "stream",
  defaultValue: {} as Stream,
};
