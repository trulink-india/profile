import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LinkError, mapGoogleApiError } from "../errors.js";

describe("mapGoogleApiError", () => {
  it("maps other-BM ownership message", () => {
    const err = mapGoogleApiError(
      400,
      { error: { message: "This profile has already been added to a different Business Manager profile." } },
      "bm_add",
    );
    assert.equal(err.code, "LOCATION_OWNED_BY_OTHER_BM");
  });

  it("maps already linked", () => {
    const err = mapGoogleApiError(409, { error: { message: "Resource already linked" } }, "link");
    assert.equal(err.code, "ACCOUNT_ALREADY_LINKED");
  });

  it("maps expired token", () => {
    const err = mapGoogleApiError(401, { error: { status: "UNAUTHENTICATED", message: "invalid_grant" } }, "oauth");
    assert.equal(err.code, "OAUTH_TOKEN_EXPIRED");
  });

  it("maps insufficient scope", () => {
    const err = mapGoogleApiError(
      403,
      { error: { message: "Request had insufficient authentication scopes." } },
      "gbp",
    );
    assert.equal(err.code, "INSUFFICIENT_SCOPE");
  });

  it("maps permission denied", () => {
    const err = mapGoogleApiError(
      403,
      { error: { status: "PERMISSION_DENIED", message: "The caller does not have permission" } },
      "ads",
    );
    assert.equal(err.code, "PERMISSION_DENIED");
  });

  it("falls back to GOOGLE_API_ERROR", () => {
    const err = mapGoogleApiError(500, { error: { message: "backend boom" } }, "sync");
    assert.equal(err.code, "GOOGLE_API_ERROR");
    assert.ok(err instanceof LinkError);
  });
});
