import express from "express";
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../controllers/calendarController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================
   CALENDAR & DATE REMINDER ROUTES
========================================== */

router.get("/events", requireAuth, getCalendarEvents);
router.post("/events", requireAuth, createCalendarEvent);
router.put("/events/:id", requireAuth, updateCalendarEvent);
router.delete("/events/:id", requireAuth, deleteCalendarEvent);

export default router;
