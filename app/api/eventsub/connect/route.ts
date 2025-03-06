import { decrypt } from "@/lib/encryption";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";

export const runtime = "edge";

export default function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.eventsub.connect.handler",
        401
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    return CreateResponseApiSuccess(decryptedToken);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error, "app.api.eventsub.connect.handler");
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.eventsub.connect.handler"
    );
  }
}
