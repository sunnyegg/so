// Types for Twitch API responses
type TwitchTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
};

type TwitchAppTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type TwitchUserResponse = {
  data: {
    id: string;
    login: string;
    display_name: string;
    profile_image_url: string;
    broadcaster_type: string;
  }[];
};

type TwitchStreamResponse = {
  data: {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: string;
    title: string;
    viewer_count: number;
    started_at: string;
    language: string;
    thumbnail_url: string;
    tag_ids: string[];
    is_mature: boolean;
  }[];
};

type TwitchChannelResponse = {
  data: {
    broadcaster_id: string;
    broadcaster_name: string;
    broadcaster_login: string;
    broadcaster_language: string;
    game_id: string;
    game_name: string;
    title: string;
    delay: number;
    tags: string[];
    content_classification_labels: string[];
    is_branded_content: boolean;
  }[];
};

type TwitchChannelFollowersResponse = {
  total: number;
  data: {
    user_id: string;
    user_login: string;
    user_name: string;
    followed_at: string;
  }[];
  pagination: {
    cursor: string;
  };
};

type TwitchModeratedChannelsResponse = {
  data: {
    broadcaster_id: string;
    broadcaster_name: string;
    broadcaster_login: string;
  }[];
};

type TwitchEventSubResponse = {
  data: {
    id: string;
    status: string;
    type: string;
    version: string;
    condition: Record<string, string>;
    created_at: string;
    transport: {
      method: string;
      callback: string;
    };
    cost: number;
  }[];
  total: number;
  total_cost: number;
  max_total_cost: number;
};

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
const CLIENT_SECRET = process.env.NEXT_TWITCH_CLIENT_SECRET as string;
const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL +
  "/auth/login") as string;

// Cache for API tokens to avoid unnecessary token refreshes
const tokenCache = new Map<
  string,
  {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }
>();

// Cache for app access token
let appTokenCache: {
  accessToken: string;
  expiresAt: number;
} | null = null;

/**
 * Get app access token for server-to-server API calls
 */
export const getAppAccessToken = async (): Promise<string> => {
  // Check if we have a cached and valid token
  if (appTokenCache && Date.now() < appTokenCache.expiresAt) {
    return appTokenCache.accessToken;
  }

  // Get new app access token
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "client_credentials"
  });

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to get app access token: ${response.statusText}`);
  }

  const data = (await response.json()) as TwitchAppTokenResponse;

  // Cache the new token
  appTokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };

  return data.access_token;
};

/**
 * Get the authorization URL for Twitch OAuth
 */
export const getAuthorizationUrl = (): string => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope:
      "chat:read chat:edit moderator:read:followers moderator:manage:shoutouts user:write:chat channel:read:redemptions channel:manage:redemptions user:read:moderated_channels channel:read:subscriptions user:read:chat channel:bot user:bot"
  });

  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCode = async (
  code: string
): Promise<TwitchTokenResponse> => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI
  });

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Refresh an access token using a refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<TwitchTokenResponse> => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Validate an access token
 */
export const validateToken = async (accessToken: string): Promise<boolean> => {
  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: {
      Authorization: `OAuth ${accessToken}`
    }
  });

  return response.ok;
};

/**
 * Get user information using an access token
 */
export const getUserInfo = async (
  accessToken: string
): Promise<TwitchUserResponse> => {
  const response = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": CLIENT_ID
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get user information using an access token and login
 */
export const getUserInfoByLogin = async (
  accessToken: string,
  login: string
): Promise<TwitchUserResponse> => {
  const response = await fetch(
    `https://api.twitch.tv/helix/users?login=${login}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": CLIENT_ID
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get user info by login: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get user information using an access token and login
 */
export const getUserInfoById = async (
  accessToken: string,
  id: string
): Promise<TwitchUserResponse> => {
  const response = await fetch(`https://api.twitch.tv/helix/users?id=${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": CLIENT_ID
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info by id: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get stream information using an access token and login.
 */
export const getStreamInfoByLogin = async (
  accessToken: string,
  login: string
): Promise<TwitchStreamResponse> => {
  const response = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${login}&type=live`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": CLIENT_ID
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get stream info by login: ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * Get stream information using an access token and user id.
 */
export const getStreamInfoById = async (
  accessToken: string,
  userId: string
): Promise<TwitchStreamResponse> => {
  const response = await fetch(
    `https://api.twitch.tv/helix/streams?user_id=${userId}&type=live`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": CLIENT_ID
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get stream info by id: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get channel information using an access token and broadcaster id.
 */
export const getChannelInfoById = async (
  accessToken: string,
  broadcasterId: string
): Promise<TwitchChannelResponse> => {
  const response = await fetch(
    `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": CLIENT_ID
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get channel info by id: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get channel followers information using an access token and broadcaster id.
 */
export const getChannelFollowers = async (
  accessToken: string,
  broadcasterId: string
): Promise<TwitchChannelFollowersResponse> => {
  const response = await fetch(
    `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": CLIENT_ID
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get channel followers: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get moderated channels information using an access token and user id.
 */
export const getModeratedChannels = async (
  accessToken: string,
  userId: string
): Promise<TwitchModeratedChannelsResponse> => {
  const response = await fetch(
    `https://api.twitch.tv/helix/moderation/channels?user_id=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": CLIENT_ID
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get channel followers: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get a cached or refreshed access token
 */
export const getValidAccessToken = async (userId: string): Promise<string> => {
  const cached = tokenCache.get(userId);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.accessToken;
  }

  if (cached?.refreshToken) {
    try {
      const newTokens = await refreshAccessToken(cached.refreshToken);
      tokenCache.set(userId, {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
        expiresAt: Date.now() + newTokens.expires_in * 1000
      });
      return newTokens.access_token;
    } catch (error) {
      tokenCache.delete(userId);
      throw error;
    }
  }

  throw new Error("No valid token found and no refresh token available");
};

/**
 * Store tokens in cache
 */
export const cacheTokens = (
  userId: string,
  tokens: TwitchTokenResponse
): void => {
  tokenCache.set(userId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000
  });
};

/**
 * Receive message from chat using eventsub subscription
 */
export const receiveMessageFromChat = async (
  accessToken: string,
  userId: string
): Promise<void> => {
  const response = await fetch(
    `https://api.twitch.tv/helix/chat/eventsub/subscriptions`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        type: "channel.chat.message",
        version: "1",
        condition: {
          broadcaster_user_id: userId,
          user_id: userId
        },
        transport: {
          method: "webhook",
          callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/chat/eventsub/callback`
        }
      })
    }
  );

  return response.json();
};

/**
 * Create an EventSub subscription using app access token
 */
export const createEventSubSubscriptionWithAppToken = async (
  type: string,
  version: string,
  condition: Record<string, string>
): Promise<TwitchEventSubResponse> => {
  const appToken = await getAppAccessToken();

  const response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appToken}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type,
        version,
        condition,
        transport: {
          method: "webhook",
          callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/chat/eventsub/callback`,
          secret: process.env.NEXT_TWITCH_WEBHOOK_SECRET
        }
      })
    }
  );

  if (!response.ok) {
    const responseData = await response.json();
    console.log(responseData);
    throw new Error(
      `Failed to create EventSub subscription: ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * List all EventSub subscriptions using app access token
 */
export const listEventSubSubscriptionsWithAppToken = async (
  status?: string
): Promise<TwitchEventSubResponse> => {
  const appToken = await getAppAccessToken();
  const url = new URL("https://api.twitch.tv/helix/eventsub/subscriptions");
  if (status) {
    url.searchParams.append("status", status);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${appToken}`,
      "Client-Id": CLIENT_ID
    }
  });

  if (!response.ok) {
    throw new Error(
      `Failed to list EventSub subscriptions: ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * Delete an EventSub subscription using app access token
 */
export const deleteEventSubSubscriptionWithAppToken = async (
  subscriptionId: string
): Promise<void> => {
  const appToken = await getAppAccessToken();
  const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${appToken}`,
        "Client-Id": CLIENT_ID
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to delete EventSub subscription: ${response.statusText}`
    );
  }
};

// Clear both user token and app token caches periodically
setInterval(
  () => {
    tokenCache.clear();
    appTokenCache = null;
  },
  24 * 60 * 60 * 1000
); // Clear every 24 hours
