import supabase from "@/db/supabase";
import { AlreadyPresent, BroadcastAttendance } from "@/db/in-memory";

import { decrypt } from "@/lib/encryption";
import { getStreamInfoById } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import { Attendance } from "@/types/broadcast";
import { Chatter } from "@/types/chat";
import { logger } from "@/lib/logger";

type AttendanceDBData = {
  stream_id: string;
  login: string;
  display_name: string;
  followers: number;
  profile_image_url: string;
  present_at: string;
};

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const requestId = nanoid();

  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      const error = new Error("Unauthorized");
      return CreateResponseApiError(error, 401);
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    const body = await req.json();
    const { streamId, broadcasterId, chatters } = body as Attendance;

    // Log request
    logger.info("Save attendance request", {
      requestId,
      userId,
      method: "POST",
      path: "/api/broadcast/save-attendance",
      params: { streamId, broadcasterId, chattersCount: chatters?.length }
    });

    if (!streamId || !broadcasterId || !chatters) {
      const error = new Error("Missing required parameters");
      return CreateResponseApiError(error, 400);
    }

    const currentBroadcast = await getStreamInfoById(
      decryptedToken,
      broadcasterId
    );
    if (!currentBroadcast) {
      const error = new Error("Stream not found");
      logger.error("Get stream by broadcaster id failed", error, {
        requestId,
        userId,
        method: "POST",
        path: "/api/broadcast/save-attendance",
        params: { broadcasterId }
      });
      return CreateResponseApiError(error, 404);
    }

    if (currentBroadcast.data[0].id !== streamId) {
      const error = new Error("Stream ID mismatch");
      logger.error("Save attendance request failed", error, {
        requestId,
        userId,
        method: "POST",
        path: "/api/broadcast/save-attendance",
        params: { currentBroadcast, body }
      });
      return CreateResponseApiError(error, 400);
    }

    const alreadyPresent = AlreadyPresent.get(streamId);
    if (!alreadyPresent) {
      // check db
      const dbRes = await supabase()
        .from("attendance")
        .select("*")
        .eq("stream_id", streamId);

      if (dbRes.status !== 200) {
        const error = new Error(JSON.stringify(dbRes));
        logger.error("Get attendance by stream id failed", error, {
          requestId,
          userId,
          method: "POST",
          path: "/api/broadcast/save-attendance",
          params: { streamId }
        });
        return CreateResponseApiError(error, 500);
      }

      let dbData: Chatter[] = [];
      if (dbRes.data?.length) {
        dbData = dbRes.data.map((item) => {
          return {
            ...item,
            id: "",
            lastSeenPlaying: ""
          } as Chatter;
        });
      }

      AlreadyPresent.set(streamId, dbData);
    }

    const alreadyPresentData = AlreadyPresent.get(streamId);

    // transform chatters to AttendanceDBData[]
    const attendanceDBData: AttendanceDBData[] = [];
    for (const chatter of chatters) {
      // if already exist, skip
      if (alreadyPresentData && alreadyPresentData.length > 0) {
        const isExist = alreadyPresentData.find(
          (item) => item.login === chatter.login
        );
        if (isExist) return;
      }

      AlreadyPresent.set(streamId, [chatter]);

      attendanceDBData.push({
        stream_id: streamId,
        login: chatter.login,
        display_name: chatter.displayName,
        followers: chatter.followers,
        profile_image_url: chatter.profileImageUrl || "",
        present_at: chatter.presentAt
      });
    }

    if (attendanceDBData.length === 0) {
      return CreateResponseApiSuccess(null);
    }

    const isExist = BroadcastAttendance.get(streamId);
    if (isExist) {
      BroadcastAttendance.delete(streamId);
    }

    // Log success
    logger.info("Save attendance request successful", {
      requestId,
      userId,
      method: "POST",
      path: "/api/broadcast/save-attendance",
      params: { streamId, newEntries: attendanceDBData.length }
    });

    return CreateResponseApiSuccess(null);
  } catch (error) {
    // Log error
    logger.error(
      "Save attendance request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "POST",
        path: "/api/broadcast/save-attendance"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}

setInterval(
  async () => {
    logger.info("Clearing AlreadyPresent cache", {
      message: `Clearing AlreadyPresent of ${AlreadyPresent.size} entries`
    });
    AlreadyPresent.clear();
  },
  1000 * 60 * 60 * 12
); // every 12 hours
