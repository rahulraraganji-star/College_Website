import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import DashboardCard from "./DashboardCard";

const API_URL = "/api";

const UpcomingEvents = ({ onOpenCalendar }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/calendar/events?upcoming=true&limit=4`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to load upcoming events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatEventDate = (dStr) => {
    const d = new Date(dStr);
    return {
      date: String(d.getDate()).padStart(2, "0"),
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  };

  return (
    <DashboardCard
      eyebrow="College Calendar & Reminders"
      action="Open Calendar →"
      className="min-h-[320px] cursor-pointer"
      onClick={onOpenCalendar}
    >
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">
          Loading upcoming schedule...
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-xs font-semibold text-gray-700">No upcoming events or reminders</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCalendar?.();
            }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-black"
          >
            + Set Event / Reminder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {events.map((event, index) => {
            const dateObj = formatEventDate(event.date);

            return (
              <div
                key={event._id || index}
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
                {/* DATE BADGE */}
                <div
                  className={`
                    w-12
                    h-12
                    shrink-0
                    rounded-lg
                    border
                    flex
                    flex-col
                    items-center
                    justify-center
                    shadow-2xs
                    ${
                      event.isReminder
                        ? "border-amber-300 bg-amber-50/80 text-amber-950"
                        : "border-gray-200 bg-gray-50 text-gray-900"
                    }
                  `}
                >
                  <span className="text-lg font-bold leading-none">
                    {dateObj.date}
                  </span>

                  <span className="mt-1 text-[9px] font-bold tracking-wider opacity-70">
                    {dateObj.month}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {event.title}
                    </span>
                    {event.isReminder && (
                      <span title="Important Reminder" className="text-amber-500 shrink-0">
                        <Bell size={12} fill="currentColor" />
                      </span>
                    )}
                  </div>

                  <div className="mt-0.5 text-xs text-gray-500 font-medium">
                    {event.category}
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                    <span>🕒 {event.time || "10:00 AM"}</span>
                    {event.location && (
                      <span className="truncate">📍 {event.location}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
};

export default UpcomingEvents;