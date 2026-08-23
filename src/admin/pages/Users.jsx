const Users = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Administration
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage CMS users and their access.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
        >
          + Create User
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-sm text-gray-500">
          User management will appear here.
        </p>
      </div>
    </div>
  );
};

export default Users;