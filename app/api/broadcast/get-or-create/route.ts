import supabase from "@/db/supabase";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";

import { Broadcast } from "@/types/broadcast";

export const runtime = "edge";

export default async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");

    if (!login) {
      return CreateResponseApiError(
        new Error("Missing login parameter"),
        "app.api.broadcast.get-or-create.handler",
        400
      );
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.broadcast.get-or-create.handler",
        401
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const currentBroadcast = await apiClient.streams.getStreamByUserName(login);
    if (!currentBroadcast) {
      return CreateResponseApiError(
        new Error("Stream not found"),
        "app.api.broadcast.get-or-create.handler",
        404
      );
    }

    // check db
    const dbRes = await supabase()
      .from("broadcasts")
      .select("*")
      .eq("stream_id", currentBroadcast.id)
      .limit(1)
      .order("start_date", { ascending: false });

    if (dbRes.status !== 200) {
      return CreateResponseApiError(
        new Error(JSON.stringify(dbRes)),
        "app.api.broadcast.get-or-create.handler",
        500
      );
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
        return CreateResponseApiError(
          new Error(JSON.stringify(createRes)),
          "app.api.broadcast.get-or-create.handler",
          500
        );
      }
    }

    return CreateResponseApiSuccess(outputData);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(
        error,
        "app.api.broadcast.get-or-create.handler"
      );
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.broadcast.get-or-create.handler"
    );
  }
}
