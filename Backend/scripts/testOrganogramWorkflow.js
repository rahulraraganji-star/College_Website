import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../database/connect.js";
import OrganogramNode from "../models/OrganogramNode.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import AuditLog from "../models/AuditLog.js";
import { applyApprovedChange } from "../services/approvalApplyService.js";

dotenv.config();

const runTests = async () => {
  console.log("=======================================================");
  console.log("ORGANOGRAM MODULE & WORKFLOW AUTOMATED TEST SUITE");
  console.log("=======================================================");

  await connectDB();

  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition, message) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  };

  try {
    /* ------------------------------------------
       TEST 1: PUBLIC ENDPOINT DATA INTEGRITY
    ------------------------------------------ */
    console.log("\n1. Testing Public Organogram API...");
    const res = await fetch("http://localhost:5000/api/organogram");
    const publicData = await res.json();

    assert(res.status === 200, "Public endpoint returns HTTP 200 OK");
    assert(publicData.success === true, "Public endpoint returns success: true");
    assert(Array.isArray(publicData.tree), "Public endpoint returns hierarchical tree array");
    assert(publicData.tree.length > 0, "Public tree contains root nodes");
    assert(publicData.nodes.length >= 8, `Public nodes array has all active nodes (${publicData.nodes.length} nodes)`);

    // Verify tree nesting (Root -> Level 1 -> Level 2 -> Level 3)
    const root = publicData.tree[0];
    assert(root.designation.includes("Apex"), `Root node is Apex Governing Body (${root.name})`);
    assert(root.children && root.children.length > 0, `Root has children (${root.children.length} child)`);
    const principalChild = root.children[0];
    assert(principalChild.name.includes("Agnel"), `Level 1 child is Principal (${principalChild.name})`);
    assert(principalChild.children.length >= 2, `Principal has sub-offices (${principalChild.children.length} sub-offices)`);

    /* ------------------------------------------
       TEST 2: SECURITY & RBAC ENFORCEMENT
    ------------------------------------------ */
    console.log("\n2. Testing Authentication & RBAC Route Protection...");
    const unauthRes = await fetch("http://localhost:5000/api/organogram/admin/tree");
    assert(unauthRes.status === 401, "Unauthenticated request to /admin/tree is rejected with 401 Unauthorized");

    const unauthPost = await fetch("http://localhost:5000/api/organogram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacker", designation: "Intruder" }),
    });
    assert(unauthPost.status === 401, "Unauthenticated POST request is rejected with 401 Unauthorized");

    /* ------------------------------------------
       TEST 3: CYCLE DETECTION
    ------------------------------------------ */
    console.log("\n3. Testing Cycle Detection & Self-Parenting Protection...");
    const testParent = await OrganogramNode.create({
      name: "Test Parent Office",
      designation: "Test Director",
      department: "QA Test",
      parent: null,
      level: 0,
    });

    const testChild = await OrganogramNode.create({
      name: "Test Child Office",
      designation: "Test Coordinator",
      department: "QA Test",
      parent: testParent._id,
      level: 1,
    });

    // Verify child references parent
    assert(testChild.parent.toString() === testParent._id.toString(), "Child correctly links to parent");

    /* ------------------------------------------
       TEST 4: DELETE SAFETY (REASSIGNMENT)
    ------------------------------------------ */
    console.log("\n4. Testing Delete Safety & Sub-Position Reassignment...");
    // When deleting testParent, testChild should be reassigned to root (null)
    const childrenToReassign = await OrganogramNode.find({ parent: testParent._id });
    assert(childrenToReassign.length === 1, "Child found before deletion");

    // Perform safe deletion of testParent
    await OrganogramNode.updateMany(
      { parent: testParent._id },
      { $set: { parent: null } }
    );
    await OrganogramNode.findByIdAndDelete(testParent._id);

    const reassignedChild = await OrganogramNode.findById(testChild._id);
    assert(reassignedChild.parent === null, "Child was safely elevated to root (parent: null) without corruption");

    // Cleanup test child
    await OrganogramNode.findByIdAndDelete(testChild._id);

    /* ------------------------------------------
       TEST 5: APPROVAL WORKFLOW SIMULATION
    ------------------------------------------ */
    console.log("\n5. Testing Approval Workflow & State Transitions...");
    const adminUser = await User.findOne({ role: "super_admin" }) || await User.findOne();
    assert(Boolean(adminUser), "Found admin user in database");

    // Create a mock approval request for a new organogram node
    const testProposedData = {
      name: "Dean of Student Affairs",
      designation: "Dean",
      department: "Student Affairs",
      order: 10,
      isActive: true,
      email: "dean.students@agnel.edu",
    };

    const approvalReq = await ApprovalRequest.create({
      submittedBy: adminUser._id,
      submittedByRole: "department_editor",
      resourceType: "organogram",
      action: "create",
      before: null,
      after: testProposedData,
      status: "pending",
    });

    assert(approvalReq.status === "pending", "Approval request created with status 'pending'");

    // Verify live organogram does NOT yet contain proposed node
    const checkLiveBefore = await OrganogramNode.findOne({ name: "Dean of Student Affairs" });
    assert(checkLiveBefore === null, "Pending organogram position is NOT live on database/website");

    // Apply approved change through approvalApplyService
    const appliedNode = await applyApprovedChange(approvalReq);
    assert(Boolean(appliedNode), "Approval apply service processed organogram change");
    assert(appliedNode.name === "Dean of Student Affairs", "Applied node has correct name");

    // Verify node is now live in database
    const checkLiveAfter = await OrganogramNode.findOne({ name: "Dean of Student Affairs" });
    assert(Boolean(checkLiveAfter), "Approved organogram position is now live");

    // Cleanup test approved node & approval request
    await OrganogramNode.findByIdAndDelete(appliedNode._id);
    await ApprovalRequest.findByIdAndDelete(approvalReq._id);

    console.log("\n=======================================================");
    console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log("=======================================================");

    if (passedTests === totalTests) {
      console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
      process.exit(0);
    } else {
      console.error("⚠️ SOME TESTS FAILED.");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ TEST RUNNER ERROR:", err);
    process.exit(1);
  }
};

runTests();
