import React from "react";

const StaffCard = ({ staff }) => {
  if (!staff) return null;

  return (
    <div className="w-72 h-[28rem] bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col overflow-hidden group">
      {/* Image Section */}
      <div className="h-72 flex-shrink-0 relative bg-gradient-to-br from-slate-50 to-slate-100">
        <img
          src={staff.photo || "/placeholder.jpg"}
          alt={staff.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-400 rounded-full shadow-md" />
      </div>
      
      {/* Content Section */}
      <div className="p-7 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 leading-tight">
            {staff.name}
          </h3>
          <p className="text-slate-600 font-medium text-base">
            {staff.designation}
          </p>
        </div>
        
        {staff.department && (
          <div className="pt-2 border-t border-slate-100">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100">
              {staff.department}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffCard;
