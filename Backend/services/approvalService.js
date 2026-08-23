import ApprovalRequest from "../models/ApprovalRequest.js";
import AuditLog from "../models/AuditLog.js";


/* ==========================================
   CREATE APPROVAL REQUEST
========================================== */

export const createApprovalRequest = async ({
  req,
  actor,
  resourceType,
  resourceId = null,
  resourceName = null,
  action,
  before = null,
  after = null,
}) => {
  try {

    /* ------------------------------------------
       CREATE APPROVAL REQUEST
    ------------------------------------------ */

    const approvalRequest =
      await ApprovalRequest.create({

        submittedBy: actor._id,

        submittedByRole: actor.role,

        submittedByDepartment:
          actor.department || null,

        resourceType,

        resourceId,

        resourceName,

        action,

        before,

        after,

        status: "pending",

        ipAddress:
          req?.ip ||
          req?.headers?.["x-forwarded-for"] ||
          null,

        userAgent:
          req?.headers?.["user-agent"] ||
          null,
      });


    /* ------------------------------------------
       CREATE AUDIT LOG
    ------------------------------------------ */

    const auditLog =
      await AuditLog.create({

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

        approvalRequired: true,

        approvalStatus: "pending",

        approvalRequest:
          approvalRequest._id,

        ipAddress:
          req?.ip ||
          req?.headers?.["x-forwarded-for"] ||
          null,

        userAgent:
          req?.headers?.["user-agent"] ||
          null,
      });


    /* ------------------------------------------
       LINK AUDIT LOG BACK TO REQUEST
    ------------------------------------------ */

    approvalRequest.auditLog =
      auditLog._id;

    await approvalRequest.save();


    return {
      approvalRequest,
      auditLog,
    };

  } catch (error) {

    console.error(
      "CREATE APPROVAL REQUEST ERROR:",
      error
    );

    throw error;
  }
};