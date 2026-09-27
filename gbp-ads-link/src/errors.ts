/**
 * Typed errors for GBP ↔ Ads linking flows.
 */

export type LinkErrorCode =
  | "LOCATION_OWNED_BY_OTHER_BM"
  | "ACCOUNT_ALREADY_LINKED"
  | "PERMISSION_DENIED"
  | "OAUTH_TOKEN_EXPIRED"
  | "INSUFFICIENT_SCOPE"
  | "ACCESS_REQUEST_PENDING"
  | "ACCESS_REQUEST_REJECTED"
  | "GOOGLE_API_ERROR"
  | "CONFIG_ERROR"
  | "NOT_FOUND"
  | "UNSUPPORTED_BM_TRANSFER";

export class LinkError extends Error {
  readonly code: LinkErrorCode;
  readonly httpStatus?: number;
  readonly googleStatus?: string;
  readonly details?: unknown;

  constructor(
    code: LinkErrorCode,
    message: string,
    opts?: { httpStatus?: number; googleStatus?: string; details?: unknown; cause?: unknown },
  ) {
    super(message, opts?.cause ? { cause: opts.cause } : undefined);
    this.name = "LinkError";
    this.code = code;
    this.httpStatus = opts?.httpStatus;
    this.googleStatus = opts?.googleStatus;
    this.details = opts?.details;
  }
}

type GoogleErrorBody = {
  error?: {
    code?: number;
    status?: string;
    message?: string;
    details?: unknown[];
  };
  message?: string;
};

function bodyText(body: unknown): string {
  if (!body) return "";
  if (typeof body === "string") return body;
  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
}

/**
 * Map raw Google HTTP / Ads API failures to actionable LinkError codes.
 */
export function mapGoogleApiError(
  httpStatus: number,
  body: unknown,
  context: string,
): LinkError {
  const parsed = (typeof body === "object" && body !== null ? body : {}) as GoogleErrorBody;
  const googleStatus = parsed.error?.status;
  const message =
    parsed.error?.message ||
    parsed.message ||
    (typeof body === "string" ? body : "") ||
    `Google API error during ${context}`;
  const lower = `${message} ${bodyText(body)}`.toLowerCase();

  if (
    lower.includes("already been added to a different business manager") ||
    lower.includes("already associated with another business profile manager") ||
    lower.includes("different business manager")
  ) {
    return new LinkError(
      "LOCATION_OWNED_BY_OTHER_BM",
      "This Business Profile is already managed by another Business Manager. " +
        "Do not add it to trulink.in BM. Use Ads location linking / manager access instead " +
        `(keep BM ${"om-20984726777920736"} intact).`,
      { httpStatus, googleStatus, details: body },
    );
  }

  if (
    lower.includes("already linked") ||
    lower.includes("already exists") ||
    lower.includes("duplicate")
  ) {
    return new LinkError(
      "ACCOUNT_ALREADY_LINKED",
      `GBP/Ads link already exists for this customer during ${context}.`,
      { httpStatus, googleStatus, details: body },
    );
  }

  if (
    httpStatus === 401 ||
    googleStatus === "UNAUTHENTICATED" ||
    lower.includes("invalid_grant") ||
    lower.includes("token has been expired") ||
    lower.includes("token expired")
  ) {
    return new LinkError(
      "OAUTH_TOKEN_EXPIRED",
      "OAuth access/refresh token is missing, expired, or revoked. Re-authorize with required scopes.",
      { httpStatus, googleStatus, details: body },
    );
  }

  if (
    (lower.includes("insufficient") && lower.includes("scope")) ||
    lower.includes("access_denied") ||
    lower.includes("insufficient authentication scopes") ||
    lower.includes("access not configured")
  ) {
    return new LinkError(
      "INSUFFICIENT_SCOPE",
      "OAuth token lacks required scopes (adwords + business.manage). Re-consent with full scope set.",
      { httpStatus, googleStatus, details: body },
    );
  }

  if (
    httpStatus === 403 ||
    googleStatus === "PERMISSION_DENIED" ||
    lower.includes("permission_denied") ||
    lower.includes("permission denied") ||
    lower.includes("not authorized") ||
    lower.includes("caller does not have permission")
  ) {
    return new LinkError(
      "PERMISSION_DENIED",
      "Permission denied reading GBP or mutating Ads location assets. " +
        "Ensure GBP_MANAGER_EMAIL has Owner/Manager on MOTO24 GBP and Ads admin on 846-367-3842.",
      { httpStatus, googleStatus, details: body },
    );
  }

  if (httpStatus === 404 || googleStatus === "NOT_FOUND") {
    return new LinkError("NOT_FOUND", `Resource not found during ${context}: ${message}`, {
      httpStatus,
      googleStatus,
      details: body,
    });
  }

  return new LinkError("GOOGLE_API_ERROR", `${context}: ${message}`, {
    httpStatus,
    googleStatus,
    details: body,
  });
}

export function toPublicErrorPayload(err: unknown): {
  ok: false;
  code: LinkErrorCode | "UNKNOWN";
  message: string;
} {
  if (err instanceof LinkError) {
    return { ok: false, code: err.code, message: err.message };
  }
  if (err instanceof Error) {
    return { ok: false, code: "UNKNOWN", message: err.message };
  }
  return { ok: false, code: "UNKNOWN", message: String(err) };
}
