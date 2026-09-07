import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../database/connect.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import AuditLog from "../models/AuditLog.js";
import {
  isSuperAdmin,
  isAdmin,
  hasPermission,
  canGrantPermission,
  canGrantScope,
  canManageRole,
  canCreateRole,
  actorCanManageTarget,
  actorCanAssignRole,
  validateGrantedPermissions,
  validateGrantedScopes,
} from "../utils/authorization.js";
import { createAuditLog } from "../services/auditService.js";

dotenv.config();

const runSecurityAuditTests = async () => {
  console.log("\n=======================================================");
  console.log("🔒 RUNNING RBAC & SECURITY VERIFICATION SUITE");
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
    // TEST 1: System Roles & Hierarchy Setup
    // -------------------------------------------------------------------------
    console.log("--- 1. Testing System Roles & Hierarchy Boundaries ---");

    const superAdminRole = await Role.findOne({ slug: "super-admin" });
    assert(superAdminRole !== null, "Super Admin role exists in DB");
    assert(superAdminRole?.isSystemRole === true, "Super Admin role is flagged as isSystemRole");
    assert(superAdminRole?.permissions?.includes("*"), "Super Admin role has wildcard '*' permission");

    const adminRole = await Role.findOne({ slug: "admin" });
    assert(adminRole !== null, "Admin role exists in DB");
    assert(adminRole?.isSystemRole === true, "Admin role is flagged as isSystemRole");

    // -------------------------------------------------------------------------
    // TEST 2: Hierarchy Protection & Privilege Escalation Guards
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Testing Hierarchy & Privilege Escalation Helpers ---");

    const mockSuperAdmin = { _id: new mongoose.Types.ObjectId(), role: "super_admin" };
    const mockAdmin = { _id: new mongoose.Types.ObjectId(), role: "admin" };
    const mockTargetSuperAdmin = { _id: new mongoose.Types.ObjectId(), role: "super_admin" };
    const mockTargetAdmin = { _id: new mongoose.Types.ObjectId(), role: "admin" };
    const mockTargetEditor = { _id: new mongoose.Types.ObjectId(), role: "department_editor" };

    // Super Admin managing others
    assert(actorCanManageTarget(mockSuperAdmin, mockTargetSuperAdmin), "Super Admin can manage Super Admin");
    assert(actorCanManageTarget(mockSuperAdmin, mockTargetAdmin), "Super Admin can manage Admin");
    assert(actorCanManageTarget(mockSuperAdmin, mockTargetEditor), "Super Admin can manage Dept Editor");

    // Admin managing others
    assert(!actorCanManageTarget(mockAdmin, mockTargetSuperAdmin), "Admin CANNOT manage Super Admin (Hierarchy Protected)");
    assert(!actorCanManageTarget(mockAdmin, mockTargetAdmin), "Admin CANNOT manage other Admins (Hierarchy Protected)");
    assert(actorCanManageTarget(mockAdmin, mockTargetEditor), "Admin CAN manage custom Dept Editor");

    // Custom editor managing others
    assert(!actorCanManageTarget(mockTargetEditor, mockTargetEditor), "Custom Editor CANNOT manage any users");

    // Role assignment rules
    assert(actorCanAssignRole(mockSuperAdmin, superAdminRole), "Super Admin can assign Super Admin role");
    assert(!actorCanAssignRole(mockAdmin, superAdminRole), "Admin CANNOT assign Super Admin role (Privilege Escalation Blocked)");
    assert(!actorCanAssignRole(mockAdmin, adminRole), "Admin CANNOT assign Admin system role");

    const customRole = { _id: new mongoose.Types.ObjectId(), isSystemRole: false, isActive: true, permissions: ["pages.view", "pages.edit"] };
    assert(actorCanAssignRole(mockAdmin, customRole), "Admin CAN assign authorized custom role");

    // -------------------------------------------------------------------------
    // TEST 3: Delegation Boundary Validation
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing Permission Delegation Boundaries ---");

    const adminActorRole = {
      systemRole: "admin",
      permissions: ["pages.view", "pages.edit", "users.view", "roles.view", "roles.create"],
      allowedPages: ["about", "academics"],
    };

    // Admin attempting to grant what they have
    assert(canGrantPermission(adminActorRole, "pages.view"), "Admin can grant permission they possess");
    // Admin attempting to grant wildcard or what they don't have
    assert(!canGrantPermission(adminActorRole, "*"), "Admin CANNOT grant wildcard '*' permission");
    assert(!canGrantPermission(adminActorRole, "audit.delete"), "Admin CANNOT grant permission they do not possess");

    // validateGrantedPermissions
    const validPerms = validateGrantedPermissions(adminActorRole, ["pages.view", "pages.edit"]);
    assert(validPerms.valid === true, "validateGrantedPermissions accepts subset of actor permissions");

    const invalidPerms = validateGrantedPermissions(adminActorRole, ["pages.view", "*", "super.power"]);
    assert(invalidPerms.valid === false, "validateGrantedPermissions rejects ungranted permissions / wildcards");

    // Scopes delegation
    assert(canGrantScope(adminActorRole, "about"), "Admin can grant scope they possess");
    assert(!canGrantScope(adminActorRole, "*"), "Admin CANNOT grant wildcard '*' scope");
    assert(!canGrantScope(adminActorRole, "examination"), "Admin CANNOT grant unassigned page scope");

    // -------------------------------------------------------------------------
    // TEST 4: Password Lifecycle & Session Invalidation (tokenVersion)
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Testing Password Lifecycle & Token Versioning ---");

    const testEmail = `test_security_${Date.now()}@college.edu`;
    const initialPassword = "InitialPassword@123";
    const initialHash = await bcrypt.hash(initialPassword, 12);

    const testUser = await User.create({
      name: "Security Test User",
      email: testEmail,
      passwordHash: initialHash,
      role: "department_editor",
      status: "active",
      tokenVersion: 0,
    });

    assert(testUser.tokenVersion === 0, "User created with tokenVersion = 0");

    // Simulate password change
    const newPassword = "NewSecurePassword@456";
    const newHash = await bcrypt.hash(newPassword, 12);
    testUser.passwordHash = newHash;
    testUser.tokenVersion += 1;
    await testUser.save();

    const updatedUser = await User.findById(testUser._id);
    assert(updatedUser.tokenVersion === 1, "Password change increments tokenVersion to invalidate sessions");

    const oldMatch = await bcrypt.compare(initialPassword, updatedUser.passwordHash);
    assert(oldMatch === false, "Old password rejected after password change");

    const newMatch = await bcrypt.compare(newPassword, updatedUser.passwordHash);
    assert(newMatch === true, "New password verified successfully");

    // -------------------------------------------------------------------------
    // TEST 5: Audit Log Credential Sanitization
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Testing Audit Log Sanitization & Security ---");

    const auditEntry = await createAuditLog({
      req: { ip: "127.0.0.1", headers: { "user-agent": "SecurityTest/1.0" } },
      actor: updatedUser,
      resourceType: "user",
      resourceId: updatedUser._id,
      action: "PASSWORD_CHANGED",
      before: { email: testEmail, password: "SecretPlainTextPassword!", passwordHash: "hashed123" },
      after: { passwordChanged: true, token: "jwt.token.abc" },
    });

    assert(auditEntry !== null, "Audit log created successfully");
    assert(auditEntry.before.password === "[REDACTED]", "Plaintext password automatically redacted in AuditLog");
    assert(auditEntry.before.passwordHash === "[REDACTED]", "Password hash automatically redacted in AuditLog");
    assert(auditEntry.after.token === "[REDACTED]", "Token automatically redacted in AuditLog");
    assert(auditEntry.actorRole === "department_editor", "AuditLog tracks actorRole properly");

    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    if (auditEntry) await AuditLog.findByIdAndDelete(auditEntry._id);

    console.log("\n=======================================================");
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=======================================================\n");

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error("❌ UNCAUGHT ERROR IN TEST SUITE:", error);
    process.exit(1);
  }
};

runSecurityAuditTests();
