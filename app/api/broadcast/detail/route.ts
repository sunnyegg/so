import { decrypt } from "@/lib/encryption";
import { getUserInfoByLogin } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import supabase from "@/db/supabase";
import { logger } from "@/lib/logger";

import { Chatter } from "@/types/chat";
import { BroadcastAttendance } from "@/db/in-memory";

type AttendanceDBData = {
  id: string;
  stream_id: string;
  login: string;
  display_name: string;
  followers: number;
  profile_image_url: string;
  present_at: string;
  created_at: string;
};

export async function GET(req: NextRequest) {
  const requestId = nanoid();
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");
    const id = searchParams.get("id");

    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    // Log request
    logger.info("Broadcast detail request", {
      requestId,
      userId,
      method: "GET",
      path: "/api/broadcast/detail",
      params: { login, id }
    });

    if (!login || !id) {
      const error = new Error("Missing required parameters");
      return CreateResponseApiError(error, 400);
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      const error = new Error("Unauthorized");
      return CreateResponseApiError(error, 401);
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    // check if data is already in cache
    const cachedData = await BroadcastAttendance.get(id);
    if (cachedData) {
      logger.info("Broadcast detail request successful (cached)", {
        requestId,
        userId,
        method: "GET",
        path: "/api/broadcast/detail",
        params: { login, id }
      });
      return CreateResponseApiSuccess(cachedData);
    }

    const user = await getUserInfoByLogin(decryptedToken, login);
    if (!user) {
      const error = new Error("User not found");
      logger.error("Get user by name failed", error, {
        requestId,
        userId,
        method: "GET",
        path: "/api/broadcast/detail",
        params: { login, id }
      });
      return CreateResponseApiError(error, 404);
    }

    const dbRes = await supabase()
      .from("attendance")
      .select("*")
      .eq("stream_id", id)
      .order("present_at", { ascending: true });

    if (dbRes.status !== 200) {
      const error = new Error(JSON.stringify(dbRes));
      logger.error("Get attendance by stream id failed", error, {
        requestId,
        userId,
        method: "GET",
        path: "/api/broadcast/detail",
        params: { login, id }
      });
      return CreateResponseApiError(error, 500);
    }

    const dbData: AttendanceDBData[] = dbRes.data || [];

    if (!dbData.length) {
      const error = new Error("No data found");
      return CreateResponseApiError(error, 404);
    }

    const outputData: Chatter[] = dbData.map((d) => ({
      id: d.id,
      login: d.login,
      displayName: d.display_name,
      followers: d.followers,
      profileImageUrl: d.profile_image_url,
      presentAt: d.present_at,
      lastSeenPlaying: ""
    }));

    // set cache
    await BroadcastAttendance.set(id, outputData);

    // Log success
    logger.info("Broadcast detail request successful", {
      requestId,
      userId,
      method: "GET",
      path: "/api/broadcast/detail",
      params: { login, id }
    });

    return CreateResponseApiSuccess(outputData);
  } catch (error) {
    // Log error
    logger.error(
      "Broadcast detail request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "GET",
        path: "/api/broadcast/detail"
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
    logger.info("Clearing BroadcastAttendance cache", {
      message: `Clearing BroadcastAttendance of ${await BroadcastAttendance.size()} entries`
    });
    await BroadcastAttendance.clear();
  },
  1000 * 60 * 60 * 12
); // every 12 hours
