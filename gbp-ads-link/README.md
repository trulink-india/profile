# MOTO24 GBP ↔ Google Ads link (Customer ID 846-367-3842)

Google allows **one Business Manager ownership** per Business Profile. MOTO24 GBP already sits on BM `om-20984726777920736` (Ads `214-921-7342`). Adding the same location to trulink BM `om-8996917152552719760` fails with:

> This profile has already been added to a different Business Manager profile.

That is expected. **Do not** unlink MOTO24 BM or change Ads customer IDs.

## Supported path

1. Keep MOTO24 BM + Ads `214-921-7342` untouched.
2. Grant the Google account used for Ads **`846-367-3842`** Manager access on the existing MOTO24 GBP **or** submit an Ads “link any Business Profile” access request and wait for owner approval.
3. After approval, sync locations into Ads `846-367-3842` (UI location assets **or** this package’s `LOCATION_SYNC` API flow).

This package implements (2) status tracking + (3) API sync. Credentials are **env vars only**.

## Setup

```bash
cd gbp-ads-link
cp .env.example .env   # fill real values — never commit
npm install
npm test
npm run typecheck
```

Required OAuth scopes:

- `https://www.googleapis.com/auth/adwords`
- `https://www.googleapis.com/auth/business.manage`

## Commands

| Command | Purpose |
| --- | --- |
| `npm run request-access` | Probe GBP access if creds present; else mark **pending** + print manual steps |
| `npm run check-access` | Live GBP visibility check (real API) |
| `npm run status` | Show pending / approved / rejected + last sync |
| `npm run sync` | Create `LOCATION_SYNC` asset set on Ads **846-367-3842** only |
| `npx tsx src/cli.ts approve` | Mark local status approved after Google owner approval |
| `npx tsx src/cli.ts explain-bm` | Explain why second-BM add is unsupported |

`sync` **refuses** customer id `214-921-7342` and any id other than `846-367-3842`.

## Manual approval steps (owner must do in Google UI)

1. **Do not** add MOTO24 to trulink Business Manager.
2. Open GBP **MOTO24 \| Two Wheeler Service Centre \| Badshahpur** (owner on BM `om-20984726777920736`).
3. **Users** → invite the Ads `846-367-3842` Google account as **Manager**.
4. Or from Ads `846-367-3842`: **Assets → Locations → + →** link / request access to that Business Profile; approve the email on the owner account.
5. Confirm under Ads **Assets → Locations** that MOTO24 appears.
6. Run `npm run sync` with valid env credentials (or rely on UI link alone).

## Error codes

`LOCATION_OWNED_BY_OTHER_BM`, `ACCOUNT_ALREADY_LINKED`, `PERMISSION_DENIED`, `OAUTH_TOKEN_EXPIRED`, `INSUFFICIENT_SCOPE`, `ACCESS_REQUEST_PENDING`, `ACCESS_REQUEST_REJECTED`, `GOOGLE_API_ERROR`, `UNSUPPORTED_BM_TRANSFER`.

## Safety

- No new Google Ads accounts.
- No Customer ID changes.
- No BM unlink/delete.
- No hard-coded secrets.
- No success claim without a live Google API response from `check-access` / `sync`.
