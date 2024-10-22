import Queue from "bee-queue";

import { Chatter } from "@/types/chat";
import { Settings } from "@/types/settings";
import { Channel, ModeratedChannel } from "@/types/channel";

export const SettingsCache = new Map<string, Settings>();
export const AlreadyPresent = new Map<string, Chatter[]>();
export const ModeratedChannelsCache = new Map<string, ModeratedChannel[]>();
export const ChannelCache = new Map<string, Channel>();
export const AttendanceQueues = new Map<string, Queue>();
export const BroadcastAttendance = new Map<string, Chatter[]>();
