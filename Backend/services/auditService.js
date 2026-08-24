import AuditLog from "../models/AuditLog.js";

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
      actor: actor._id,

      actorRole: actor.role,

      actorDepartment:
        actor.department || null,

      resourceType,

      resourceId,

      resourceName,

      action,

      before,

      after,

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

    throw error;
  }
};