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
    const multiple = searchParams.get("multiple");

    if (!id) {
      return CreateResponseApiError(new Error("Bad Request"), 400);
    }

    let queryFetch = "users";
    if (multiple) {
      queryFetch += "?";
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

    // id diisi = &id=1234&id=5678
    const response = await fetchHelix(token, queryFetch, "GET");
    if (!response.ok) {
      throw response.error;
    }

    const json = await response.response?.json();

    if (response.response?.status !== 200) {
      throw new Error(json.message);
    }

    return CreateResponseApiSuccess({ data: json });
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error);
    } else {
      return CreateResponseApiError(new Error("Internal Server Error"));
    }
  }
}
