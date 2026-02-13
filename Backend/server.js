import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./database/connect.js";
import pageRoutes from "./routes/pages.routes.js";
import navigationRoutes from "./routes/navigation.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pages", pageRoutes);

/** Navgation */
app.use("/api/navigation", navigationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
