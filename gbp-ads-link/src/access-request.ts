/**
 * Orchestrates the Google-supported cross-BM access path:
 * 1) Refuse illegal “add GBP to second Business Manager”
 * 2) Record / track access request (pending → approved/rejected)
 * 3) After approval (or if OAuth already has GBP access), sync into Ads 846-367-3842
 */

import { loadConfig, loadStatusPath, type AppConfig } from "./config.js";
import { checkGbpAccess } from "./business-profile.js";
import { syncBusinessProfileLocations, type SyncResult } from "./ads-location-sync.js";
import { LinkError, toPublicErrorPayload } from "./errors.js";
import {
  assertNotBmTransfer,
  assertSyncAllowed,
  markAccessApproved,
  markAccessRejected,
  markAccessRequested,
  markSyncResult,
  readAccessStatus,
  type AccessRequestRecord,
} from "./status.js";

export type RequestAccessResult = {
  ok: true;
  mode: "already_has_access" | "pending_owner_approval";
  status: AccessRequestRecord;
  locationsFound: number;
  manualSteps: string[];
};

export const MANUAL_APPROVAL_STEPS = [
  "Do NOT add MOTO24 GBP to trulink.in Business Manager (om-8996917152552719760) — Google blocks a second BM ownership.",
  "Keep MOTO24 BM (om-20984726777920736) and Ads 214-921-7342 unchanged.",
  "Preferred (owner-side): In Google Business Profile for “MOTO24 | Two Wheeler Service Centre | Badshahpur”, Users → Add users → invite the Google account used for Ads 846-367-3842 as Manager (or Owner).",
  "Alternate (Ads-side request): Sign in to Google Ads Customer ID 846-367-3842 → Campaigns → Assets → Locations → + Location → Our locations → discover/link the MOTO24 Business Profile (or “Link to any Business Profile”). Submit the access request.",
  "Owner of MOTO24 GBP receives email → Approve the access / manager invite.",
  "After approval: Tools → Data Manager / Linked accounts → Google Business Profile shows linked; Assets → Locations lists MOTO24. Then run `npm run sync` in gbp-ads-link (or mark approved + sync).",
  "Never unlink MOTO24 from BM om-20984726777920736 to “free” the listing for trulink BM.",
] as const;

export async function requestAccessFlow(
  env: NodeJS.ProcessEnv = process.env,
): Promise<RequestAccessResult> {
  // Explicit guard: BM-to-BM location move is unsupported
  void assertNotBmTransfer;

  const statusPath = loadStatusPath(env);

  // If credentials exist, probe live GBP access; otherwise record pending + manual steps only.
  let config: AppConfig | undefined;
  try {
    config = loadConfig(env);
  } catch {
    config = undefined;
  }

  if (config) {
    const access = await checkGbpAccess(config);
    if (access.hasAccess) {
      const status = await markAccessApproved(statusPath);
      return {
        ok: true,
        mode: "already_has_access",
        status,
        locationsFound: access.locations.length,
        manualSteps: [...MANUAL_APPROVAL_STEPS],
      };
    }
  }

  const status = await markAccessRequested(statusPath);
  return {
    ok: true,
    mode: "pending_owner_approval",
    status,
    locationsFound: 0,
    manualSteps: [...MANUAL_APPROVAL_STEPS],
  };
}

export async function syncFlow(
  env: NodeJS.ProcessEnv = process.env,
): Promise<SyncResult> {
  const config = loadConfig(env);
  const statusPath = config.statusPath;
  let record = await readAccessStatus(statusPath);

  // Live re-check: if OAuth can see MOTO24, auto-approve pending
  const access = await checkGbpAccess(config);
  if (access.hasAccess && record.status !== "approved") {
    record = await markAccessApproved(statusPath);
  }

  assertSyncAllowed(record);

  if (!access.hasAccess) {
    if (record.status === "none") {
      await markAccessRequested(statusPath);
      throw new LinkError(
        "ACCESS_REQUEST_PENDING",
        "No GBP access yet. Access request marked pending — complete manual approval steps, then re-run sync.",
      );
    }
    throw new LinkError(
      "PERMISSION_DENIED",
      access.message || "Cannot read MOTO24 locations with current OAuth identity.",
    );
  }

  try {
    const result = await syncBusinessProfileLocations(config);
    await markSyncResult(statusPath, {
      ok: true,
      assetSetResourceName: result.assetSetResourceName,
      message: result.message,
    });
    return result;
  } catch (err) {
    const payload = toPublicErrorPayload(err);
    await markSyncResult(statusPath, { ok: false, message: payload.message });
    throw err;
  }
}

export async function statusFlow(
  env: NodeJS.ProcessEnv = process.env,
): Promise<AccessRequestRecord> {
  return readAccessStatus(loadStatusPath(env));
}

export async function rejectFlow(
  reason?: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<AccessRequestRecord> {
  return markAccessRejected(loadStatusPath(env), reason);
}

export async function approveFlow(
  env: NodeJS.ProcessEnv = process.env,
): Promise<AccessRequestRecord> {
  return markAccessApproved(loadStatusPath(env));
}
