import { CreateResponseApiError, CreateResponseApiSuccess } from "@/utils/api";
import fetchHelix from "@/utils/helix";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("token");
    if (!token) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const { searchParams } = new URL(req.url);
    const broadcasterId = searchParams.get("broadcasterId");
    if (!broadcasterId) {
      return CreateResponseApiError(new Error("Bad Request"), 400);
    }

    const response = await fetchHelix(
      token,
      `channels?${broadcasterId}`,
      "GET"
    );
    if (!response.ok) {
      throw response.error;
    }
    const data = await response.response?.json();

    return CreateResponseApiSuccess({ data });
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error);
    } else {
      return CreateResponseApiError(new Error("Internal Server Error"));
    }
  }
}
