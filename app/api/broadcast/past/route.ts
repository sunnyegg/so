import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";

import { Broadcast } from "@/types/broadcast";

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

export default async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");

    if (!login) {
      return CreateResponseApiError(
        new Error("Missing login parameter"),
        "app.api.broadcast.past.handler",
        400
      );
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.broadcast.past.handler",
        401
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return CreateResponseApiError(
        new Error("User not found"),
        "app.api.broadcast.past.handler",
        404
      );
    }

    const dbRes = await supabase()
      .from("broadcasts")
      .select("*")
      .eq("broadcaster_id", user.id)
      .order("start_date", { ascending: false });

    if (dbRes.status !== 200) {
      return CreateResponseApiError(
        new Error(JSON.stringify(dbRes)),
        "app.api.broadcast.past.handler",
        500
      );
    }

    const dbData: BroadcastDBData[] = dbRes.data || [];

    if (!dbData.length) {
      return CreateResponseApiError(
        new Error("No broadcasts found"),
        "app.api.broadcast.past.handler",
        404
      );
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

    return CreateResponseApiSuccess(outputData);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error, "app.api.broadcast.past.handler");
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.broadcast.past.handler"
    );
  }
}
