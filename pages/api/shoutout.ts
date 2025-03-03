import fetchHelix from "@/utils/helix";
import type { NextApiRequest, NextApiResponse } from "next";

export const runtime = "edge";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { token }: any = req.headers;
    const { from, to, by }: any = JSON.parse(req.body);

    const response = await fetchHelix(
      token,
      `chat/shoutouts?from_broadcaster_id=${from}&to_broadcaster_id=${to}&moderator_id=${by}`,
      "POST"
    );
    if (!response.ok) {
      throw response.error;
    }

    const json = await response.response?.json();

    if (response.response?.status !== 200) {
      throw new Error(json.message);
    }

    res.status(200).json({
      data: json
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      error: error.message
    });
  }
}
