import express from "express";

import {
  getHeader,
  getFooter,
} from "../controllers/settings.controller.js";

const router = express.Router();


/* ==========================================
   PUBLIC SETTINGS
========================================== */

/*
   The public website needs these endpoints
   to render the header and footer.
*/

router.get(
  "/header",
  getHeader
);

router.get(
  "/footer",
  getFooter
);


export default router;