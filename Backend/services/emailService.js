import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const SMTP_FROM = process.env.SMTP_FROM || process.env.SUPER_ADMIN_EMAIL || "cms-notifications@college.edu";

/* ==========================================
   SENSITIVE & METADATA KEYS TO EXCLUDE
========================================== */

const IGNORED_DIFF_KEYS = new Set([
  "_id",
  "__v",
  "createdAt",
  "updatedAt",
  "tokenVersion",
  "passwordHash",
  "tempPassword",
  "password",
  "jwt",
  "secret",
  "token",
  "id",
]);

/* ==========================================
   FORMAT HELPERS
========================================== */

const stripHtml = (html) => {
  if (typeof html !== "string") return html;
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
};

const formatValue = (val) => {
  if (val === null || val === undefined || String(val).trim() === "") {
    return "None / Empty";
  }
  if (typeof val === "boolean") {
    return val ? "Yes / Enabled" : "No / Disabled";
  }
  return stripHtml(String(val));
};

const formatKeyName = (key) => {
  if (/^\d+$/.test(key)) {
    return `Item ${parseInt(key, 10) + 1}`;
  }
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

const flattenObject = (obj, prefix = "", result = {}) => {
  if (obj === null || obj === undefined) return result;
  if (typeof obj !== "object") {
    result[prefix] = obj;
    return result;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      result[prefix] = "";
      return result;
    }
    obj.forEach((item, index) => {
      flattenObject(item, prefix ? `${prefix}.${index}` : `${index}`, result);
    });
    return result;
  }

  Object.entries(obj).forEach(([k, v]) => {
    if (IGNORED_DIFF_KEYS.has(k)) return;
    const path = prefix ? `${prefix}.${k}` : k;
    flattenObject(v, path, result);
  });

  return result;
};

/**
 * Generate human-readable comparison text from before/after objects
 */
export const generateTextDiffSummary = (before, after) => {
  const flatBefore = flattenObject(before || {});
  const flatAfter = flattenObject(after || {});

  const allKeys = Array.from(
    new Set([...Object.keys(flatBefore), ...Object.keys(flatAfter)])
  );

  const changes = [];

  for (const key of allKeys) {
    const valB = flatBefore[key] !== undefined && flatBefore[key] !== null ? String(flatBefore[key]).trim() : "";
    const valA = flatAfter[key] !== undefined && flatAfter[key] !== null ? String(flatAfter[key]).trim() : "";

    if (!valB && !valA) continue;
    if (valB === valA) continue;

    const parts = key.split(".");
    const category = parts.length > 1 ? parts.slice(0, -1).map(formatKeyName).join(" → ") : "";
    const field = formatKeyName(parts[parts.length - 1]);
    const label = category ? `${category} → ${field}` : field;

    changes.push({
      field: label,
      current: formatValue(flatBefore[key]),
      proposed: formatValue(flatAfter[key]),
    });
  }

  return changes;
};

/* ==========================================
   DYNAMIC APPROVER RESOLUTION
========================================== */

/**
 * Find all active Super Admins & Admins who have approval authority
 * Excludes the submitting user (separation of duties)
 */
export const getAuthorizedApproverEmails = async (excludeUserId = null) => {
  try {
    const query = {
      status: "active",
      $or: [
        { role: "super_admin" },
        { role: "admin" },
        { permissions: "approvals.approve" },
        { permissions: "*" },
      ],
    };

    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const approvers = await User.find(query).select("name email role");
    return approvers
      .map((u) => u.email)
      .filter((email) => email && typeof email === "string" && email.includes("@"));
  } catch (error) {
    console.error("RESOLVE APPROVER EMAILS ERROR:", error);
    return [];
  }
};

/* ==========================================
   CORE DISPATCHER (TRANSPORTER WITH FALLBACK)
========================================== */

let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  const nodemailer = await import("nodemailer");
  const createTransport = nodemailer.default?.createTransport || nodemailer.createTransport;
  cachedTransporter = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cachedTransporter;
};

/**
 * Sends an email safely. Never throws unhandled exceptions to calling controller.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || (Array.isArray(to) && to.length === 0)) {
    console.log("ℹ️ [EMAIL SERVICE] No recipients provided, skipping dispatch.");
    return { success: false, reason: "NO_RECIPIENTS" };
  }

  const recipients = Array.isArray(to) ? to : [to];

  // If SMTP configuration exists, attempt real delivery via nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = await getTransporter();
      if (transporter) {
        const info = await transporter.sendMail({
          from: `"College CMS" <${SMTP_FROM}>`,
          to: recipients.join(", "),
          subject,
          text,
          html,
        });

        console.log(`📧 [EMAIL SENT] Subject: "${subject}" to [${recipients.join(", ")}] (MessageID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
      }
    } catch (smtpError) {
      console.error("❌ [EMAIL SERVICE SMTP ERROR]:", smtpError.message);
      // Fall through to logging simulation so process doesn't halt
    }
  }

  // Simulated / Development Log Transporter
  console.log("\n=======================================================");
  console.log("📧 [NOTIFICATION DISPATCHED]");
  console.log(`To:      ${recipients.join(", ")}`);
  console.log(`From:    ${SMTP_FROM}`);
  console.log(`Subject: ${subject}`);
  console.log("-------------------------------------------------------");
  console.log(text || stripHtml(html));
  console.log("=======================================================\n");

  return { success: true, simulated: true };
};

/* ==========================================
   EMAIL HTML TEMPLATES
========================================= */

const emailWrapper = (contentHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px 12px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 24px 32px; color: #ffffff; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: #ffffff; }
    .header p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }
    .body { padding: 32px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-approved { background: #dcfce7; color: #166534; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    .info-card { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 600; text-align: right; }
    .diff-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
    .diff-table th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; }
    .diff-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .diff-field { font-weight: 600; color: #334155; width: 35%; }
    .diff-current { color: #991b1b; background: #fef2f2; text-decoration: line-through; border-radius: 4px; padding: 4px 8px; margin-bottom: 4px; }
    .diff-proposed { color: #166534; background: #f0fdf4; font-weight: 500; border-radius: 4px; padding: 4px 8px; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 20px 0; }
    .btn:hover { background: #000000; }
    .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #7f1d1d; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>College CMS — Workflow Notification</h1>
      <p>Official Content Management System Notification</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>This is an automated notification from the College CMS. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

/* ==========================================
   1. PENDING APPROVAL NOTIFICATION
========================================== */

export const sendPendingApprovalNotification = async ({
  approvalRequest,
  submitter,
  approverEmails = [],
}) => {
  try {
    let emails = approverEmails;
    if (emails.length === 0) {
      emails = await getAuthorizedApproverEmails(submitter?._id);
    }

    if (emails.length === 0) {
      console.log("ℹ️ [EMAIL SERVICE] No approvers to notify for request:", approvalRequest._id);
      return;
    }

    const resourceTitle = approvalRequest.resourceName || `${approvalRequest.resourceType} #${approvalRequest.resourceId || ""}`;
    const submitterName = submitter?.name || "A user";
    const submitterRole = submitter?.role ? `(${submitter.role})` : "";
    const submissionDate = new Date(approvalRequest.createdAt || Date.now()).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const diffItems = generateTextDiffSummary(approvalRequest.before, approvalRequest.after);
    const reviewUrl = `${CLIENT_URL}/admin/approvals?id=${approvalRequest._id}`;

    let diffHtml = "<p style='font-size: 12px; color: #64748b;'>No specific textual changes detected.</p>";
    if (diffItems.length > 0) {
      diffHtml = `
        <table class="diff-table">
          <thead>
            <tr>
              <th>Field / Section</th>
              <th>Current</th>
              <th>Proposed</th>
            </tr>
          </thead>
          <tbody>
            ${diffItems
              .map(
                (item) => `
              <tr>
                <td class="diff-field">${item.field}</td>
                <td><div class="diff-current">${item.current}</div></td>
                <td><div class="diff-proposed">${item.proposed}</div></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
    }

    const html = emailWrapper(`
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge badge-pending">Pending Approval</span>
      </div>

      <h2 style="font-size: 20px; color: #0f172a; margin: 16px 0 8px 0;">New Change Submitted for Review</h2>
      <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">
        <strong>${submitterName}</strong> ${submitterRole} has submitted a proposed change to <strong>${resourceTitle}</strong> that requires your review and approval.
      </p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Resource</span>
          <span class="info-value">${resourceTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Submitted By</span>
          <span class="info-value">${submitterName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Submitted Date</span>
          <span class="info-value">${submissionDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Request ID</span>
          <span class="info-value">${approvalRequest._id}</span>
        </div>
      </div>

      <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 12px 0;">
        Summary of Changes (${diffItems.length} field${diffItems.length !== 1 ? "s" : ""})
      </h3>
      ${diffHtml}

      <div style="text-align: center; margin-top: 32px;">
        <a href="${reviewUrl}" class="btn">Review Change in Admin Panel</a>
        <p style="font-size: 11px; color: #94a3b8; margin: 8px 0 0 0;">
          Authentication required. The first decision by an authorized Admin or Super Admin will finalize this request.
        </p>
      </div>
    `);

    const text = `
[PENDING APPROVAL] New Change Submitted for Review

Resource: ${resourceTitle}
Submitted By: ${submitterName} ${submitterRole}
Date: ${submissionDate}
Request ID: ${approvalRequest._id}

Summary of Changes:
${diffItems.map((d) => `* ${d.field}:\n  - Current: ${d.current}\n  + Proposed: ${d.proposed}`).join("\n")}

Review this change in the authenticated Admin Panel:
${reviewUrl}
    `.trim();

    await sendEmail({
      to: emails,
      subject: `[Approval Required] Proposed changes to ${resourceTitle}`,
      html,
      text,
    });
  } catch (error) {
    console.error("❌ PENDING APPROVAL NOTIFICATION ERROR (NON-FATAL):", error.message);
  }
};

/* ==========================================
   2. CHANGE APPROVED NOTIFICATION (TO SUBMITTER)
========================================== */

export const sendApprovalNotificationToUser = async ({
  approvalRequest,
  submitter,
  approver,
}) => {
  try {
    const userEmail = submitter?.email;
    if (!userEmail) {
      console.log("ℹ️ [EMAIL SERVICE] No submitter email to notify for approved request:", approvalRequest._id);
      return;
    }

    const resourceTitle = approvalRequest.resourceName || `${approvalRequest.resourceType} #${approvalRequest.resourceId || ""}`;
    const approverName = approver?.name || (approver?.role === "super_admin" ? "Super Admin" : "Admin");
    const approvedDate = new Date(approvalRequest.reviewedAt || Date.now()).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = emailWrapper(`
      <span class="badge badge-approved">Approved & Live</span>

      <h2 style="font-size: 20px; color: #0f172a; margin: 16px 0 8px 0;">Your Change Has Been Approved</h2>
      <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">
        Your proposed changes to <strong>${resourceTitle}</strong> have been approved and published to the live website.
      </p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Resource</span>
          <span class="info-value">${resourceTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Approved By</span>
          <span class="info-value">${approverName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Approved Date</span>
          <span class="info-value">${approvedDate}</span>
        </div>
        ${approvalRequest.reviewComment ? `
        <div class="info-row">
          <span class="info-label">Review Note</span>
          <span class="info-value" style="font-style: italic;">"${approvalRequest.reviewComment}"</span>
        </div>` : ""}
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${CLIENT_URL}/admin/workspace" class="btn">Go to Workspace</a>
      </div>
    `);

    const text = `
[APPROVED] Your Change Has Been Approved

Resource: ${resourceTitle}
Approved By: ${approverName}
Approved Date: ${approvedDate}
${approvalRequest.reviewComment ? `Note: "${approvalRequest.reviewComment}"\n` : ""}

Your changes are now live.
Visit Workspace: ${CLIENT_URL}/admin/workspace
    `.trim();

    await sendEmail({
      to: userEmail,
      subject: `Your proposed changes to ${resourceTitle} have been approved`,
      html,
      text,
    });
  } catch (error) {
    console.error("❌ APPROVAL NOTIFICATION ERROR (NON-FATAL):", error.message);
  }
};

/* ==========================================
   3. CHANGE REJECTED NOTIFICATION (TO SUBMITTER)
========================================== */

export const sendRejectionNotificationToUser = async ({
  approvalRequest,
  submitter,
  approver,
  reason,
}) => {
  try {
    const userEmail = submitter?.email;
    if (!userEmail) {
      console.log("ℹ️ [EMAIL SERVICE] No submitter email to notify for rejected request:", approvalRequest._id);
      return;
    }

    const resourceTitle = approvalRequest.resourceName || `${approvalRequest.resourceType} #${approvalRequest.resourceId || ""}`;
    const approverName = approver?.name || (approver?.role === "super_admin" ? "Super Admin" : "Admin");
    const rejectionReason = reason || approvalRequest.reviewComment || "No reason provided.";
    const rejectedDate = new Date(approvalRequest.reviewedAt || Date.now()).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const editUrl = `${CLIENT_URL}/admin/workspace`;

    const html = emailWrapper(`
      <span class="badge badge-rejected">Rejected</span>

      <h2 style="font-size: 20px; color: #0f172a; margin: 16px 0 8px 0;">Your Change Was Rejected</h2>
      <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">
        Your proposed changes to <strong>${resourceTitle}</strong> were not approved. Please review the feedback below, make the necessary corrections, and resubmit.
      </p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Resource</span>
          <span class="info-value">${resourceTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Reviewed By</span>
          <span class="info-value">${approverName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date</span>
          <span class="info-value">${rejectedDate}</span>
        </div>
      </div>

      <div class="reason-box">
        <strong style="display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Reason for Rejection:</strong>
        ${stripHtml(rejectionReason)}
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${editUrl}" class="btn">Open Workspace to Edit & Resubmit</a>
      </div>
    `);

    const text = `
[REJECTED] Your Change Was Rejected

Resource: ${resourceTitle}
Reviewed By: ${approverName}
Date: ${rejectedDate}

Reason for Rejection:
${rejectionReason}

Please review the feedback, update your content, and submit again.
Open Workspace: ${editUrl}
    `.trim();

    await sendEmail({
      to: userEmail,
      subject: `Your proposed changes to ${resourceTitle} were rejected`,
      html,
      text,
    });
  } catch (error) {
    console.error("❌ REJECTION NOTIFICATION ERROR (NON-FATAL):", error.message);
  }
};
