import express from "express";

import {
  getAllPages,
  getPageBySlug,
  createPage,
  updatePage,
  getPagesByParent
} from "../controllers/pages.controller.js";

const router = express.Router();

router.get(
  "/sidebar/:parentSlug",
  getPagesByParent
);

/*sideBar*/
router.get("/:slug", getPageBySlug);



/* GET ALL PAGES */
router.get("/", getAllPages);

/*Create Pages*/
router.post("/", createPage);

/*Update Pages */
router.put("/:id", updatePage);

/* GET SINGLE PAGE BY SLUG */
router.get("/:slug", getPageBySlug);

export default router;