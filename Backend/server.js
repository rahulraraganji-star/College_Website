import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./database/connect.js";

import pageRoutes from "./routes/pages.routes.js";
import navigationRoutes from "./routes/navigation.js";

import homeRoutes from "./routes/home.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

import mediaRoutes from "./routes/mediaRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";

dotenv.config();

connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==========================================
    MIDDLEWARE
========================================== */

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

/* ==========================================
    API ROUTES
========================================== */

app.use(
  "/api/pages",
  pageRoutes
);

app.use(
  "/api/navigation",
  navigationRoutes
);

app.use(
  "/api/home",
  homeRoutes
);

app.use(
  "/api/settings",
  settingsRoutes
);

app.use(
  "/api/media",
  mediaRoutes
);

app.use(
  "/api/folders",
  folderRoutes
);

/* ==========================================
    HEALTH CHECK
========================================== */

app.get("/", (req, res) => {

  res.json({

    success: true,

    message:
      "College CMS API is running.",

  });

});

/* ==========================================
    GLOBAL ERROR HANDLER
========================================== */

app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({

    success: false,

    message: "Internal Server Error",

    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : undefined,

  });

});

/* ==========================================
    START SERVER
========================================== */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});