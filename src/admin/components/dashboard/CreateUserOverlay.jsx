import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000/api";

const CreateUserOverlay = ({ onClose }) => {
  // ==========================================
  // USER DETAILS
  // ==========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");

  // ==========================================
  // ACCESS DATA
  // ==========================================

  const [scopes, setScopes] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState([]);

  const [selectedPages, setSelectedPages] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [loadingAccess, setLoadingAccess] = useState(true);

  // ==========================================
  // PAGE & SECTION DATA
  // ==========================================

  const [pages, setPages] = useState([]);
  const [pageSections, setPageSections] = useState({});
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingSections, setLoadingSections] = useState({});

  // ==========================================
  // FORM STATE
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ==========================================
  // LOAD ACCESS DEFINITIONS
  // ==========================================

  useEffect(() => {
    const loadAccess = async () => {
      try {
        const response = await fetch(
          `${API_URL}/access`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to load access options."
          );
        }

        setScopes(data.scopes || []);
        setPermissionGroups(
          data.permissions || []
        );
      } catch (error) {
        console.error(
          "LOAD ACCESS ERROR:",
          error
        );

        setError(error.message);
      } finally {
        setLoadingAccess(false);
      }
    };

    loadAccess();
  }, []);

  // ==========================================
  // LOAD PAGES
  // ==========================================

  const fetchPages = async () => {
    try {
      setLoadingPages(true);
      setError("");

      const response = await fetch(
        `${API_URL}/pages`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load pages."
        );
      }

      // Your API returns the pages array directly
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "FETCH PAGES ERROR:",
        error
      );

      setError(
        error.message ||
        "Failed to load pages."
      );
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // ==========================================
  // PAGE TOGGLE WITH SECTION LOADING
  // ==========================================

  const togglePage = async (page) => {
    const slug = page.slug;

    const isSelected =
      selectedPages.includes(slug);

    if (isSelected) {
      setSelectedPages((current) =>
        current.filter(
          (item) => item !== slug
        )
      );

      return;
    }

    setSelectedPages((current) => [
      ...current,
      slug,
    ]);

    // Already loaded
    if (pageSections[slug]) {
      return;
    }

    try {
      setLoadingSections((current) => ({
        ...current,
        [slug]: true,
      }));

      setError("");

      const response = await fetch(
        `${API_URL}/pages/${slug}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to load page sections."
        );
      }

      // Your API returns the page directly
      setPageSections((current) => ({
        ...current,
        [slug]: Array.isArray(data.sections)
          ? data.sections
          : [],
      }));

    } catch (error) {
      console.error(
        "FETCH PAGE SECTIONS ERROR:",
        error
      );

      setError(
        error.message ||
        "Failed to load page sections."
      );

    } finally {
      setLoadingSections((current) => ({
        ...current,
        [slug]: false,
      }));
    }
  };

  // ==========================================
  // PERMISSION TOGGLE
  // ==========================================

  const togglePermission = (permission) => {
    setSelectedPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter(
          (item) => item !== permission
        );
      }

      return [...current, permission];
    });
  };

  // ==========================================
  // SELECTED PAGE LABELS
  // ==========================================

  const selectedPageLabels = useMemo(() => {
    return scopes
      .filter((scope) =>
        selectedPages.includes(scope.key)
      )
      .map((scope) => scope.label);
  }, [scopes, selectedPages]);

  // ==========================================
  // CREATE USER
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter the user's name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (selectedPages.length === 0) {
      setError(
        "Select at least one page the user can access."
      );
      return;
    }

    if (selectedPermissions.length === 0) {
      setError(
        "Select at least one permission."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/users`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            department: department.trim() || null,

            status: "active",

            permissions:
              selectedPermissions,

            allowedPages:
              selectedPages,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to create user."
        );
      }

      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (error) {
      console.error(
        "CREATE USER ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to create user."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* ======================================
            HEADER
        ====================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-200
            px-6
            py-5
          "
        >

          <div>
            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-gray-400
              "
            >
              User Management
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-semibold
                text-gray-900
              "
            >
              Create User
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a user with custom access.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-xl
              text-gray-400
              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            ×
          </button>

        </div>


        {/* ======================================
            CONTENT
        ====================================== */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >

          <div className="flex-1 overflow-y-auto px-6 py-6">

            {/* ERROR */}

            {error && (
              <div
                className="
                  mb-5
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >
                {error}
              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div
                className="
                  mb-5
                  rounded-lg
                  border
                  border-green-200
                  bg-green-50
                  px-4
                  py-3
                  text-sm
                  text-green-700
                "
              >
                User created successfully.
              </div>
            )}


            {/* ==================================
                USER DETAILS
            ================================== */}

            <section>

              <SectionTitle
                title="User Details"
                description="Basic information for the new user."
              />

              <div className="grid gap-4 sm:grid-cols-2">

                <Input
                  label="Name"
                  value={name}
                  onChange={setName}
                  placeholder="NSS Staff"
                />

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="nss@college.com"
                />

                <Input
                  label="Department"
                  value={department}
                  onChange={setDepartment}
                  placeholder="NSS"
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Minimum 8 characters"
                />

              </div>

            </section>


            <Divider />


            {/* ==================================
                PAGE ACCESS
            ================================== */}

            <section>

              <SectionTitle
                title="Page Access"
                description="Choose the pages this user can modify."
              />

              {loadingPages ? (
                <div className="py-6 text-sm text-gray-500">
                  Loading pages...
                </div>
              ) : pages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                  No pages available.
                </div>
              ) : (
                <div className="space-y-3">
                  {pages.map((page) => {
                    const selected =
                      selectedPages.includes(page.slug);

                    return (
                      <div
                        key={page.slug}
                        className="rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <label className="flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              togglePage(page)
                            }
                            className="h-4 w-4"
                          />

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {page.title}
                            </p>

                            <p className="text-xs text-gray-400">
                              /{page.slug}
                            </p>
                          </div>
                        </label>

                        {/* SECTIONS */}
                        {selected && (
                          <div className="border-t border-gray-100 bg-gray-50 p-4">
                            {loadingSections[page.slug] ? (
                              <p className="text-xs text-gray-500">
                                Loading sections...
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {(
                                  pageSections[
                                    page.slug
                                  ] || []
                                ).map((section) => (
                                  <label
                                    key={section.id}
                                    className="
                                      flex
                                      cursor-pointer
                                      items-center
                                      gap-3
                                      rounded-lg
                                      border
                                      border-gray-200
                                      bg-white
                                      px-3
                                      py-3
                                    "
                                  >
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4"
                                    />

                                    <span className="text-sm text-gray-700">
                                      {section.type}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </section>


            <Divider />


            {/* ==================================
                PERMISSIONS
            ================================== */}

            <PermissionsSection
              permissionGroups={permissionGroups}
              loadingAccess={loadingAccess}
              selectedPermissions={selectedPermissions}
              onToggle={togglePermission}
            />


            <Divider />


            {/* ==================================
                SUMMARY
            ================================== */}

            <section>

              <SectionTitle
                title="Access Summary"
                description="Quick overview of the access being given."
              />

              <div
                className="
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                "
              >

                <div className="flex flex-wrap gap-2">

                  {selectedPageLabels.length > 0 ? (

                    selectedPageLabels.map(
                      (label) => (
                        <span
                          key={label}
                          className="
                            rounded-md
                            bg-white
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-gray-700
                            ring-1
                            ring-gray-200
                          "
                        >
                          {label}
                        </span>
                      )
                    )

                  ) : (

                    <span className="text-xs text-gray-400">
                      No pages selected
                    </span>

                  )}

                </div>

                <p
                  className="
                    mt-3
                    text-xs
                    text-gray-500
                  "
                >
                  {selectedPermissions.length}{" "}
                  permission
                  {selectedPermissions.length ===
                  1
                    ? ""
                    : "s"} selected
                </p>

              </div>

            </section>

          </div>


          {/* ======================================
              FOOTER
          ====================================== */}

          <div
            className="
              flex
              items-center
              justify-end
              gap-3
              border-t
              border-gray-200
              px-6
              py-4
            "
          >

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                rounded-lg
                border
                border-gray-300
                px-5
                py-2.5
                text-sm
                font-medium
                text-gray-700
                hover:bg-gray-50
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingAccess ||
                success
              }
              className="
                rounded-lg
                bg-gray-900
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                hover:bg-gray-800
                disabled:opacity-50
              "
            >
              {loading
                ? "Creating..."
                : "Create User"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


// ==========================================
// SECTION TITLE
// ==========================================

const SectionTitle = ({
  title,
  description,
}) => (
  <div className="mb-4">

    <h3
      className="
        text-sm
        font-semibold
        text-gray-900
      "
    >
      {title}
    </h3>

    <p className="mt-1 text-xs text-gray-500">
      {description}
    </p>

  </div>
);


// ==========================================
// INPUT
// ==========================================

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) => (
  <div>

    <label
      className="
        mb-1.5
        block
        text-xs
        font-medium
        text-gray-700
      "
    >
      {label}
    </label>

    <input
      type={type}
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      className="
        w-full
        rounded-lg
        border
        border-gray-300
        px-3
        py-2.5
        text-sm
        outline-none
        focus:border-gray-900
        focus:ring-1
        focus:ring-gray-900
      "
    />

  </div>
);


// ==========================================
// DIVIDER
// ==========================================

const Divider = () => (
  <div className="my-7 border-t border-gray-100" />
);


// ==========================================
// LOADING
// ==========================================

const Loading = ({ text }) => (
  <div
    className="
      rounded-lg
      border
      border-gray-200
      px-4
      py-6
      text-center
      text-xs
      text-gray-400
    "
  >
    {text}
  </div>
);


// ==========================================
// PERMISSIONS SECTION
// ==========================================

const PermissionsSection = ({
  permissionGroups,
  loadingAccess,
  selectedPermissions,
  onToggle,
}) => {
  const [showAdministration, setShowAdministration] = useState(false);

  // Separate administration groups from regular groups
  const regularGroups = permissionGroups.filter(
    (group) => !["users", "roles", "audit", "settings"].includes(group.key)
  );

  const administrationGroups = permissionGroups.filter(
    (group) => ["users", "roles", "audit", "settings"].includes(group.key)
  );

  if (loadingAccess) {
    return <Loading text="Loading permissions..." />;
  }

  return (
    <section>

      <SectionTitle
        title="Permissions"
        description="Choose what this user can do."
      />

      {/* ==================================
          REGULAR PERMISSIONS
      ================================== */}

      <div className="space-y-3">

        {regularGroups.map((group) => (
          <PermissionGroup
            key={group.key}
            group={group}
            selectedPermissions={selectedPermissions}
            onToggle={onToggle}
          />
        ))}

      </div>

      {/* ==================================
          ADMINISTRATION
      ================================== */}

      {administrationGroups.length > 0 && (
        <div className="mt-6">

          <button
            type="button"
            onClick={() =>
              setShowAdministration(
                (current) => !current
              )
            }
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-3
              text-left
              transition
              hover:bg-gray-100
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-gray-400
                "
              >
                Administration
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Advanced CMS management permissions
              </p>

            </div>

            <span
              className="
                text-sm
                text-gray-400
              "
            >
              {showAdministration
                ? "−"
                : "+"}
            </span>

          </button>

          {showAdministration && (
            <div className="mt-3 space-y-3">

              {administrationGroups.map(
                (group) => (
                  <PermissionGroup
                    key={group.key}
                    group={group}
                    selectedPermissions={
                      selectedPermissions
                    }
                    onToggle={onToggle}
                  />
                )
              )}

            </div>
          )}

        </div>
      )}

    </section>
  );
};


// ==========================================
// PERMISSION GROUP
// ==========================================

const PermissionGroup = ({
  group,
  selectedPermissions,
  onToggle,
}) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-gray-200
        p-4
      "
    >

      <h4
        className="
          mb-3
          text-sm
          font-semibold
          text-gray-900
        "
      >
        {group.label}
      </h4>

      <div className="flex flex-wrap gap-2">

        {group.permissions.map(
          (permission) => {

            const selected =
              selectedPermissions.includes(
                permission.key
              );

            return (
              <button
                key={permission.key}
                type="button"
                onClick={() =>
                  onToggle(
                    permission.key
                  )
                }
                className={`
                  rounded-md
                  border
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  transition
                  ${
                    selected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                  }
                `}
              >
                {permission.label}
              </button>
            );
          }
        )}

      </div>

    </div>
  );
};


export default CreateUserOverlay;