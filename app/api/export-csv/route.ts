import type { NextRequest } from "next/server";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/utils/api";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      data: { username: string; present_at: string }[];
    };

    const columns = ["username", "present_at"];
    const dataCSV = [columns];
    let outputCSV = "";

    for (const val of body.data) {
      dataCSV.push([val.username, val.present_at]);
    }

    // csv to string
    outputCSV = toCSV(dataCSV);

    // string to base64
    const base64 = Buffer.from(outputCSV).toString("base64");

    return CreateResponseApiSuccess({ data: base64 });
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error);
    } else {
      return CreateResponseApiError(new Error("Internal Server Error"));
    }
  }
}

// array to csv
const toCSV = (array: string[][]) => {
  return array.map((row) => row.join(",")).join("\n");
};
