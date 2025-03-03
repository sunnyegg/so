import { CreateResponseApiError, CreateResponseApiSuccess } from "@/utils/api";
import fetchHelix from "@/utils/helix";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("token");
    if (!token) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const body = (await req.json()) as { from: string; to: string; by: string };
    if (!body.from || !body.to || !body.by) {
      return CreateResponseApiError(new Error("Bad Request"), 400);
    }

    const payload = JSON.stringify({
      broadcaster_id: body.from,
      sender_id: body.by,
      message: `!so @${body.to}`
    });

    const response = await fetchHelix(token, "chat/messages", "POST", payload, {
      "Content-Type": "application/json"
    });
    if (!response.ok) {
      throw response.error;
    }

    const data = await response.response?.json();

    if (response.response?.status !== 200) {
      throw new Error(data.message);
    }

    return CreateResponseApiSuccess({ data });
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error);
    } else {
      return CreateResponseApiError(new Error("Internal Server Error"));
    }
  }
}
