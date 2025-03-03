import fetchHelix from "@/utils/helix";
import type { NextApiRequest, NextApiResponse } from "next";

export const runtime = "edge";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { token }: any = req.headers;
    const { broadcaster_user_id, moderator_user_id, session_id }: any =
      JSON.parse(req.body);
    const body = JSON.stringify({
      type: "channel.channel_points_custom_reward_redemption.add",
      version: 1,
      condition: {
        broadcaster_user_id,
        moderator_user_id
      },
      transport: {
        method: "websocket",
        session_id
      }
    });

    const response = await fetchHelix(
      token,
      "eventsub/subscriptions",
      "POST",
      body,
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

    res.status(200).json({
      data: json.data[0].id
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      error: error.message
    });
  }
}
