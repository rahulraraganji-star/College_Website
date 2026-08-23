import { useEffect, useState } from "react";

const CreateUserOverlay = ({ onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  
  // New states for roles
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        setRolesError("");

        const response = await fetch(
          "http://localhost:5000/api/roles",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch roles."
          );
        }

        setRoles(data.roles || []);
      } catch (error) {
        console.error("FETCH ROLES ERROR:", error);
        setRolesError(error.message);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log({
      name,
      email,
      department,
      password,
      confirmPassword,
      roleId,
    });
  };

  // Handle role change
  const handleRoleChange = (event) => {
    const selectedId = event.target.value;
    setRoleId(selectedId);

    const role = roles.find(
      (item) => item._id === selectedId
    );
    setSelectedRole(role || null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 p-4 sm:p-6 lg:p-10">
      <div
        className="
          relative
          mx-auto
          flex
          h-full
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create User
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create a new CMS user and assign their role.
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
              text-gray-400
              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="space-y-8">
              {/* ACCOUNT INFORMATION */}
              <section>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Account Information
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Basic information for the new CMS account.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* NAME */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Enter full name"
                      required
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
                      "
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="user@example.com"
                      required
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
                      "
                    />
                  </div>

                  {/* DEPARTMENT */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(event) =>
                        setDepartment(event.target.value)
                      }
                      placeholder="Library"
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
                      "
                    />
                  </div>

                  {/* ROLE */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      value={roleId}
                      onChange={handleRoleChange}
                      required
                      disabled={rolesLoading}
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                        focus:border-gray-900
                        disabled:bg-gray-100
                      "
                    >
                      <option value="">
                        {rolesLoading
                          ? "Loading roles..."
                          : "Select role"}
                      </option>

                      {roles.map((role) => (
                        <option
                          key={role._id}
                          value={role._id}
                        >
                          {role.name}
                        </option>
                      ))}
                    </select>

                    {rolesError && (
                      <p className="mt-2 text-xs text-red-600">
                        {rolesError}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Create password"
                      required
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
                      "
                    />
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Confirm password"
                      required
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
                      "
                    />
                  </div>
                </div>
              </section>

              {/* ROLE ACCESS */}
              <section>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Role Access
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Permissions and page access will come from the selected role.
                  </p>
                </div>

                {selectedRole ? (
                  <div className="space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                    {/* PERMISSIONS */}
                    <div>
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">
                          Permissions
                        </h4>
                        <p className="text-xs text-gray-500">
                          Access rights granted by this role.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {(selectedRole.permissions || []).map(
                          (permission) => (
                            <label
                              key={permission}
                              className="
                                flex
                                items-center
                                gap-3
                                rounded-lg
                                border
                                border-gray-200
                                bg-white
                                px-3
                                py-2.5
                              "
                            >
                              <input
                                type="checkbox"
                                checked
                                readOnly
                                className="h-4 w-4"
                              />
                              <span className="text-sm text-gray-700">
                                {permission}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    {/* ALLOWED PAGES */}
                    <div>
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">
                          Allowed Pages
                        </h4>
                        <p className="text-xs text-gray-500">
                          Page scopes inherited from this role.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {(selectedRole.allowedPages || []).map(
                          (page) => (
                            <label
                              key={page}
                              className="
                                flex
                                items-center
                                gap-3
                                rounded-lg
                                border
                                border-gray-200
                                bg-white
                                px-3
                                py-2.5
                              "
                            >
                              <input
                                type="checkbox"
                                checked
                                readOnly
                                className="h-4 w-4"
                              />
                              <span className="text-sm text-gray-700">
                                {page === "*" ? "All Pages" : page}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm font-medium text-gray-700">
                      Select a role above
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      The selected role's permissions and allowed pages
                      will appear here.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* FOOTER */}
          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              border-gray-200
              bg-white
              px-6
              py-4
            "
          >
            <button
              type="button"
              onClick={onClose}
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
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                rounded-lg
                bg-gray-900
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                hover:bg-gray-800
              "
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserOverlay;