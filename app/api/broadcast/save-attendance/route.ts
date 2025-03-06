import supabase from "@/db/supabase";
import { AlreadyPresent, BroadcastAttendance } from "@/db/in-memory";

import { decrypt } from "@/lib/encryption";
import { NewAttendanceQueue } from "@/lib/queue";
import { NewAPIClient } from "@/lib/twitch";
import {
  CreateResponseApiError,
  CreateResponseApiSuccess,
  log
} from "@/lib/utils";
import { NextRequest } from "next/server";

import { Attendance } from "@/types/broadcast";
import { Chatter } from "@/types/chat";

type AttendanceDBData = {
  stream_id: string;
  login: string;
  display_name: string;
  followers: number;
  profile_image_url: string;
  present_at: string;
};

export const runtime = "edge";

export default async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.broadcast.save-attendance.handler",
        401
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const body = await req.json();
    const { streamId, broadcasterId, chatters } = body as Attendance;

    if (!streamId || !broadcasterId || !chatters) {
      return CreateResponseApiError(
        new Error("Missing required parameters"),
        "app.api.broadcast.save-attendance.handler",
        400
      );
    }

    const currentBroadcast =
      await apiClient.streams.getStreamByUserId(broadcasterId);
    if (!currentBroadcast) {
      log("info", "app.api.broadcast.save-attendance.handler", {
        message: "no stream",
        broadcasterId
      });
      return CreateResponseApiError(
        new Error("Stream not found"),
        "app.api.broadcast.save-attendance.handler",
        404
      );
    }

    if (currentBroadcast.id !== streamId) {
      log("error", "app.api.broadcast.save-attendance.handler", {
        currentBroadcast,
        body
      });
      return CreateResponseApiError(
        new Error("Stream ID mismatch"),
        "app.api.broadcast.save-attendance.handler",
        400
      );
    }

    if (!AlreadyPresent.get(streamId)) {
      // check db
      const dbRes = await supabase()
        .from("attendance")
        .select("*")
        .eq("stream_id", streamId);

      if (dbRes.status !== 200) {
        return CreateResponseApiError(
          new Error(JSON.stringify(dbRes)),
          "app.api.broadcast.save-attendance.handler",
          500
        );
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

    let alreadyPresentData = AlreadyPresent.get(streamId)!;

    // transform chatters to AttendanceDBData[]
    const attendanceDBData: AttendanceDBData[] = [];
    chatters.forEach((chatter) => {
      // if already exist, skip
      if (alreadyPresentData.length) {
        const isExist = alreadyPresentData.find(
          (item) => item.login === chatter.login
        );
        if (isExist) return;
      }

      AlreadyPresent.set(streamId, [...alreadyPresentData, chatter]);
      alreadyPresentData = AlreadyPresent.get(streamId)!;

      attendanceDBData.push({
        stream_id: streamId,
        login: chatter.login,
        display_name: chatter.displayName,
        followers: chatter.followers,
        profile_image_url: chatter.profileImageUrl || "",
        present_at: chatter.presentAt
      });
    });

    if (attendanceDBData.length === 0) {
      return CreateResponseApiSuccess(null);
    }

    const queue = NewAttendanceQueue(streamId);
    if (!queue) {
      return CreateResponseApiError(
        new Error("Failed to create queue"),
        "app.api.broadcast.save-attendance.handler",
        500
      );
    }
    queue.createJob(attendanceDBData).retries(1).save();

    if (BroadcastAttendance.has(streamId)) {
      BroadcastAttendance.delete(streamId);
    }

    return CreateResponseApiSuccess(null);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(
        error,
        "app.api.broadcast.save-attendance.handler"
      );
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.broadcast.save-attendance.handler"
    );
  }
}

setInterval(
  () => {
    log(
      "info",
      "app.api.broadcast.save-attendance.setInterval",
      `Clearing AlreadyPresent of ${AlreadyPresent.size} entries`
    );
    AlreadyPresent.clear();
  },
  1000 * 60 * 60 * 12
); // every 12 hours
