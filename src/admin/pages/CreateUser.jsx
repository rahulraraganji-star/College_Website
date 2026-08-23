const CreateUser = () => {
  return (
    <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
          Administration / Users
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Create User
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a CMS user and configure their page access.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-sm text-gray-500">
          Create user form will appear here.
        </p>
      </div>
    </div>
  );
};

export default CreateUser;