import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import {
  CreateResponseApiError,
  CreateResponseApiSuccess,
  log
} from "@/lib/utils";
import { NextRequest } from "next/server";

import supabase from "@/db/supabase";

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

export const runtime = "edge";

export default async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");
    const id = searchParams.get("id");

    if (!login || !id) {
      return CreateResponseApiError(
        new Error("Missing required parameters"),
        "app.api.broadcast.detail.handler",
        400
      );
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.broadcast.detail.handler",
        401
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    // check if data is already in cache
    if (BroadcastAttendance.has(id)) {
      return CreateResponseApiSuccess(BroadcastAttendance.get(id)!);
    }

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return CreateResponseApiError(
        new Error("User not found"),
        "app.api.broadcast.detail.handler",
        404
      );
    }

    const dbRes = await supabase()
      .from("attendance")
      .select("*")
      .eq("stream_id", id)
      .order("present_at", { ascending: true });

    if (dbRes.status !== 200) {
      return CreateResponseApiError(
        new Error(JSON.stringify(dbRes)),
        "app.api.broadcast.detail.handler",
        500
      );
    }

    const dbData: AttendanceDBData[] = dbRes.data || [];

    if (!dbData.length) {
      return CreateResponseApiError(
        new Error("No data found"),
        "app.api.broadcast.detail.handler",
        404
      );
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
    BroadcastAttendance.set(id, outputData);

    return CreateResponseApiSuccess(outputData);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error, "app.api.broadcast.detail.handler");
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.broadcast.detail.handler"
    );
  }
}

setInterval(
  () => {
    log(
      "info",
      "app.api.broadcast.detail.setInterval",
      `Clearing BroadcastAttendance of ${BroadcastAttendance.size} entries`
    );
    BroadcastAttendance.clear();
  },
  1000 * 60 * 60 * 12
); // every 12 hours
