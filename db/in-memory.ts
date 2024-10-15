import { Chatter } from "@/types/chat";
import { Settings } from "@/types/settings";

export const SettingsCache = new Map<string, Settings>();
export const AlreadyPresent = new Map<string, Chatter[]>();
