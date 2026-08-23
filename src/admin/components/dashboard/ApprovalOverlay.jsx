const ApprovalOverlay = ({ onClose }) => {
  const requests = [
    {
      id: 1,
      type: "Page",
      name: "Library",
      action: "UPDATE",
      submittedBy: "Library Staff",
      department: "Library",
      submitted: "2 min ago",
      status: "Pending",
    },
    {
      id: 2,
      type: "Notice",
      name: "Library Approval Test",
      action: "CREATE",
      submittedBy: "Library Staff",
      department: "Library",
      submitted: "18 min ago",
      status: "Pending",
    },
    {
      id: 3,
      type: "Media",
      name: "Exam Schedule.pdf",
      action: "UPLOAD",
      submittedBy: "Office Staff",
      department: "Administration",
      submitted: "42 min ago",
      status: "Pending",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close approval queue"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* OVERLAY */}
      <div className="relative z-10 w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Dashboard
            </div>

            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              Pending Review
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Changes waiting for administrator approval.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          >
            ×
          </button>
        </div>

        {/* REQUESTS */}
        <div className="overflow-y-auto max-h-[calc(85vh-110px)]">
          {requests.map((request) => (
            <div
              key={request.id}
              className="px-7 py-5 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-6">

                {/* LEFT */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {request.name}
                    </span>

                    <span className="rounded-md border border-gray-300 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      {request.action}
                    </span>

                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    {request.type} · {request.department}
                  </div>

                  <div className="mt-1 text-xs text-gray-400">
                    Submitted by {request.submittedBy} ·{" "}
                    {request.submitted}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg bg-gray-900 text-xs font-medium text-white hover:bg-black"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApprovalOverlay;