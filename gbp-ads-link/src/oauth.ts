import { OAuth2Client } from "google-auth-library";
import { OAUTH_SCOPES, type AppConfig } from "./config.js";
import { LinkError, mapGoogleApiError } from "./errors.js";

export function createOAuthClient(config: AppConfig): OAuth2Client {
  const client = new OAuth2Client(config.clientId, config.clientSecret);
  client.setCredentials({
    refresh_token: config.refreshToken,
    access_token: config.accessToken,
  });
  return client;
}

/**
 * Resolve a fresh access token from refresh token / provided access token.
 */
export async function getAccessToken(config: AppConfig): Promise<string> {
  if (config.accessToken && !config.refreshToken) {
    return config.accessToken;
  }

  const client = createOAuthClient(config);
  try {
    const tokenResponse = await client.getAccessToken();
    const token =
      typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;
    if (!token) {
      throw new LinkError(
        "OAUTH_TOKEN_EXPIRED",
        "Failed to obtain OAuth access token. Re-authorize with scopes: " +
          OAUTH_SCOPES.join(", "),
      );
    }
    return token;
  } catch (err) {
    if (err instanceof LinkError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("invalid_grant")) {
      throw new LinkError("OAUTH_TOKEN_EXPIRED", message, { cause: err });
    }
    if (message.toLowerCase().includes("scope")) {
      throw new LinkError("INSUFFICIENT_SCOPE", message, { cause: err });
    }
    throw mapGoogleApiError(401, { message }, "oauth_token_refresh");
  }
}

export function authUrl(config: Pick<AppConfig, "clientId" | "clientSecret">): string {
  const client = new OAuth2Client(config.clientId, config.clientSecret, "urn:ietf:wg:oauth:2.0:oob");
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [...OAUTH_SCOPES],
  });
}
