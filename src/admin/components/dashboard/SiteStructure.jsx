const SiteStructure = () => {
  return (
    <div
      className="
        rounded-xl
        border
        border-gray-900
        bg-[#0d0d0d]
        text-white
        p-6
        min-h-[520px]
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <span
          className="
            text-[11px]
            tracking-[0.18em]
            uppercase
            text-gray-400
          "
        >
          Site Structure
        </span>

        <span className="text-[11px] text-gray-500">
          Live tree
        </span>
      </div>

      {/* TREE */}
      <div className="font-mono text-sm leading-8">

        {/* HOME */}
        <div className="font-semibold">
          Home
        </div>

        {/* ABOUT */}
        <div>
          <div className="font-semibold">
            About
          </div>

          <div className="ml-5 border-l border-gray-700 pl-4">
            <div>History</div>
            <div>Vision</div>
            <div>Mission</div>
          </div>
        </div>

        {/* ACADEMICS */}
        <div className="mt-2">
          <div className="font-semibold">
            Academics
          </div>

          <div className="ml-5 border-l border-gray-700 pl-4">
            <div>Programmes</div>
            <div>Timetable</div>
          </div>
        </div>

        {/* STUDENT LIFE */}
        <div className="mt-2">
          <div className="font-semibold">
            Student Life
          </div>

          <div className="ml-5 border-l border-gray-700 pl-4">
            <div>NSS</div>
            <div>NCC</div>
          </div>
        </div>

        {/* ADMISSIONS */}
        <div className="mt-2">
          <div className="font-semibold">
            Admissions
          </div>

          <div className="ml-5 border-l border-gray-700 pl-4">
            <div>Admission Notice</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SiteStructure;