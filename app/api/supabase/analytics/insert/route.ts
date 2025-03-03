import type { NextRequest } from "next/server";
import supabase from "@/configs/supabase";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/utils/api";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("token");
    if (!token) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }
    const body = (await req.json()) as { username: string; type: string };

    const { error } = await supabase
      .from("analytics")
      .insert({ username: body.username, type: body.type });

    if (error) {
      throw new Error(error.message);
    }

    return CreateResponseApiSuccess({ data: "ok" });
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error);
    } else {
      return CreateResponseApiError(new Error("Internal Server Error"));
    }
  }
}
