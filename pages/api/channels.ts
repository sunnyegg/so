import fetchHelix from "@/utils/helix";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { token }: any = req.headers;
    const { broadcasterId }: any = req.query;

    const response = await fetchHelix(
      token,
      `channels?${broadcasterId}`,
      "GET"
    );
    if (!response.ok) {
      throw response.error;
    }

    res.status(200).json({
      data: await response.response?.json(),
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error,
    });
  }
}
