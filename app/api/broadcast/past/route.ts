import { decrypt } from "@/lib/encryption";
import { getUserInfoByLogin } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import { Broadcast } from "@/types/broadcast";
import { logger } from "@/lib/logger";

import supabase from "@/db/supabase";

type BroadcastDBData = {
  id: number;
  stream_id: string;
  broadcaster_id: string;
  broadcaster_name: string;
  title: string;
  game_name: string;
  start_date: string;
  created_at: string;
};

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const requestId = nanoid();
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");

    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    // Log request
    logger.info("Past broadcasts request", {
      requestId,
      userId,
      method: "GET",
      path: "/api/broadcast/past",
      params: { login }
    });

    if (!login) {
      const error = new Error("Missing login parameter");
      return CreateResponseApiError(error, 400);
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      const error = new Error("Unauthorized");
      return CreateResponseApiError(error, 401);
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    const user = await getUserInfoByLogin(decryptedToken, login);
    if (!user) {
      const error = new Error("User not found");
      logger.error("Get user by name failed", error, {
        requestId,
        userId,
        method: "GET",
        path: "/api/broadcast/past",
        params: { login }
      });
      return CreateResponseApiError(error, 404);
    }

    const dbRes = await supabase()
      .from("broadcasts")
      .select("*")
      .eq("broadcaster_id", user.data[0].id)
      .order("start_date", { ascending: false });

    if (dbRes.status !== 200) {
      const error = new Error(JSON.stringify(dbRes));
      logger.error("Get broadcasts by broadcaster id failed", error, {
        requestId,
        userId,
        method: "GET",
        path: "/api/broadcast/past",
        params: { broadcasterId: user.data[0].id, login }
      });
      return CreateResponseApiError(error, 500);
    }

    const dbData: BroadcastDBData[] = dbRes.data || [];

    if (!dbData.length) {
      const error = new Error("No broadcasts found");
      return CreateResponseApiError(error, 404);
    }

    const outputData: Broadcast[] = dbData.map((d) => ({
      id: d.id,
      broadcasterId: d.broadcaster_id,
      streamId: d.stream_id,
      gameName: d.game_name,
      title: d.title,
      startDate: d.start_date,
      isLive: false
    }));

    // Log success
    logger.info("Past broadcasts request successful", {
      requestId,
      userId,
      method: "GET",
      path: "/api/broadcast/past",
      params: { login }
    });

    return CreateResponseApiSuccess(outputData);
  } catch (error) {
    // Log error
    logger.error(
      "Past broadcasts request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "GET",
        path: "/api/broadcast/past"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
