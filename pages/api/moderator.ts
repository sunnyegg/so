import fetchHelix from "@/utils/helix";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { token }: any = req.headers;
    const { id }: any = req.query;

    const response = await fetchHelix(
      token,
      `moderation/channels?user_id=${id}`,
      "GET"
    );
    if (!response.ok) {
      throw response.error;
    }

    const json = await response.response?.json();

    if (response.response?.status !== 200) {
      throw new Error(json.message);
    }

    res.status(200).json({
      data: json,
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      error: error.message,
    });
  }
}
