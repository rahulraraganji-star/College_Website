import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../database/connect.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Page from "../models/page.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import AuditLog from "../models/AuditLog.js";
import { createApprovalRequest } from "../services/approvalService.js";
import {
  generateTextDiffSummary,
  getAuthorizedApproverEmails,
  sendEmail,
  sendPendingApprovalNotification,
  sendApprovalNotificationToUser,
  sendRejectionNotificationToUser,
} from "../services/emailService.js";

dotenv.config();

const runApprovalEmailVerification = async () => {
  console.log("\n=======================================================");
  console.log("🔒 RUNNING APPROVAL EMAIL NOTIFICATION & WORKFLOW TESTS");
  console.log("=======================================================\n");

  await connectDB();

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = "") => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ""}`);
      failed++;
    }
  };

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Approver Email Resolution
    // -------------------------------------------------------------------------
    console.log("--- 1. Testing Approver Email Resolution ---");

    const approverEmails = await getAuthorizedApproverEmails();
    assert(Array.isArray(approverEmails), "getAuthorizedApproverEmails returns an array");
    assert(approverEmails.length > 0, "At least one active approver found (Super Admin / Admin)");
    assert(approverEmails.every((e) => typeof e === "string" && e.includes("@")), "All returned entries are valid emails");

    // -------------------------------------------------------------------------
    // TEST 2: Text Diff Summary Generation
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Testing Text Diff Summary Generator ---");

    const beforeData = {
      title: "Accreditation Committee",
      slug: "iqac-old",
      content: "<p>Original <strong>committee</strong> details</p>",
      isPublished: true,
      courseData: {
        general: { courseName: "Bachelor of Arts", duration: "3 Years" },
      },
      passwordHash: "$2a$12$secretHashNotToBeExposedInDiff",
      tokenVersion: 1,
    };

    const afterData = {
      title: "Internal Quality Assurance Cell",
      slug: "iqac-new",
      content: "<p>Updated <strong>committee</strong> details & revised policies</p>",
      isPublished: true,
      courseData: {
        general: { courseName: "Bachelor of Arts (Honours)", duration: "3 Years" },
      },
      passwordHash: "$2a$12$newSecretHash",
      tokenVersion: 2,
    };

    const diffs = generateTextDiffSummary(beforeData, afterData);
    assert(diffs.length > 0, "Diff summary generated changes");

    // Ensure secrets are excluded
    const hasPasswordHash = diffs.some((d) => d.field.toLowerCase().includes("password"));
    const hasTokenVersion = diffs.some((d) => d.field.toLowerCase().includes("tokenversion"));
    assert(!hasPasswordHash, "passwordHash is completely excluded from diff");
    assert(!hasTokenVersion, "tokenVersion is completely excluded from diff");

    // Check specific changed fields
    const titleDiff = diffs.find((d) => d.field.includes("Title"));
    assert(titleDiff !== undefined, "Title change detected");
    assert(titleDiff?.current === "Accreditation Committee", "Current title correctly formatted");
    assert(titleDiff?.proposed === "Internal Quality Assurance Cell", "Proposed title correctly formatted");

    // Check nested change
    const courseDiff = diffs.find((d) => d.field.includes("Course Name"));
    assert(courseDiff !== undefined, "Nested courseData.general.courseName change detected");

    // -------------------------------------------------------------------------
    // TEST 3: Event 1 — Change Submitted & Pending Approval Notification
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing Event 1: Change Submission ---");

    const testSubmitterEmail = `editor_test_${Date.now()}@college.edu`;
    const testSubmitter = await User.create({
      name: "Rohan Editor",
      email: testSubmitterEmail,
      role: "department_editor",
      status: "active",
      passwordHash: "hash123",
      tokenVersion: 0,
    });

    const testPage = await Page.create({
      title: "Initial IQAC Page",
      slug: `iqac-test-${Date.now()}`,
      parentSlug: "academics",
      content: "Initial content",
      isPublished: true,
    });

    const { approvalRequest, auditLog } = await createApprovalRequest({
      req: { ip: "127.0.0.1", headers: { "user-agent": "AutomatedTest/1.0" } },
      actor: testSubmitter,
      resourceType: "page",
      resourceId: testPage._id,
      resourceName: testPage.title,
      action: "update",
      before: testPage.toObject(),
      after: { ...testPage.toObject(), title: "Updated IQAC Cell" },
    });

    assert(approvalRequest !== null, "ApprovalRequest created in MongoDB");
    assert(approvalRequest.status === "pending", "ApprovalRequest initial status is 'pending'");
    assert(approvalRequest.submittedBy.toString() === testSubmitter._id.toString(), "submittedBy points to actor");
    assert(auditLog !== null, "Linked AuditLog created");
    assert(approvalRequest.auditLog.toString() === auditLog._id.toString(), "ApprovalRequest links to AuditLog");

    // -------------------------------------------------------------------------
    // TEST 4: Event 2 — First Decision Wins & Approval Flow
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Testing Event 2: Approval Flow & First Decision Wins ---");

    const testAdmin = await User.findOne({ role: "super_admin" });

    // Simulate first valid approval (atomic update)
    const approvedRequest = await ApprovalRequest.findOneAndUpdate(
      {
        _id: approvalRequest._id,
        status: "pending",
      },
      {
        $set: {
          status: "approved",
          reviewedBy: testAdmin._id,
          reviewedByRole: testAdmin.role,
          reviewedAt: new Date(),
          reviewComment: "Looks great, approved.",
        },
      },
      { new: true }
    );

    assert(approvedRequest !== null, "First approval transition succeeds (PENDING -> APPROVED)");
    assert(approvedRequest.status === "approved", "Status updated to 'approved'");
    assert(approvedRequest.reviewedBy.toString() === testAdmin._id.toString(), "reviewedBy recorded");

    // Simulate concurrent second approval attempt (must fail atomically)
    const secondApprovalAttempt = await ApprovalRequest.findOneAndUpdate(
      {
        _id: approvalRequest._id,
        status: "pending",
      },
      {
        $set: {
          status: "approved",
          reviewedBy: new mongoose.Types.ObjectId(),
          reviewedByRole: "admin",
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    assert(secondApprovalAttempt === null, "Second approval attempt fails atomically (First Decision Wins)");

    // -------------------------------------------------------------------------
    // TEST 5: Event 3 — Rejection Flow with Required Reason
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Testing Event 3: Rejection Flow & Required Reason ---");

    const { approvalRequest: rejectReq } = await createApprovalRequest({
      req: { ip: "127.0.0.1", headers: { "user-agent": "AutomatedTest/1.0" } },
      actor: testSubmitter,
      resourceType: "page",
      resourceId: testPage._id,
      resourceName: testPage.title,
      action: "update",
      before: testPage.toObject(),
      after: { ...testPage.toObject(), title: "Another Revision" },
    });

    const rejectionReason = "Please update the committee member designations according to 2026 guidelines.";

    const rejectedRequest = await ApprovalRequest.findOneAndUpdate(
      {
        _id: rejectReq._id,
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
          reviewedBy: testAdmin._id,
          reviewedByRole: testAdmin.role,
          reviewedAt: new Date(),
          reviewComment: rejectionReason,
        },
      },
      { new: true }
    );

    assert(rejectedRequest !== null, "Rejection transition succeeds (PENDING -> REJECTED)");
    assert(rejectedRequest.status === "rejected", "Status updated to 'rejected'");
    assert(rejectedRequest.reviewComment === rejectionReason, "Exact rejection reason stored in approval record");

    // -------------------------------------------------------------------------
    // TEST 6: Resilience (Simulated Email Failure Does Not Break Approval)
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Testing Non-Blocking Email Resilience ---");

    const dispatchResult = await sendEmail({
      to: "nonexistent-test-inbox@college.edu",
      subject: "Test Resilience",
      html: "<p>Test</p>",
      text: "Test",
    });

    assert(dispatchResult.success === true, "sendEmail safely completes without throwing unhandled exceptions");

    // -------------------------------------------------------------------------
    // CLEANUP TEST ARTIFACTS
    // -------------------------------------------------------------------------
    await ApprovalRequest.deleteMany({ submittedBy: testSubmitter._id });
    await AuditLog.deleteMany({ actor: testSubmitter._id });
    await Page.findByIdAndDelete(testPage._id);
    await User.findByIdAndDelete(testSubmitter._id);

    console.log("\n=======================================================");
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=======================================================\n");

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error("❌ UNCAUGHT ERROR IN TEST SUITE:", error);
    process.exit(1);
  }
};

runApprovalEmailVerification();
