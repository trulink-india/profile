import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  assertNotBmTransfer,
  assertSyncAllowed,
  markAccessApproved,
  markAccessRejected,
  markAccessRequested,
  readAccessStatus,
} from "../status.js";
import { LinkError } from "../errors.js";

describe("access status lifecycle", () => {
  it("starts as none and moves pending → approved", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "gbp-ads-"));
    const statusPath = path.join(dir, "access-status.json");

    const initial = await readAccessStatus(statusPath);
    assert.equal(initial.status, "none");

    const pending = await markAccessRequested(statusPath);
    assert.equal(pending.status, "pending");
    assert.equal(pending.targetAdsCustomerId, "8463673842");
    assert.equal(pending.owningBusinessManagerId, "om-20984726777920736");
    assert.equal(pending.blockedBusinessManagerId, "om-8996917152552719760");

    assert.throws(() => assertSyncAllowed(pending), (err: unknown) => {
      return err instanceof LinkError && err.code === "ACCESS_REQUEST_PENDING";
    });

    const approved = await markAccessApproved(statusPath);
    assert.equal(approved.status, "approved");
    assertSyncAllowed(approved);

    const raw = await readFile(statusPath, "utf8");
    assert.match(raw, /"status": "approved"/);
  });

  it("blocks sync after rejection", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "gbp-ads-"));
    const statusPath = path.join(dir, "access-status.json");
    await markAccessRequested(statusPath);
    const rejected = await markAccessRejected(statusPath, "owner declined");
    assert.throws(() => assertSyncAllowed(rejected), (err: unknown) => {
      return err instanceof LinkError && err.code === "ACCESS_REQUEST_REJECTED";
    });
  });
});

describe("assertNotBmTransfer", () => {
  it("returns UNSUPPORTED_BM_TRANSFER", () => {
    const err = assertNotBmTransfer();
    assert.equal(err.code, "UNSUPPORTED_BM_TRANSFER");
    assert.match(err.message, /846-367-3842/);
  });
});
