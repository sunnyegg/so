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

    const response = await fetchHelix(
      token,
      `chat/shoutouts?from_broadcaster_id=${body.from}&to_broadcaster_id=${body.to}&moderator_id=${body.by}`,
      "POST"
    );
    if (!response.ok) {
      throw response.error;
    }

    const json = await response.response?.json();

    if (response.response?.status !== 200) {
      throw new Error(json.message);
    }

    return CreateResponseApiSuccess({ data: json });
  } catch (error: any) {
    if (error instanceof Error) {
      return CreateResponseApiError(error);
    } else {
      return CreateResponseApiError(new Error("Internal Server Error"));
    }
  }
}
