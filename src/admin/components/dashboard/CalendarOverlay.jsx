import { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Bell, 
  X,
  Check
} from "lucide-react";

const API_URL = "/api";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Academic", value: "Academic", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { label: "Exam", value: "Exam", color: "bg-red-100 text-red-800 border-red-200" },
  { label: "Holiday", value: "Holiday", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { label: "Sports", value: "Sports", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { label: "Event", value: "Event", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { label: "Reminder", value: "Reminder", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { label: "Meeting", value: "Meeting", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { label: "Admission", value: "Admission", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { label: "Faculty", value: "Faculty", color: "bg-orange-100 text-orange-800 border-orange-200" },
];

const getCategoryColor = (cat) => {
  const found = CATEGORIES.find((c) => c.value === cat);
  return found?.color || "bg-gray-100 text-gray-800 border-gray-200";
};

const getPriorityBadge = (priority) => {
  switch (priority) {
    case "urgent":
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-300">Urgent</span>;
    case "high":
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">High</span>;
    case "low":
      return <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-gray-100 text-gray-600 border border-gray-200">Low</span>;
    default:
      return <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">Normal</span>;
  }
};

const CalendarOverlay = ({ onClose, onEventUpdated }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Modal states for Create/Edit
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("10:00 AM");
  const [category, setCategory] = useState("Academic");
  const [location, setLocation] = useState("College Campus");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isReminder, setIsReminder] = useState(false);

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        ...(activeCategory !== "all" && { category: activeCategory }),
      });

      const res = await fetch(`${API_URL}/calendar/events?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to load calendar events:", err);
      setErrorMsg("Failed to load calendar events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [month, year, activeCategory]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid (up to 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Events on a given day
  const getEventsForDate = (d) => {
    const dateKey = d.toDateString();
    return events.filter((e) => new Date(e.date).toDateString() === dateKey);
  };

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return getEventsForDate(selectedDate);
  }, [selectedDate, events]);

  // Open Add Event Modal
  const handleOpenAdd = (defaultDate) => {
    const target = defaultDate || selectedDate || new Date();
    setEditingEvent(null);
    setTitle("");
    // Format YYYY-MM-DD for date input
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");
    setEventDate(`${y}-${m}-${day}`);
    setEventTime("10:00 AM");
    setCategory("Academic");
    setLocation("College Campus");
    setDescription("");
    setPriority("medium");
    setIsReminder(false);
    setShowEventModal(true);
  };

  // Open Edit Event Modal
  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setTitle(evt.title || "");
    const d = new Date(evt.date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setEventDate(`${y}-${m}-${day}`);
    setEventTime(evt.time || "10:00 AM");
    setCategory(evt.category || "Academic");
    setLocation(evt.location || "College Campus");
    setDescription(evt.description || "");
    setPriority(evt.priority || "medium");
    setIsReminder(Boolean(evt.isReminder));
    setShowEventModal(true);
  };

  // Save / Update Event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    setFormLoading(true);
    setFeedback("");
    try {
      const payload = {
        title: title.trim(),
        date: eventDate,
        time: eventTime.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        priority,
        isReminder,
      };

      const url = editingEvent
        ? `${API_URL}/calendar/events/${editingEvent._id}`
        : `${API_URL}/calendar/events`;

      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save event.");
      }

      setFeedback(editingEvent ? "Event updated successfully!" : "Event created successfully!");
      setShowEventModal(false);
      fetchEvents();
      if (onEventUpdated) onEventUpdated();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event / reminder?")) return;

    try {
      const res = await fetch(`${API_URL}/calendar/events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete event.");
      }
      setFeedback("Event removed.");
      fetchEvents();
      if (onEventUpdated) onEventUpdated();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const todayStr = new Date().toDateString();
  const selectedStr = selectedDate.toDateString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative z-10 w-full max-w-7xl max-h-[92vh] overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl flex flex-col">

        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-gray-200 gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <CalendarIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-950">College Calendar & Reminders</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700">
                  {events.length} Events
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Set important academic dates, examination schedules, holidays, and reminders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={goToToday}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => handleOpenAdd(selectedDate)}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              Add Event / Reminder
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* CATEGORY FILTER BAR */}
        <div className="px-6 py-2.5 border-b border-gray-100 bg-gray-50/70 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-2 shrink-0">
            Filter:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 border ${
                activeCategory === cat.value
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FEEDBACK ALERTS */}
        {feedback && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback("")} className="text-emerald-600 hover:text-emerald-900">✕</button>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="text-red-600 hover:text-red-900">✕</button>
          </div>
        )}

        {/* MAIN BODY: CALENDAR GRID (LEFT) + SELECTED DAY SIDEBAR (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] flex-1 overflow-hidden">
          
          {/* CALENDAR VIEW */}
          <div className="flex flex-col border-r border-gray-200 overflow-y-auto p-6">
            
            {/* MONTH HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {monthNames[month]} {year}
                </h3>
                {loading && (
                  <span className="text-xs text-gray-400 font-medium">
                    Updating...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* DAY NAMES */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* CELLS GRID */}
            <div className="grid grid-cols-7 gap-1.5 flex-1 auto-rows-fr">
              {calendarDays.map((cell, idx) => {
                const isSelected = cell.date.toDateString() === selectedStr;
                const isToday = cell.date.toDateString() === todayStr;
                const dayEvents = getEventsForDate(cell.date);
                const hasReminders = dayEvents.some((e) => e.isReminder);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`
                      min-h-[86px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between
                      ${
                        isSelected
                          ? "border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50/80 shadow-xs"
                          : cell.isCurrentMonth
                          ? "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                          : "border-gray-100 bg-gray-50/40 opacity-40 hover:opacity-75"
                      }
                    `}
                  >
                    {/* TOP CELL ROW: DATE NUMBER & INDICATORS */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`
                          w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold
                          ${
                            isToday
                              ? "bg-neutral-900 text-white font-bold shadow-2xs"
                              : isSelected
                              ? "text-neutral-900 font-bold bg-neutral-200"
                              : "text-gray-700"
                          }
                        `}
                      >
                        {cell.date.getDate()}
                      </span>

                      {hasReminders && (
                        <span title="Contains Reminder" className="text-amber-500">
                          <Bell size={12} fill="currentColor" />
                        </span>
                      )}
                    </div>

                    {/* EVENT CHIPS LIST (UP TO 2) */}
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev._id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate border"
                          style={{
                            backgroundColor: ev.category === "Exam" ? "#fee2e2" : ev.category === "Holiday" ? "#f3e8ff" : "#f0fdf4",
                            borderColor: ev.category === "Exam" ? "#fecaca" : ev.category === "Holiday" ? "#e9d5ff" : "#bbf7d0",
                            color: ev.category === "Exam" ? "#991b1b" : ev.category === "Holiday" ? "#6b21a8" : "#166534",
                          }}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] font-semibold text-gray-400 pl-0.5">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR: SELECTED DAY DETAILS & SCHEDULE */}
          <div className="flex flex-col bg-gray-50/50 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Day Schedule
                </p>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAdd(selectedDate)}
                className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition shadow-2xs text-xs font-semibold flex items-center gap-1"
                title="Add event on this date"
              >
                <Plus size={13} /> Add
              </button>
            </div>

            {/* LIST OF EVENTS ON SELECTED DATE */}
            <div className="space-y-3 flex-1">
              {selectedDateEvents.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
                    <CalendarIcon size={20} />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">No events or reminders</p>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto">
                    Nothing scheduled for this date. Click Add to create one.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenAdd(selectedDate)}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition shadow-2xs"
                  >
                    + Add for this Day
                  </button>
                </div>
              ) : (
                selectedDateEvents.map((evt) => (
                  <div
                    key={evt._id}
                    className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-2.5 hover:border-gray-300 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(evt.category)}`}>
                            {evt.category}
                          </span>
                          {getPriorityBadge(evt.priority)}
                          {evt.isReminder && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Bell size={10} /> Reminder
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-gray-900 text-sm mt-1.5 leading-snug">
                          {evt.title}
                        </h5>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(evt)}
                          className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition"
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(evt._id)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        <span>{evt.time || "10:00 AM"}</span>
                      </div>
                      {evt.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                      {evt.description && (
                        <p className="text-gray-600 mt-1 italic text-[11.5px] line-clamp-3">
                          "{evt.description}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT EVENT MODAL POPUP */}
      {showEventModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingEvent ? "Edit Event / Reminder" : "Add Calendar Event / Reminder"}
              </h3>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="w-7 h-7 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Event / Reminder Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. End Semester Examinations / NAAC Committee Meeting"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                  >
                    {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Normal / Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Auditorium / Seminar Hall"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details, agenda, instructions for students/faculty..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isReminder}
                    onChange={(e) => setIsReminder(e.target.checked)}
                    className="h-4 w-4 rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="font-semibold text-gray-800 text-xs">
                    Mark as Important Reminder (Highlight on Dashboard)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-black disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editingEvent ? "Update Event" : "Save Event / Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarOverlay;
