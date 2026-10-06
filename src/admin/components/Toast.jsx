import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const icons = {
  success: <CheckCircle2 size={20} className="shrink-0" />,
  error: <XCircle size={20} className="shrink-0" />,
  info: <Info size={20} className="shrink-0" />,
};

const colors = {
  success: "border-green-500 text-green-700 bg-green-50",
  error: "border-red-500 text-red-700 bg-red-50",
  info: "border-blue-500 text-blue-700 bg-blue-50",
};

const Toast = ({
  open,
  type = "success",
  message,
  onClose,
}) => {
  const isOpen = open !== undefined ? open : Boolean(message);
  if (!isOpen || !message) return null;

  return (
    <div className="fixed top-6 right-6 z-[99999]">
      <div
        className={`flex items-center gap-3 min-w-[320px] rounded-xl border-l-4 px-5 py-4 shadow-xl ${colors[type] || colors.success}`}
      >
        {icons[type] || icons.success}

        <span className="font-medium flex-1">
          {message}
        </span>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:opacity-75 transition-opacity -mr-1"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;