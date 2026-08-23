import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./database/connect.js";

import pageRoutes from "./routes/pages.routes.js";
import navigationRoutes from "./routes/navigation.js";

import homeRoutes from "./routes/home.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

import mediaRoutes from "./routes/mediaRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";

import authRoutes from "./routes/auth.routes.js";

import roleRoutes from "./routes/role.routes.js";

import userRoutes from "./routes/users.routes.js";

import approvalRoutes from "./routes/approval.routes.js";
import accessRoutes from "./routes/accessRoutes.js";

dotenv.config();

connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==========================================
    MIDDLEWARE
========================================== */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

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

/**Roles */
app.use(
  "/api/roles",
  roleRoutes
);

/**user routes*/
app.use(
  "/api/users",
  userRoutes
);

/**Auth */
app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/approvals",
  approvalRoutes
);

app.use(
  "/api/access",
  accessRoutes
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