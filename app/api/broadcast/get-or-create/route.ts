import supabase from "@/db/supabase";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import { Broadcast } from "@/types/broadcast";
import { logger } from "@/lib/logger";

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
    logger.info("Get or create broadcast request", {
      requestId,
      userId,
      method: "GET",
      path: "/api/broadcast/get-or-create",
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
    const apiClient = NewAPIClient(decryptedToken);

    const currentBroadcast = await apiClient.streams.getStreamByUserName(login);
    if (!currentBroadcast) {
      const error = new Error("Stream not found");
      logger.error("Get stream by user name failed", error, {
        requestId,
        userId,
        method: "GET",
        path: "/api/broadcast/get-or-create",
        params: { login }
      });
      return CreateResponseApiError(error, 404);
    }

    // check db
    const dbRes = await supabase()
      .from("broadcasts")
      .select("*")
      .eq("stream_id", currentBroadcast.id)
      .limit(1)
      .order("start_date", { ascending: false });

    if (dbRes.status !== 200) {
      const error = new Error(JSON.stringify(dbRes));
      logger.error("Get broadcast by stream id failed", error, {
        requestId,
        userId,
        method: "GET",
        path: "/api/broadcast/get-or-create",
        params: { currentBroadcastId: currentBroadcast.id, login }
      });
      return CreateResponseApiError(error, 500);
    }

    let outputData: Broadcast = {
      streamId: "",
      broadcasterId: currentBroadcast.userId,
      gameName: "",
      title: "",
      startDate: "",
      isLive: false
    };

    // if found, use db data
    if (dbRes.data?.length) {
      outputData = {
        streamId: dbRes.data[0].stream_id,
        broadcasterId: dbRes.data[0].broadcaster_id,
        gameName: dbRes.data[0].game_name,
        title: dbRes.data[0].title,
        startDate: dbRes.data[0].start_date,
        isLive: true
      };
    } else {
      // if not found, create
      outputData = {
        streamId: currentBroadcast.id,
        broadcasterId: currentBroadcast.userId,
        gameName: currentBroadcast.gameName,
        title: currentBroadcast.title,
        startDate: currentBroadcast.startDate.toISOString(),
        isLive: true
      };

      const createRes = await supabase().from("broadcasts").insert({
        stream_id: outputData.streamId,
        broadcaster_id: currentBroadcast.userId,
        broadcaster_name: currentBroadcast.userName,
        game_name: outputData.gameName,
        title: outputData.title,
        start_date: outputData.startDate
      });

      if (createRes.status !== 201) {
        const error = new Error(JSON.stringify(createRes));
        logger.error("Create broadcast failed", error, {
          requestId,
          userId,
          method: "GET",
          path: "/api/broadcast/get-or-create",
          params: { login }
        });
        return CreateResponseApiError(error, 500);
      }
    }

    // Log success
    logger.info("Get or create broadcast request successful", {
      requestId,
      userId,
      method: "GET",
      path: "/api/broadcast/get-or-create",
      params: { login }
    });

    return CreateResponseApiSuccess(outputData);
  } catch (error) {
    // Log error
    logger.error(
      "Get or create broadcast request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "GET",
        path: "/api/broadcast/get-or-create"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
