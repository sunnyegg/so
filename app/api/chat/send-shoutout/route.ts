import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";

export const runtime = "edge";

export default async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.chat.send-shoutout.handler",
        401
      );
    }

    const body = await req.json();
    const { from, to } = body;

    if (!from || !to) {
      return CreateResponseApiError(
        new Error("Missing required parameters"),
        "app.api.chat.send-shoutout.handler",
        400
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const broadcaster = await apiClient.users.getUserByName(from);
    if (!broadcaster) {
      return CreateResponseApiError(
        new Error("Broadcaster not found"),
        "app.api.chat.send-shoutout.handler",
        404
      );
    }

    const user = await apiClient.users.getUserByName(to);
    if (!user) {
      return CreateResponseApiError(
        new Error("Target user not found"),
        "app.api.chat.send-shoutout.handler",
        404
      );
    }

    await apiClient.chat.shoutoutUser(broadcaster.id, user.id);

    return CreateResponseApiSuccess(null);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(
        error,
        "app.api.chat.send-shoutout.handler"
      );
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.chat.send-shoutout.handler"
    );
  }
}
