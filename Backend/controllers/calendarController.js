import CalendarEvent from "../models/CalendarEvent.js";
import AuditLog from "../models/AuditLog.js";

/**
 * Seed initial sample college calendar events if empty
 */
const seedInitialEventsIfEmpty = async (userId) => {
  const count = await CalendarEvent.countDocuments();
  if (count > 0) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const sampleEvents = [
    {
      title: "Academic Council & Syllabus Planning",
      date: new Date(year, month, now.getDate() + 2, 10, 0),
      time: "10:00 AM",
      category: "Academic",
      location: "Conference Hall A",
      description: "Review and approve department curriculum updates.",
      priority: "high",
      isReminder: true,
      createdBy: userId || null,
    },
    {
      title: "Student Orientation & Campus Welcome",
      date: new Date(year, month, now.getDate() + 5, 9, 30),
      time: "09:30 AM",
      category: "Admission",
      location: "Main Auditorium",
      description: "Welcoming incoming batch with department orientation.",
      priority: "medium",
      isReminder: false,
      createdBy: userId || null,
    },
    {
      title: "Semester Mid-Term Examinations",
      date: new Date(year, month, now.getDate() + 10, 9, 0),
      endDate: new Date(year, month, now.getDate() + 16, 17, 0),
      time: "09:00 AM",
      category: "Exam",
      location: "Examination Wing",
      description: "Conducting Theory and Practical mid-term evaluations.",
      priority: "urgent",
      isReminder: true,
      createdBy: userId || null,
    },
    {
      title: "Annual College Sports & Athletic Meet",
      date: new Date(year, month, now.getDate() + 14, 8, 0),
      time: "08:00 AM",
      category: "Sports",
      location: "College Stadium",
      description: "Track and field events, inter-department tournaments.",
      priority: "medium",
      isReminder: false,
      createdBy: userId || null,
    },
    {
      title: "Faculty Research & Development Workshop",
      date: new Date(year, month, now.getDate() + 20, 11, 0),
      time: "11:00 AM",
      category: "Faculty",
      location: "Seminar Hall 2",
      description: "Interactive session on grants and journal publications.",
      priority: "medium",
      isReminder: false,
      createdBy: userId || null,
    },
  ];

  await CalendarEvent.insertMany(sampleEvents);
};

/**
 * GET /api/calendar/events
 */
export const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user?.userId || req.authUser?._id;
    await seedInitialEventsIfEmpty(userId);

    const { month, year, upcoming, limit = 50, category, isReminder } = req.query;

    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (isReminder !== undefined) {
      query.isReminder = isReminder === "true";
    }

    if (upcoming === "true") {
      // Find events from beginning of today onwards
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      query.date = { $gte: startOfToday };
      
      const events = await CalendarEvent.find(query)
        .sort({ date: 1 })
        .limit(Number(limit))
        .populate("createdBy", "name email");

      return res.json({
        success: true,
        events,
      });
    }

    if (month !== undefined && year !== undefined) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startDate = new Date(y, m, 1);
      const endDate = new Date(y, m + 1, 0, 23, 59, 59);

      query.date = { $gte: startDate, $lte: endDate };
    }

    const events = await CalendarEvent.find(query)
      .sort({ date: 1 })
      .limit(Number(limit))
      .populate("createdBy", "name email");

    return res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("GET CALENDAR EVENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch calendar events.",
      error: error.message,
    });
  }
};

/**
 * POST /api/calendar/events
 */
export const createCalendarEvent = async (req, res) => {
  try {
    const {
      title,
      date,
      endDate,
      time,
      category,
      location,
      description,
      priority,
      isReminder,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event title is required.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Event date is required.",
      });
    }

    const userId = req.user?.userId || req.authUser?._id;

    const event = await CalendarEvent.create({
      title: title.trim(),
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      time: time?.trim() || "10:00 AM",
      category: category || "Academic",
      location: location?.trim() || "College Campus",
      description: description?.trim() || "",
      priority: priority || "medium",
      isReminder: Boolean(isReminder),
      createdBy: userId || null,
    });

    // Create Audit Log entry
    try {
      if (userId) {
        await AuditLog.create({
          actor: userId,
          actorRole: req.authUser?.role || "admin",
          resourceType: "calendar",
          resourceId: event._id,
          resourceName: event.title,
          action: "EVENT_CREATED",
          after: event.toObject(),
        });
      }
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return res.status(201).json({
      success: true,
      message: "Calendar event / reminder created successfully.",
      event,
    });
  } catch (error) {
    console.error("CREATE CALENDAR EVENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create calendar event.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/calendar/events/:id
 */
export const updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      date,
      endDate,
      time,
      category,
      location,
      description,
      priority,
      isReminder,
    } = req.body;

    const event = await CalendarEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (title !== undefined) event.title = title.trim();
    if (date !== undefined) event.date = new Date(date);
    if (endDate !== undefined) event.endDate = endDate ? new Date(endDate) : null;
    if (time !== undefined) event.time = time.trim();
    if (category !== undefined) event.category = category;
    if (location !== undefined) event.location = location.trim();
    if (description !== undefined) event.description = description.trim();
    if (priority !== undefined) event.priority = priority;
    if (isReminder !== undefined) event.isReminder = Boolean(isReminder);

    await event.save();

    return res.json({
      success: true,
      message: "Calendar event updated successfully.",
      event,
    });
  } catch (error) {
    console.error("UPDATE CALENDAR EVENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update calendar event.",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/calendar/events/:id
 */
export const deleteCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // Log deletion
    try {
      const userId = req.user?.userId || req.authUser?._id;
      if (userId) {
        await AuditLog.create({
          actor: userId,
          actorRole: req.authUser?.role || "admin",
          resourceType: "calendar",
          resourceId: event._id,
          resourceName: event.title,
          action: "EVENT_DELETED",
          before: event.toObject(),
        });
      }
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return res.json({
      success: true,
      message: "Calendar event deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE CALENDAR EVENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete calendar event.",
      error: error.message,
    });
  }
};
