import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Toast from "../components/Toast";

const API_URL = "/api";

const Account = () => {
  const { user, checkAuth } = useAuth();

  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Email State
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirmation do not match.");
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to change password.");
      }

      setPassSuccess("Password updated successfully! Your active session is secured.");
      showToast("success", "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassError(err.message);
      showToast("error", err.message || "Failed to change password.");
    } finally {
      setPassLoading(false);
    }
  };

  // Handle Email Update
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!newEmail.trim()) {
      setEmailError("Please enter a valid email address.");
      showToast("error", "Please enter a valid email address.");
      return;
    }

    setEmailLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/update-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update email.");
      }

      setEmailSuccess("Email address updated successfully.");
      showToast("success", "Email address updated successfully.");
      setNewEmail("");
      if (checkAuth) await checkAuth();
    } catch (err) {
      setEmailError(err.message);
      showToast("error", err.message || "Failed to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const roleName =
    user?.role === "super_admin"
      ? "Super Admin"
      : user?.role === "admin"
      ? "Administrator"
      : user?.roleId?.name || "Department Editor";

  return (
    <div
      className="max-w-[960px] mx-auto px-6 py-8"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      {/* HEADER */}
      <div className="mb-8 pb-5 border-b border-neutral-200">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1">
          Account Settings
        </p>
        <h1 className="text-[28px] font-extrabold text-black tracking-tight">
          My Profile & Security
        </h1>
        <p className="text-[14px] text-neutral-500 mt-1.5">
          Manage your personal credentials, email address, and view your permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PROFILE OVERVIEW CARD */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xl shadow-inner">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900 leading-tight">
                  {user?.name}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      user?.role === "super_admin"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : user?.role === "admin"
                        ? "bg-blue-100 text-blue-900 border border-blue-300"
                        : "bg-neutral-100 text-neutral-800 border border-neutral-300"
                    }`}
                  >
                    {roleName}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-neutral-400 font-medium">Department</span>
                <span className="text-neutral-800 font-semibold">
                  {user?.department || "General Administration"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400 font-medium">Account ID</span>
                <span className="text-neutral-500 font-mono text-[10px]">
                  {user?.id || user?._id}
                </span>
              </div>
            </div>
          </div>

          {/* PERMISSIONS & SCOPE SUMMARY */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 mb-3">
              Assigned Scope & Access
            </h3>
            {user?.role === "super_admin" ? (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                ⭐ <strong>Full Access:</strong> You have unrestricted system-wide authority.
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-neutral-700 mb-1">
                    Allowed Pages / Scopes:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {user?.allowedPages?.length > 0 ? (
                      user.allowedPages.map((scope, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[11px] font-mono border border-neutral-200"
                        >
                          {scope}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400 italic">
                        No specific page scopes assigned.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-neutral-700 mb-1">
                    Effective Permissions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(user?.permissions || []).slice(0, 10).map((perm, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-neutral-50 text-neutral-600 rounded text-[10px] border border-neutral-200"
                      >
                        {perm}
                      </span>
                    ))}
                    {(user?.permissions || []).length > 10 && (
                      <span className="text-[10px] text-neutral-400 self-center">
                        +{(user?.permissions || []).length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECURITY & CREDENTIAL MANAGEMENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* CHANGE PASSWORD CARD */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-neutral-900 mb-1">
              Change Password
            </h2>
            <p className="text-xs text-neutral-500 mb-5">
              Ensure your account is using a long, random password to stay secure. Changing your password will invalidate old active sessions.
            </p>

            {passSuccess && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <span>✅</span>
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50"
                >
                  {passLoading ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* UPDATE EMAIL CARD */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-neutral-900 mb-1">
              Email Address
            </h2>
            <p className="text-xs text-neutral-500 mb-5">
              Update the primary email address associated with your CMS account.
            </p>

            {emailSuccess && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <span>✅</span>
                <span>{emailSuccess}</span>
              </div>
            )}

            {emailError && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{emailError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Current Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-500 rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="px-5 py-2.5 bg-white text-neutral-900 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  {emailLoading ? "Updating..." : "Change Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default Account;
