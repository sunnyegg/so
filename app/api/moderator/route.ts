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
    const id = searchParams.get("id");

    if (!id) {
      return CreateResponseApiError(new Error("Bad Request"), 400);
    }

    const response = await fetchHelix(
      token,
      `moderation/channels?user_id=${id}`,
      "GET"
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
