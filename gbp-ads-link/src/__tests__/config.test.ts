import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ConfigError,
  formatCustomerId,
  loadConfig,
  normalizeCustomerId,
  PROTECTED_ADS_CUSTOMER_ID,
  TARGET_ADS_CUSTOMER_ID_CANONICAL,
} from "../config.js";

function baseEnv(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return {
    GOOGLE_OAUTH_CLIENT_ID: "client",
    GOOGLE_OAUTH_CLIENT_SECRET: "secret",
    GOOGLE_OAUTH_REFRESH_TOKEN: "refresh",
    GOOGLE_ADS_DEVELOPER_TOKEN: "devtoken",
    GOOGLE_ADS_CUSTOMER_ID: "846-367-3842",
    GBP_MANAGER_EMAIL: "ads@trulink.in",
    ...overrides,
  };
}

describe("normalizeCustomerId", () => {
  it("strips dashes", () => {
    assert.equal(normalizeCustomerId("846-367-3842"), "8463673842");
  });
});

describe("formatCustomerId", () => {
  it("formats 10 digits", () => {
    assert.equal(formatCustomerId("8463673842"), "846-367-3842");
  });
});

describe("loadConfig", () => {
  it("loads target trulink Ads customer", () => {
    const cfg = loadConfig(baseEnv());
    assert.equal(cfg.customerId, TARGET_ADS_CUSTOMER_ID_CANONICAL);
    assert.equal(cfg.gbpManagerEmail, "ads@trulink.in");
  });

  it("refuses protected MOTO24 Ads customer id", () => {
    assert.throws(
      () =>
        loadConfig(
          baseEnv({ GOOGLE_ADS_CUSTOMER_ID: formatCustomerId(PROTECTED_ADS_CUSTOMER_ID) }),
        ),
      (err: unknown) => err instanceof ConfigError && /protected/i.test(err.message),
    );
  });

  it("refuses unexpected customer ids", () => {
    assert.throws(
      () => loadConfig(baseEnv({ GOOGLE_ADS_CUSTOMER_ID: "111-222-3333" })),
      ConfigError,
    );
  });

  it("requires OAuth + developer token env vars", () => {
    assert.throws(
      () =>
        loadConfig(
          baseEnv({
            GOOGLE_OAUTH_CLIENT_ID: undefined,
            GOOGLE_OAUTH_REFRESH_TOKEN: undefined,
            GOOGLE_OAUTH_ACCESS_TOKEN: undefined,
          }),
        ),
      /Missing required env/,
    );
  });
});
