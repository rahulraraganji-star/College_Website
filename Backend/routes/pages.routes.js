import express from "express";

import {
  getAllPages,
  getPageBySlug,
  getPageById,
  createPage,
  updatePage,
  getPagesByParent,
  togglePublishPage,
  deletePage,
} from "../controllers/pages.controller.js";

const router = express.Router();

router.get(
  "/sidebar/:parentSlug",
  getPagesByParent
);
/*Edit Page */
router.get("/id/:id", getPageById);

/*sideBar*/
router.get("/:slug", getPageBySlug);



/* GET ALL PAGES */
router.get("/", getAllPages);

/*Create Pages*/
router.post("/", createPage);

/*Update Pages */
router.put("/:id", updatePage);

router.delete("/:id", deletePage);

/* Publish/Unpublish */
router.patch("/:id/publish", togglePublishPage);

/* GET SINGLE PAGE BY SLUG */
router.get("/:slug", getPageBySlug);

export default router;