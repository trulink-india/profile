#!/usr/bin/env node
/**
 * CLI for MOTO24 GBP ↔ Google Ads (846-367-3842) linking.
 * Credentials: env vars only. Never claims success without a real API response.
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  approveFlow,
  rejectFlow,
  requestAccessFlow,
  statusFlow,
  syncFlow,
  MANUAL_APPROVAL_STEPS,
} from "./access-request.js";
import { checkGbpAccess } from "./business-profile.js";
import { loadConfig, ConfigError, formatCustomerId } from "./config.js";
import { LinkError, toPublicErrorPayload } from "./errors.js";
import { assertNotBmTransfer } from "./status.js";

function loadDotEnv(): void {
  const candidates = [".env", path.join(process.cwd(), ".env")];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
    break;
  }
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function usage(): void {
  console.log(`Usage: gbp-ads-link <command>

Commands:
  status           Show pending/approved/rejected access + last sync
  request-access   Start/track access request (probes GBP if credentials present)
  check-access     Live check whether OAuth can see MOTO24 locations
  approve          Mark local status approved (after owner approved in Google UI)
  reject [reason]  Mark local status rejected
  sync             Sync MOTO24 locations into Ads 846-367-3842 (requires access)
  explain-bm       Explain why adding GBP to a second Business Manager fails

Env: see .env.example — never hard-code secrets.
Protected Ads ID 214-921-7342 is never modified.
`);
}

async function main(): Promise<void> {
  loadDotEnv();
  const [, , cmd, ...rest] = process.argv;

  if (!cmd || cmd === "help" || cmd === "-h" || cmd === "--help") {
    usage();
    process.exit(0);
  }

  try {
    switch (cmd) {
      case "status": {
        printJson({ ok: true, status: await statusFlow() });
        break;
      }
      case "request-access": {
        const result = await requestAccessFlow();
        const { ok: _ok, ...restResult } = result;
        printJson({
          ...restResult,
          ok: true,
          note:
            result.mode === "pending_owner_approval"
              ? "Access request recorded as pending. Complete manual Google approval steps before sync."
              : "OAuth identity already has MOTO24 GBP visibility — ready to sync.",
        });
        break;
      }
      case "check-access": {
        const config = loadConfig();
        const access = await checkGbpAccess(config);
        printJson({
          ok: true,
          targetAdsCustomerId: formatCustomerId(config.customerId),
          ...access,
          verifiedAgainstLiveApi: true,
        });
        break;
      }
      case "approve": {
        printJson({ ok: true, status: await approveFlow() });
        break;
      }
      case "reject": {
        printJson({ ok: true, status: await rejectFlow(rest.join(" ") || undefined) });
        break;
      }
      case "sync": {
        const result = await syncFlow();
        printJson({ ok: true, sync: result, verifiedAgainstLiveApi: true });
        break;
      }
      case "explain-bm": {
        const err = assertNotBmTransfer();
        printJson({
          ok: false,
          code: err.code,
          message: err.message,
          manualSteps: MANUAL_APPROVAL_STEPS,
        });
        process.exitCode = 2;
        break;
      }
      default:
        usage();
        process.exitCode = 1;
    }
  } catch (err) {
    if (err instanceof ConfigError) {
      printJson({ ok: false, code: "CONFIG_ERROR", message: err.message });
      process.exitCode = 1;
      return;
    }
    if (err instanceof LinkError) {
      printJson(toPublicErrorPayload(err));
      process.exitCode = 1;
      return;
    }
    printJson(toPublicErrorPayload(err));
    process.exitCode = 1;
  }
}

main();
