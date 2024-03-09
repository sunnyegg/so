import fetchHelix from "@/utils/helix";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { token }: any = req.headers;
    const { id, multiple }: any = req.query;
    let queryFetch = `users`;

    if (multiple) {
      queryFetch = `users?`;
      // id = 1234,5678,91011
      const multipleId = id.split(",");

      multipleId.forEach((val: string, idx: number) => {
        // users? id=
        queryFetch += `id=${val}`;
        if (idx !== multipleId.length - 1) {
          queryFetch += "&";
        }
      });
    }

    console.log(queryFetch);

    // id diisi = &id=1234&id=5678
    const response = await fetchHelix(token, queryFetch, "GET");
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
