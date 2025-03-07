import type Queue from "bee-queue";
import Redis from "ioredis";

import { Chatter } from "@/types/chat";
import { Settings } from "@/types/settings";
import { Channel, ModeratedChannel } from "@/types/channel";

const redis = new Redis(process.env.NEXT_REDIS_URL || "");

export const SettingsCache = {
  async get(key: string): Promise<Settings | null> {
    const value = await redis.get(`settings:${key}`);
    return value ? JSON.parse(value) : null;
  },
  async set(key: string, value: Settings): Promise<void> {
    await redis.set(`settings:${key}`, JSON.stringify(value));
  },
  async delete(key: string): Promise<void> {
    await redis.del(`settings:${key}`);
  },
  async clear(): Promise<void> {
    await redis.del("settings:*");
  },
  async size(): Promise<number> {
    const keys = await redis.keys("settings:*");
    return keys.length;
  }
};

export const AlreadyPresent = {
  async get(key: string): Promise<Chatter[]> {
    const value = await redis.get(`present:${key}`);
    return value ? JSON.parse(value) : [];
  },
  async set(key: string, value: Chatter[]): Promise<void> {
    await redis.set(`present:${key}`, JSON.stringify(value));
  },
  async delete(key: string): Promise<void> {
    await redis.del(`present:${key}`);
  },
  async clear(): Promise<void> {
    await redis.del("present:*");
  },
  async size(): Promise<number> {
    const keys = await redis.keys("present:*");
    return keys.length;
  }
};

export const ModeratedChannelsCache = {
  async get(key: string): Promise<ModeratedChannel[]> {
    const value = await redis.get(`moderated:${key}`);
    return value ? JSON.parse(value) : [];
  },
  async set(key: string, value: ModeratedChannel[]): Promise<void> {
    await redis.set(`moderated:${key}`, JSON.stringify(value));
  },
  async delete(key: string): Promise<void> {
    await redis.del(`moderated:${key}`);
  },
  async clear(): Promise<void> {
    await redis.del("moderated:*");
  },
  async size(): Promise<number> {
    const keys = await redis.keys("moderated:*");
    return keys.length;
  }
};

export const ChannelCache = {
  async get(key: string): Promise<Channel | null> {
    const value = await redis.get(`channel:${key}`);
    return value ? JSON.parse(value) : null;
  },
  async set(key: string, value: Channel): Promise<void> {
    await redis.set(`channel:${key}`, JSON.stringify(value));
  },
  async delete(key: string): Promise<void> {
    await redis.del(`channel:${key}`);
  },
  async clear(): Promise<void> {
    await redis.del("channel:*");
  },
  async size(): Promise<number> {
    const keys = await redis.keys("channel:*");
    return keys.length;
  }
};

export const AttendanceQueues = {
  async get(key: string): Promise<Queue | null> {
    const value = await redis.get(`queue:${key}`);
    return value ? JSON.parse(value) : null;
  },
  async set(key: string, value: Queue): Promise<void> {
    await redis.set(`queue:${key}`, JSON.stringify(value));
  },
  async delete(key: string): Promise<void> {
    await redis.del(`queue:${key}`);
  },
  async clear(): Promise<void> {
    await redis.del("queue:*");
  },
  async size(): Promise<number> {
    const keys = await redis.keys("queue:*");
    return keys.length;
  }
};

export const BroadcastAttendance = {
  async get(key: string): Promise<Chatter[]> {
    const value = await redis.get(`broadcast:${key}`);
    return value ? JSON.parse(value) : [];
  },
  async set(key: string, value: Chatter[]): Promise<void> {
    await redis.set(`broadcast:${key}`, JSON.stringify(value));
  },
  async delete(key: string): Promise<void> {
    await redis.del(`broadcast:${key}`);
  },
  async clear(): Promise<void> {
    await redis.del("broadcast:*");
  },
  async size(): Promise<number> {
    const keys = await redis.keys("broadcast:*");
    return keys.length;
  }
};
