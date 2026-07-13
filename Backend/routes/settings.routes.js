import express from "express";
import {
  getHeader,
  getFooter,
} from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/header", getHeader);
router.get("/footer", getFooter);

export default router;