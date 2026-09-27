/**
 * Environment-only configuration for GBP ↔ Google Ads linking.
 * No credentials or tokens are hard-coded.
 */

export const PROTECTED_ADS_CUSTOMER_ID = "2149217342"; // MOTO24 BM Ads — never mutate
export const TARGET_ADS_CUSTOMER_ID_CANONICAL = "8463673842"; // trulink.in — sync target
export const MOTO24_BM_ID = "om-20984726777920736";
export const TRULINK_BM_ID = "om-8996917152552719760";

export const OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/business.manage",
] as const;

export type AppConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string | undefined;
  accessToken: string | undefined;
  developerToken: string;
  loginCustomerId: string | undefined;
  /** Digits-only Ads customer id for sync target */
  customerId: string;
  gbpManagerEmail: string;
  businessNameFilter: string | undefined;
  listingId: string | undefined;
  statusPath: string;
};

export function normalizeCustomerId(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function formatCustomerId(digits: string): string {
  const d = normalizeCustomerId(digits);
  if (d.length !== 10) return d;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/**
 * Load config from process.env. Refuses to target the protected MOTO24 Ads ID.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const customerIdRaw =
    env.GOOGLE_ADS_CUSTOMER_ID?.trim() || TARGET_ADS_CUSTOMER_ID_CANONICAL;
  const customerId = normalizeCustomerId(customerIdRaw);

  if (!customerId || customerId.length !== 10) {
    throw new ConfigError(
      `GOOGLE_ADS_CUSTOMER_ID must be a 10-digit Ads customer id (got "${customerIdRaw}").`,
    );
  }

  if (customerId === PROTECTED_ADS_CUSTOMER_ID) {
    throw new ConfigError(
      `Refusing to run against protected Ads Customer ID ${formatCustomerId(PROTECTED_ADS_CUSTOMER_ID)}. ` +
        `Sync target must be ${formatCustomerId(TARGET_ADS_CUSTOMER_ID_CANONICAL)} (trulink.in).`,
    );
  }

  if (customerId !== TARGET_ADS_CUSTOMER_ID_CANONICAL) {
    throw new ConfigError(
      `Unexpected GOOGLE_ADS_CUSTOMER_ID ${formatCustomerId(customerId)}. ` +
        `This tool only syncs to ${formatCustomerId(TARGET_ADS_CUSTOMER_ID_CANONICAL)} and never modifies other Ads IDs.`,
    );
  }

  const clientId = env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim() || undefined;
  const accessToken = env.GOOGLE_OAUTH_ACCESS_TOKEN?.trim() || undefined;
  const developerToken = env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim();
  const loginCustomerIdRaw = env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.trim();
  const loginCustomerId = loginCustomerIdRaw
    ? normalizeCustomerId(loginCustomerIdRaw)
    : undefined;
  const gbpManagerEmail = env.GBP_MANAGER_EMAIL?.trim();
  const businessNameFilter = env.GBP_BUSINESS_NAME_FILTER?.trim() || undefined;
  const listingId = env.GBP_LISTING_ID?.trim() || undefined;
  const statusPath =
    env.GBP_ACCESS_STATUS_PATH?.trim() || "./.data/access-status.json";

  const missing: string[] = [];
  if (!clientId) missing.push("GOOGLE_OAUTH_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_OAUTH_CLIENT_SECRET");
  if (!refreshToken && !accessToken) {
    missing.push("GOOGLE_OAUTH_REFRESH_TOKEN or GOOGLE_OAUTH_ACCESS_TOKEN");
  }
  if (!developerToken) missing.push("GOOGLE_ADS_DEVELOPER_TOKEN");
  if (!gbpManagerEmail) missing.push("GBP_MANAGER_EMAIL");

  if (missing.length) {
    throw new ConfigError(
      `Missing required env vars: ${missing.join(", ")}. See .env.example. Credentials must never be hard-coded.`,
    );
  }

  if (loginCustomerId === PROTECTED_ADS_CUSTOMER_ID) {
    throw new ConfigError(
      `GOOGLE_ADS_LOGIN_CUSTOMER_ID must not be the protected MOTO24 Ads ID ${formatCustomerId(PROTECTED_ADS_CUSTOMER_ID)}.`,
    );
  }

  return {
    clientId: clientId!,
    clientSecret: clientSecret!,
    refreshToken,
    accessToken,
    developerToken: developerToken!,
    loginCustomerId,
    customerId,
    gbpManagerEmail: gbpManagerEmail!,
    businessNameFilter,
    listingId,
    statusPath,
  };
}

/** Partial load for status-only commands that do not call Google APIs. */
export function loadStatusPath(env: NodeJS.ProcessEnv = process.env): string {
  return env.GBP_ACCESS_STATUS_PATH?.trim() || "./.data/access-status.json";
}
