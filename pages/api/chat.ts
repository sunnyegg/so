import fetchHelix from "@/utils/helix";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { token }: any = req.headers;
    const { from, to }: any = JSON.parse(req.body);
    const body = JSON.stringify({
      broadcaster_id: from,
      sender_id: from,
      message: `!so @${to}`,
    });

    const response = await fetchHelix(token, "chat/messages", "POST", body, {
      "Content-Type": "application/json",
    });
    if (!response.ok) {
      throw response.error;
    }

    const json = await response.response?.json();

    if (json.status !== 200) {
      throw new Error(json.message);
    }

    res.status(200).json({
      data: json,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
}
