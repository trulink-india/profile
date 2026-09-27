/**
 * Sync MOTO24 GBP locations into Google Ads customer 846-367-3842 via
 * LOCATION_SYNC + BusinessProfileLocationSet (Google-supported API flow).
 *
 * Requires the OAuth identity to already have GBP read/manage permission.
 * Does not create Ads accounts, change customer IDs, or touch BM ownership.
 */

import type { AppConfig } from "./config.js";
import { formatCustomerId } from "./config.js";
import { LinkError, mapGoogleApiError } from "./errors.js";
import { getAccessToken } from "./oauth.js";

const ADS_API_VERSION = "v19";
const ADS_BASE = `https://googleads.googleapis.com/${ADS_API_VERSION}`;

export type SyncResult = {
  ok: true;
  customerId: string;
  assetSetResourceName: string;
  customerAssetSetResourceName: string;
  message: string;
};

async function adsMutate(
  config: AppConfig,
  path: string,
  body: unknown,
): Promise<unknown> {
  const userToken = await getAccessToken(config);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${userToken}`,
    "developer-token": config.developerToken,
    "Content-Type": "application/json",
  };
  if (config.loginCustomerId) {
    headers["login-customer-id"] = config.loginCustomerId;
  }

  const res = await fetch(`${ADS_BASE}/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const responseBody = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw mapGoogleApiError(res.status, responseBody, path);
  }
  return responseBody;
}

async function adsSearch(
  config: AppConfig,
  customerId: string,
  query: string,
): Promise<unknown[]> {
  const userToken = await getAccessToken(config);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${userToken}`,
    "developer-token": config.developerToken,
    "Content-Type": "application/json",
  };
  if (config.loginCustomerId) {
    headers["login-customer-id"] = config.loginCustomerId;
  }

  const res = await fetch(`${ADS_BASE}/customers/${customerId}/googleAds:searchStream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });
  const responseBody = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw mapGoogleApiError(res.status, responseBody, "googleAds:searchStream");
  }

  // searchStream may return an array of chunks or a single object
  if (Array.isArray(responseBody)) {
    return responseBody.flatMap((chunk) => chunk.results || []);
  }
  return (responseBody as { results?: unknown[] }).results || [];
}

/**
 * Find an existing ENABLED LOCATION_SYNC asset set, if any.
 * Google allows only one active location sync asset set per customer.
 */
export async function findExistingLocationSync(
  config: AppConfig,
): Promise<string | undefined> {
  const query = `
    SELECT asset_set.resource_name, asset_set.type, asset_set.status, asset_set.name
    FROM asset_set
    WHERE asset_set.type = 'LOCATION_SYNC'
      AND asset_set.status = 'ENABLED'
  `;
  const results = await adsSearch(config, config.customerId, query);
  for (const row of results) {
    const resourceName = (row as { assetSet?: { resourceName?: string } }).assetSet
      ?.resourceName;
    if (resourceName) return resourceName;
  }
  return undefined;
}

/**
 * Create LOCATION_SYNC asset set from Business Profile and attach to customer.
 */
export async function syncBusinessProfileLocations(
  config: AppConfig,
): Promise<SyncResult> {
  if (config.customerId !== "8463673842") {
    throw new LinkError(
      "CONFIG_ERROR",
      `Refusing sync: customer must be 846-367-3842, got ${formatCustomerId(config.customerId)}`,
    );
  }

  const existing = await findExistingLocationSync(config);
  if (existing) {
    return {
      ok: true,
      customerId: config.customerId,
      assetSetResourceName: existing,
      customerAssetSetResourceName: `customers/${config.customerId}/customerAssetSets/${existing.split("/").pop()}`,
      message:
        `Location sync asset set already present on Ads ${formatCustomerId(config.customerId)}: ${existing}. ` +
        "No destructive recreate performed.",
    };
  }

  // Proof token for BusinessProfileLocationSet must be the same Google account
  // as email_address, with business.manage scope.
  const gbpProofToken = await getAccessToken(config);

  const businessProfileLocationSet: Record<string, unknown> = {
    httpAuthorizationToken: gbpProofToken,
    emailAddress: config.gbpManagerEmail,
  };
  if (config.businessNameFilter) {
    businessProfileLocationSet.businessNameFilter = config.businessNameFilter;
  }
  if (config.listingId) {
    // listing_id_filters expects signed int64 strings in JSON
    businessProfileLocationSet.listingIdFilters = [config.listingId];
  }

  const createAssetSetBody = {
    operations: [
      {
        create: {
          name: "MOTO24 GBP Location Sync",
          type: "LOCATION_SYNC",
          locationSet: {
            locationOwnershipType: "BUSINESS_OWNER",
            businessProfileLocationSet,
          },
        },
      },
    ],
    partialFailure: false,
  };

  const createResponse = (await adsMutate(
    config,
    `customers/${config.customerId}/assetSets:mutate`,
    createAssetSetBody,
  )) as {
    results?: { resourceName?: string }[];
  };

  const assetSetResourceName = createResponse.results?.[0]?.resourceName;
  if (!assetSetResourceName) {
    throw new LinkError(
      "GOOGLE_API_ERROR",
      "AssetSet mutate succeeded but returned no resourceName",
      { details: createResponse },
    );
  }

  const attachBody = {
    operations: [
      {
        create: {
          assetSet: assetSetResourceName,
          customer: `customers/${config.customerId}`,
        },
      },
    ],
    partialFailure: false,
  };

  const attachResponse = (await adsMutate(
    config,
    `customers/${config.customerId}/customerAssetSets:mutate`,
    attachBody,
  )) as {
    results?: { resourceName?: string }[];
  };

  const customerAssetSetResourceName = attachResponse.results?.[0]?.resourceName;
  if (!customerAssetSetResourceName) {
    throw new LinkError(
      "GOOGLE_API_ERROR",
      "CustomerAssetSet mutate succeeded but returned no resourceName",
      { details: attachResponse },
    );
  }

  return {
    ok: true,
    customerId: config.customerId,
    assetSetResourceName,
    customerAssetSetResourceName,
    message:
      `Synced MOTO24 Business Profile locations into Google Ads ${formatCustomerId(config.customerId)}. ` +
      "Location assets are generated by Google asynchronously (often within minutes; UI may take longer).",
  };
}
