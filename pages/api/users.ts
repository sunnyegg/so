import fetchHelix from "@/utils/helix";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { token, id }: any = req.query;

    // id diisi = &id=1234&id=5678
    const response = await fetchHelix(
      token,
      id ? `users${id}` : "users",
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
