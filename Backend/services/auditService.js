import AuditLog from "../models/AuditLog.js";

/**
 * Sanitizes object by removing any potential sensitive credentials/secrets recursively.
 */
const sanitizeAuditData = (data) => {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeAuditData);
  }

  const sensitiveKeys = [
    "password",
    "passwordhash",
    "temppassword",
    "temporarypassword",
    "token",
    "jwt",
    "secret",
    "refreshtoken",
    "cms_token",
    "cookie",
    "authorization",
  ];

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !(value instanceof Date)) {
      sanitized[key] = sanitizeAuditData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export const createAuditLog = async ({
  req,
  actor,
  resourceType,
  resourceId = null,
  resourceName = null,
  action,
  before = null,
  after = null,
  approvalRequired = false,
  approvalStatus = "not_required",
  approvalRequest = null,
}) => {
  try {
    const auditLog = await AuditLog.create({
      actor: actor?._id || null,
      actorRole: actor?.role || "unknown",
      actorDepartment: actor?.department || null,
      resourceType,
      resourceId,
      resourceName,
      action,
      before: sanitizeAuditData(before),
      after: sanitizeAuditData(after),
      approvalRequired,
      approvalStatus,
      approvalRequest,
      ipAddress:
        req?.ip ||
        req?.headers?.["x-forwarded-for"] ||
        null,
      userAgent:
        req?.headers?.["user-agent"] ||
        null,
    });

    return auditLog;

  } catch (error) {
    console.error(
      "CREATE AUDIT LOG ERROR:",
      error
    );

    // Do not throw to prevent crashing normal flow if audit fails
    return null;
  }
};