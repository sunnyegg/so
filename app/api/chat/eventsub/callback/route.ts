import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import crypto from "crypto";

const TWITCH_MESSAGE_ID = "Twitch-Eventsub-Message-Id";
const TWITCH_MESSAGE_TIMESTAMP = "Twitch-Eventsub-Message-Timestamp";
const TWITCH_MESSAGE_SIGNATURE = "Twitch-Eventsub-Message-Signature";
const TWITCH_MESSAGE_TYPE = "Twitch-Eventsub-Message-Type";
const MESSAGE_TYPE_VERIFICATION = "webhook_callback_verification";
const MESSAGE_TYPE_NOTIFICATION = "notification";
const MESSAGE_TYPE_REVOCATION = "revocation";

/**
 * Verify that the request came from Twitch using the message signature
 */
function verifyTwitchSignature(req: NextRequest, body: string): boolean {
  const messageId = req.headers.get(TWITCH_MESSAGE_ID);
  const timestamp = req.headers.get(TWITCH_MESSAGE_TIMESTAMP);
  const messageSignature = req.headers.get(TWITCH_MESSAGE_SIGNATURE);

  if (!messageId || !timestamp || !messageSignature) {
    return false;
  }

  const secret = process.env.NEXT_TWITCH_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("TWITCH_WEBHOOK_SECRET is not set");
  }

  // Create the message string
  const message = messageId + timestamp + body;

  // Create the HMAC
  const hmac = crypto.createHmac("sha256", secret);
  const expectedSignature = "sha256=" + hmac.update(message).digest("hex");

  // Compare signatures
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(messageSignature)
  );
}

/**
 * Handle different types of EventSub messages
 */
async function handleEventSubMessage(type: string, body: any) {
  switch (type) {
    case MESSAGE_TYPE_VERIFICATION:
      // Return the challenge for subscription verification
      return new Response(body.challenge, {
        status: 200
      });

    case MESSAGE_TYPE_NOTIFICATION:
      // Handle the event notification
      await handleEventNotification(body);
      return CreateResponseApiSuccess(null);

    case MESSAGE_TYPE_REVOCATION:
      // Handle the subscription revocation
      logger.warn("EventSub subscription revoked", {
        subscription: body.subscription
      });
      return CreateResponseApiSuccess(null);

    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

/**
 * Handle different types of event notifications
 */
async function handleEventNotification(body: any) {
  const { subscription, event } = body;

  switch (subscription.type) {
    case "channel.follow":
      // Handle follow event
      await handleFollowEvent(event);
      break;

    case "stream.online":
      // Handle stream online event
      await handleStreamOnlineEvent(event);
      break;

    case "stream.offline":
      // Handle stream offline event
      await handleStreamOfflineEvent(event);
      break;

    case "channel.raid":
      // Handle raid event
      await handleRaidEvent(event);
      break;

    case "channel.channel_points_custom_reward_redemption.add":
      // Handle reward redemption event
      await handleRewardRedemptionEvent(event);
      break;

    case "channel.chat.message":
      // Handle chat message event
      await handleChatMessageEvent(event);
      break;

    default:
      logger.warn("Unhandled event type", {
        type: subscription.type,
        event
      });
  }
}

/**
 * Handle follow events
 */
async function handleFollowEvent(event: any) {
  logger.info("Follow event received", {
    user_id: event.user_id,
    user_login: event.user_login,
    user_name: event.user_name,
    broadcaster_user_id: event.broadcaster_user_id,
    followed_at: event.followed_at
  });
  // Implement your follow event handling logic here
}

/**
 * Handle stream online events
 */
async function handleStreamOnlineEvent(event: any) {
  logger.info("Stream online event received", {
    broadcaster_user_id: event.broadcaster_user_id,
    broadcaster_user_login: event.broadcaster_user_login,
    broadcaster_user_name: event.broadcaster_user_name,
    type: event.type,
    started_at: event.started_at
  });
  // Implement your stream online event handling logic here
}

/**
 * Handle stream offline events
 */
async function handleStreamOfflineEvent(event: any) {
  logger.info("Stream offline event received", {
    broadcaster_user_id: event.broadcaster_user_id,
    broadcaster_user_login: event.broadcaster_user_login,
    broadcaster_user_name: event.broadcaster_user_name
  });
  // Implement your stream offline event handling logic here
}

/**
 * Handle raid events
 */
async function handleRaidEvent(event: any) {
  logger.info("Raid event received", {
    from_broadcaster_user_id: event.from_broadcaster_user_id,
    from_broadcaster_user_login: event.from_broadcaster_user_login,
    from_broadcaster_user_name: event.from_broadcaster_user_name,
    to_broadcaster_user_id: event.to_broadcaster_user_id,
    to_broadcaster_user_login: event.to_broadcaster_user_login,
    to_broadcaster_user_name: event.to_broadcaster_user_name,
    viewers: event.viewers
  });
  // Implement your raid event handling logic here
}

/**
 * Handle channel points reward redemption events
 */
async function handleRewardRedemptionEvent(event: any) {
  logger.info("Reward redemption event received", {
    broadcaster_user_id: event.broadcaster_user_id,
    user_id: event.user_id,
    user_login: event.user_login,
    user_name: event.user_name,
    reward: event.reward,
    status: event.status
  });
  // Implement your reward redemption event handling logic here
}

/**
 * Handle chat message events
 */
async function handleChatMessageEvent(event: any) {
  logger.info("Chat message event received", {
    broadcaster_user_id: event.broadcaster_user_id,
    user_id: event.user_id,
    user_login: event.user_login,
    user_name: event.user_name,
    message: event.message,
    timestamp: event.timestamp
  });
  // Implement your chat message event handling logic here
}

export async function POST(req: NextRequest) {
  const requestId = nanoid();
  try {
    const body = await req.text();

    // Verify the request is from Twitch
    if (!verifyTwitchSignature(req, body)) {
      return CreateResponseApiError(new Error("Invalid signature"), 403);
    }

    const messageType = req.headers.get(TWITCH_MESSAGE_TYPE);
    if (!messageType) {
      return CreateResponseApiError(new Error("Missing message type"), 400);
    }

    // Parse the body as JSON
    const jsonBody = JSON.parse(body);

    // Log the incoming webhook
    logger.info("EventSub webhook received", {
      requestId,
      messageType,
      body: jsonBody
    });

    // Handle the message
    return handleEventSubMessage(messageType, jsonBody);
  } catch (error) {
    logger.error(
      "EventSub webhook error",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      { requestId }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
