const DashboardCard = ({
  title,
  eyebrow,
  action,
  children,
  className = "",
  onClick,
}) => {
  return (
    <section
      onClick={onClick}
      className={`
        bg-white
        border border-gray-200
        rounded-xl
        overflow-hidden
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {(eyebrow || title || action) && (
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            {eyebrow && (
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {eyebrow}
              </div>
            )}

            {title && (
              <h2 className="mt-1 text-sm font-semibold text-gray-900">
                {title}
              </h2>
            )}
          </div>

          {action && (
            <div className="text-xs text-gray-400">
              {action}
            </div>
          )}
        </div>
      )}

      <div className="px-6 pb-6">
        {children}
      </div>
    </section>
  );
};

export default DashboardCard;