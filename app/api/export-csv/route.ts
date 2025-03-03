import type { NextRequest } from "next/server";
import { stringify } from "csv-stringify";
import fs from "fs";
import path from "path";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/utils/api";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      data: { username: string; present_at: string }[];
      filename: string;
    };

    const filenameCSV = body.filename + ".csv";
    const savedPath = path.join("public", filenameCSV);
    const columns = ["username", "present_at"];
    const dataCSV = [];

    for (const val of body.data) {
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

    return CreateResponseApiSuccess({ data: filenameCSV });
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error);
    } else {
      return CreateResponseApiError(new Error("Internal Server Error"));
    }
  }
}
