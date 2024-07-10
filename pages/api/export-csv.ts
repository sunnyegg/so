import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "csv-stringify";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data, filename }: any = JSON.parse(req.body);

    const filenameCSV = filename + ".csv";
    const savedPath = path.join("public", filenameCSV);
    const columns = ["username", "present_at"];
    const dataCSV = [];

    for (const val of data) {
      dataCSV.push([val.username, val.present_at]);
    }

    stringify(dataCSV, { header: true, columns: columns }, (err, output) => {
      if (err) throw err;
      fs.writeFile(savedPath, output, (err) => {
        if (err) throw err;
      });
    });

    setTimeout(() => {
      fs.rm(savedPath, (err) => {
        if (err) throw err;
      });
    }, 60 * 1000); // 1 menit apus

    res.status(200).json({
      data: filenameCSV,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error,
    });
  }
}
