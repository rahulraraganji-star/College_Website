import fs from "fs";
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
import auditRoutes from "./routes/audit.routes.js";
import linkManagerRoutes from "./routes/linkManagerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import organogramRoutes from "./routes/organogram.routes.js";
import {
  handleLegacyRequest,
  legacyResolveEndpoint,
} from "./controllers/linkManagerController.js";

dotenv.config();

connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve frontend production build directory (supports root ../dist or local ./dist on cPanel)
const distPath = fs.existsSync(path.join(__dirname, "../dist"))
  ? path.join(__dirname, "../dist")
  : path.join(__dirname, "dist");

/* ==========================================
    MIDDLEWARE
========================================== */

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, same-origin)
      if (!origin) return callback(null, true);
      // Allow any localhost port (5173, 5174, 5175 … Vite increments when port is busy)
      // and allow production domain / staging domain / configured CLIENT_URL
      if (
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^https?:\/\/([a-z0-9-]+\.)*fragnelcollege\.edu\.in(:[0-9]+)?$/i.test(origin) ||
        (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

// Smart WebP negotiation & static uploads serving with immutable caching
app.use("/uploads", (req, res, next) => {
  const accept = req.headers.accept || "";
  if (accept.includes("image/webp")) {
    const ext = path.extname(req.path).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
      const webpRelative = req.path.replace(/\.(jpe?g|png)$/i, ".webp");
      const webpAbsolute = path.join(__dirname, "uploads", webpRelative);
      if (fs.existsSync(webpAbsolute)) {
        res.set("Content-Type", "image/webp");
        res.set("Vary", "Accept");
        res.set("Cache-Control", "no-cache, must-revalidate");
        return res.sendFile(webpAbsolute);
      }
    }
  }
  next();
});

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads"),
    {
      maxAge: 0,
      etag: true,
      lastModified: true,
      setHeaders: (res) => {
        res.set("Cache-Control", "no-cache, must-revalidate");
      }
    }
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

app.use(
  "/api/audit-logs",
  auditRoutes
);

app.use(
  "/api/link-manager",
  linkManagerRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/calendar",
  calendarRoutes
);

app.use(
  "/api/organogram",
  organogramRoutes
);

/* ==========================================
    API HEALTH CHECK & 404 ROUTE GUARD
========================================== */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "College CMS API is running.",
  });
});

// Protect all /api/* routes from falling through to the React SPA fallback
app.all("/api/{*splat}", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

/* ==========================================
    LEGACY URL / FILE RESOLVER MIDDLEWARE
    Handles legacy WordPress files (/wp-content/*),
    dedicated /legacy-resolve endpoints, and mapped redirects.
========================================== */

app.use("/legacy-resolve", legacyResolveEndpoint);
app.use(handleLegacyRequest);

/* ==========================================
    STATIC REACT FRONTEND & SPA FALLBACK
========================================== */

// 1. Serve static frontend assets (JS, CSS, images, icons, fonts)
app.use(
  express.static(distPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // index.html must NEVER be cached by browsers
      if (path.basename(filePath) === "index.html") {
        res.set("Cache-Control", "no-cache, no-store, must-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
      } else if (filePath.includes("assets") || filePath.includes("dist" + path.sep + "assets")) {
        // Hashed JS/CSS chunks have unique hashes, safe to cache permanently
        res.set("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        res.set("Cache-Control", "no-cache, must-revalidate");
      }
    },
  })
);

// 2. Fallback for React Router (SPA HTML5 History API)
// Direct hits to /admin, /courses, /page/:slug, etc. return index.html.
// Protect /api, /uploads, /legacy-resolve, and missing assets from returning index.html.
app.get("/{*splat}", (req, res) => {
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/uploads") ||
    req.path.startsWith("/legacy-resolve") ||
    req.path.startsWith("/assets/")
  ) {
    return res.status(404).json({
      success: false,
      message: `Not found: ${req.method} ${req.originalUrl}`,
    });
  }

  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    return res.sendFile(indexPath);
  }

  return res.status(404).json({
    success: false,
    message: "Frontend production build (dist/index.html) not found. Run 'npm run build' first.",
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