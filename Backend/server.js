import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./database/connect.js";

import pageRoutes from "./routes/pages.routes.js";
import navigationRoutes from "./routes/navigation.js";

// ✅ NEW IMPORTS
import homeRoutes from "./routes/home.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// existing
app.use("/api/pages", pageRoutes);
app.use("/api/navigation", navigationRoutes);

// ✅ NEW ROUTES
app.use("/api/home", homeRoutes);
app.use("/api/settings", settingsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
