import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "@/configs/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { token }: any = req.headers;
    const { username, type }: any = JSON.parse(req.body);

    if (!token) {
      throw new Error("unauthenticated");
    }

    const { error } = await supabase
      .from("analytics")
      .insert({ username, type });

    console.log(error);
    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      data: "ok",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error,
    });
  }
}
