const ConfirmModal = ({
  open = true,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText = "Cancel",
  confirmColor = "bg-red-600 hover:bg-red-700",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (open === false) return null;

  const displayConfirmText =
    confirmText || confirmLabel || (loading ? "Deleting..." : "Confirm");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="leading-relaxed text-gray-600 whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-lg px-5 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmColor}`}
          >
            {loading ? "Deleting..." : displayConfirmText}
          </button>

        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;