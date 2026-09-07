import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    time: {
      type: String,
      default: "10:00 AM",
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Academic",
        "Exam",
        "Holiday",
        "Sports",
        "Event",
        "Reminder",
        "Meeting",
        "Faculty",
        "Admission",
      ],
      default: "Academic",
      index: true,
    },
    location: {
      type: String,
      default: "College Campus",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    isReminder: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

calendarEventSchema.index({ date: 1, isReminder: 1 });

export default mongoose.models.CalendarEvent ||
  mongoose.model("CalendarEvent", calendarEventSchema);
