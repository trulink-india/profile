/**
 * Local persistence for GBP access-request lifecycle.
 * Google’s “request access” / owner approval happens in GBP / Ads UI;
 * this store tracks pending → approved | rejected for the API/CLI/UI layer.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { LinkError } from "./errors.js";

export type AccessRequestStatus = "none" | "pending" | "approved" | "rejected";

export type AccessRequestRecord = {
  status: AccessRequestStatus;
  /** Ads customer that should receive location sync after approval */
  targetAdsCustomerId: string;
  /** Business Manager that already owns the GBP — must not be unlinked */
  owningBusinessManagerId: string;
  /** BM that must NOT receive a duplicate location add */
  blockedBusinessManagerId: string;
  profileLabel: string;
  requestedAt?: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  /** Last sync outcome after approval */
  lastSync?: {
    at: string;
    assetSetResourceName?: string;
    ok: boolean;
    message?: string;
  };
};

const DEFAULT_RECORD: Omit<AccessRequestRecord, "updatedAt"> = {
  status: "none",
  targetAdsCustomerId: "8463673842",
  owningBusinessManagerId: "om-20984726777920736",
  blockedBusinessManagerId: "om-8996917152552719760",
  profileLabel: "MOTO24 | Two Wheeler Service Centre | Badshahpur",
};

export async function readAccessStatus(statusPath: string): Promise<AccessRequestRecord> {
  try {
    const raw = await readFile(statusPath, "utf8");
    return JSON.parse(raw) as AccessRequestRecord;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return { ...DEFAULT_RECORD, updatedAt: new Date().toISOString() };
    }
    throw err;
  }
}

async function writeAccessStatus(
  statusPath: string,
  record: AccessRequestRecord,
): Promise<AccessRequestRecord> {
  await mkdir(path.dirname(path.resolve(statusPath)), { recursive: true });
  const next = { ...record, updatedAt: new Date().toISOString() };
  await writeFile(statusPath, JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}

export async function markAccessRequested(
  statusPath: string,
  notes?: string,
): Promise<AccessRequestRecord> {
  const current = await readAccessStatus(statusPath);
  if (current.status === "approved") {
    return current;
  }
  return writeAccessStatus(statusPath, {
    ...DEFAULT_RECORD,
    ...current,
    status: "pending",
    requestedAt: current.requestedAt || new Date().toISOString(),
    notes:
      notes ||
      "Access request submitted via Google Ads Assets → Location → Link any Business Profile, " +
        "or GBP manager invite from MOTO24 owner. Do NOT add location to trulink BM.",
  });
}

export async function markAccessApproved(statusPath: string): Promise<AccessRequestRecord> {
  const current = await readAccessStatus(statusPath);
  return writeAccessStatus(statusPath, {
    ...current,
    status: "approved",
    approvedAt: new Date().toISOString(),
    rejectedAt: undefined,
    rejectionReason: undefined,
  });
}

export async function markAccessRejected(
  statusPath: string,
  reason?: string,
): Promise<AccessRequestRecord> {
  const current = await readAccessStatus(statusPath);
  return writeAccessStatus(statusPath, {
    ...current,
    status: "rejected",
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason || "Owner rejected or did not grant manager access",
  });
}

export async function markSyncResult(
  statusPath: string,
  result: { ok: boolean; assetSetResourceName?: string; message?: string },
): Promise<AccessRequestRecord> {
  const current = await readAccessStatus(statusPath);
  return writeAccessStatus(statusPath, {
    ...current,
    lastSync: {
      at: new Date().toISOString(),
      assetSetResourceName: result.assetSetResourceName,
      ok: result.ok,
      message: result.message,
    },
  });
}

export function assertSyncAllowed(record: AccessRequestRecord): void {
  if (record.status === "pending") {
    throw new LinkError(
      "ACCESS_REQUEST_PENDING",
      "GBP access request is still pending owner approval. Sync is blocked until status is approved.",
    );
  }
  if (record.status === "rejected") {
    throw new LinkError(
      "ACCESS_REQUEST_REJECTED",
      `GBP access was rejected${record.rejectionReason ? `: ${record.rejectionReason}` : ""}.`,
    );
  }
}

export function assertNotBmTransfer(): LinkError {
  return new LinkError(
    "UNSUPPORTED_BM_TRANSFER",
    "Cannot add MOTO24 GBP to trulink.in Business Manager while it remains on MOTO24 BM. " +
      "Google allows only one BM ownership. Supported path: grant Manager access on the existing " +
      "profile (or Ads “link any Business Profile” request), then sync locations into Ads 846-367-3842.",
  );
}
