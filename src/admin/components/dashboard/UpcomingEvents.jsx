import DashboardCard from "./DashboardCard";

const UpcomingEvents = () => {
  const events = [
    {
      date: "24",
      month: "AUG",
      title: "Independence Day Celebration",
      category: "College Event",
      time: "10:00 AM",
      location: "College Auditorium",
    },
    {
      date: "28",
      month: "AUG",
      title: "Student Orientation",
      category: "Academic",
      time: "9:30 AM",
      location: "Seminar Hall",
    },
    {
      date: "03",
      month: "SEP",
      title: "Annual Sports Meet",
      category: "Sports",
      time: "8:00 AM",
      location: "College Ground",
    },
    {
      date: "08",
      month: "SEP",
      title: "Faculty Development Programme",
      category: "Faculty",
      time: "11:00 AM",
      location: "Conference Room",
    },
  ];

  return (
    <DashboardCard
      eyebrow="Upcoming Events"
      action="View calendar →"
      className="min-h-[320px]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {events.map((event, index) => (
          <div
            key={event.title}
            className={`
              flex
              gap-4
              py-4
              ${
                index >= 2
                  ? "border-t border-gray-200"
                  : ""
              }
            `}
          >
            {/* DATE */}
            <div
              className="
                w-12
                h-12
                shrink-0
                rounded-lg
                border
                border-gray-200
                flex
                flex-col
                items-center
                justify-center
              "
            >
              <span className="text-lg font-semibold leading-none text-gray-900">
                {event.date}
              </span>

              <span className="mt-1 text-[9px] font-semibold tracking-wider text-gray-400">
                {event.month}
              </span>
            </div>

            {/* DETAILS */}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {event.title}
              </div>

              <div className="mt-1 text-xs text-gray-400">
                {event.category}
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                <span>{event.time}</span>
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default UpcomingEvents;