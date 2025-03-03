import { CreateResponseApiError, CreateResponseApiSuccess } from "@/utils/api";
import fetchHelix from "@/utils/helix";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("token");
    if (!token) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }
    const body = (await req.json()) as {
      broadcaster_user_id: string;
      moderator_user_id: string;
      session_id: string;
    };

    const payload = JSON.stringify({
      type: "channel.channel_points_custom_reward_redemption.add",
      version: 1,
      condition: {
        broadcaster_user_id: body.broadcaster_user_id,
        moderator_user_id: body.moderator_user_id
      },
      transport: {
        method: "websocket",
        session_id: body.session_id
      }
    });

    const response = await fetchHelix(
      token,
      "eventsub/subscriptions",
      "POST",
      payload,
      {
        "Content-Type": "application/json"
      }
    );
    if (!response.ok) {
      throw response.error;
    }

    const json = await response.response?.json();

    if (
      response.response?.status !== 200 &&
      response.response?.status !== 202
    ) {
      throw new Error(json.message);
    }

    return CreateResponseApiSuccess({ data: json.data[0].id });
  } catch (error: any) {
    if (error instanceof Error) {
      return CreateResponseApiError(error);
    } else {
      return CreateResponseApiError(new Error("Internal Server Error"));
    }
  }
}
