export {
  loadConfig,
  loadStatusPath,
  normalizeCustomerId,
  formatCustomerId,
  ConfigError,
  OAUTH_SCOPES,
  PROTECTED_ADS_CUSTOMER_ID,
  TARGET_ADS_CUSTOMER_ID_CANONICAL,
  MOTO24_BM_ID,
  TRULINK_BM_ID,
  type AppConfig,
} from "./config.js";

export {
  LinkError,
  mapGoogleApiError,
  toPublicErrorPayload,
  type LinkErrorCode,
} from "./errors.js";

export {
  readAccessStatus,
  markAccessRequested,
  markAccessApproved,
  markAccessRejected,
  markSyncResult,
  assertSyncAllowed,
  assertNotBmTransfer,
  type AccessRequestStatus,
  type AccessRequestRecord,
} from "./status.js";

export { getAccessToken, createOAuthClient, authUrl } from "./oauth.js";
export { checkGbpAccess, findMoto24Locations, listGbpAccounts } from "./business-profile.js";
export {
  syncBusinessProfileLocations,
  findExistingLocationSync,
  type SyncResult,
} from "./ads-location-sync.js";
export {
  requestAccessFlow,
  syncFlow,
  statusFlow,
  approveFlow,
  rejectFlow,
  MANUAL_APPROVAL_STEPS,
  type RequestAccessResult,
} from "./access-request.js";
