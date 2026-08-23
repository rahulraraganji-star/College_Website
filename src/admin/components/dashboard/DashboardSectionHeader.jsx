const DashboardSectionHeader = ({
  label,
  meta,
  action,
}) => {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500">
        {label}
      </div>

      <div className="flex items-center gap-3">
        {meta && (
          <span className="text-[11px] text-gray-400">
            {meta}
          </span>
        )}

        {action && action}
      </div>
    </div>
  );
};

export default DashboardSectionHeader;