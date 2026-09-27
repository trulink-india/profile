/**
 * Google Business Profile (Account Management / Business Information) helpers.
 * Used to verify whether the OAuth identity can already manage the MOTO24 location.
 */

import { getAccessToken } from "./oauth.js";
import type { AppConfig } from "./config.js";
import { LinkError, mapGoogleApiError } from "./errors.js";

const ACCOUNT_MGMT = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";

export type GbpLocationSummary = {
  name: string;
  title?: string;
  storeCode?: string;
  placeId?: string;
};

async function gbpFetch(
  config: AppConfig,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getAccessToken(config);
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

export async function listGbpAccounts(config: AppConfig): Promise<string[]> {
  const res = await gbpFetch(config, `${ACCOUNT_MGMT}/accounts`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw mapGoogleApiError(res.status, body, "list_gbp_accounts");
  }
  const accounts = (body as { accounts?: { name?: string }[] }).accounts || [];
  return accounts.map((a) => a.name).filter((n): n is string => Boolean(n));
}

/**
 * Search locations visible to the OAuth user, optionally filtered by business name.
 */
export async function findMoto24Locations(
  config: AppConfig,
): Promise<GbpLocationSummary[]> {
  const accounts = await listGbpAccounts(config);
  if (!accounts.length) {
    throw new LinkError(
      "PERMISSION_DENIED",
      "No Google Business Profile accounts visible to this OAuth identity. " +
        "Request Manager access on MOTO24 GBP, or complete Ads “link any Business Profile” approval first.",
    );
  }

  const filterName = (config.businessNameFilter || "MOTO24").toLowerCase();
  const found: GbpLocationSummary[] = [];

  for (const account of accounts) {
    const url = `${BUSINESS_INFO}/${account}/locations?readMask=name,title,storeCode,metadata.placeId&pageSize=100`;
    const res = await gbpFetch(config, url);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw mapGoogleApiError(res.status, body, `list_locations:${account}`);
    }
    const locations =
      (body as {
        locations?: {
          name?: string;
          title?: string;
          storeCode?: string;
          metadata?: { placeId?: string };
        }[];
      }).locations || [];

    for (const loc of locations) {
      const title = loc.title || "";
      if (title.toLowerCase().includes(filterName)) {
        found.push({
          name: loc.name || "",
          title,
          storeCode: loc.storeCode,
          placeId: loc.metadata?.placeId,
        });
      }
    }
  }

  return found.filter((l) => l.name);
}

export type AccessCheckResult = {
  hasAccess: boolean;
  locations: GbpLocationSummary[];
  message: string;
};

/**
 * Determine whether the current OAuth user can read MOTO24 locations.
 * This is the gate before Ads LOCATION_SYNC — Google does not allow adding
 * the same profile to a second Business Manager.
 */
export async function checkGbpAccess(config: AppConfig): Promise<AccessCheckResult> {
  try {
    const locations = await findMoto24Locations(config);
    if (!locations.length) {
      return {
        hasAccess: false,
        locations: [],
        message:
          "OAuth user can reach GBP accounts but no location matched the MOTO24 filter. " +
          "Confirm GBP_BUSINESS_NAME_FILTER / listing access, or keep access request pending.",
      };
    }
    return {
      hasAccess: true,
      locations,
      message: `Found ${locations.length} MOTO24 location(s) visible to ${config.gbpManagerEmail}.`,
    };
  } catch (err) {
    if (err instanceof LinkError) {
      if (
        err.code === "PERMISSION_DENIED" ||
        err.code === "INSUFFICIENT_SCOPE" ||
        err.code === "OAUTH_TOKEN_EXPIRED" ||
        err.code === "NOT_FOUND"
      ) {
        return {
          hasAccess: false,
          locations: [],
          message: err.message,
        };
      }
    }
    throw err;
  }
}
