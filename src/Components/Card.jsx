import React from "react";

const Card = ({ item }) => {
  if (!item) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col min-h-[360px]">

      {/* Image Section */}
      <div className="bg-gray-50 p-4">
        <div className="rounded-xl overflow-hidden">
          <img
            src={item?.photo ? item.photo : "/staff/placeholder.jpg"}
            alt={item.name}
            onError={(e) => (e.target.src = "/staff/placeholder.jpg")}
            className="w-full h-44 object-cover"
/>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5 flex flex-col gap-3 flex-1">

        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">
          {item.name}
        </h3>

        {/* Designation */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {item.designation}
        </p>

        {/* Department */}
        {item.department && (
          <div className="pt-2">
            <span className="inline-block px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md">
              {item.department}
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default Card;