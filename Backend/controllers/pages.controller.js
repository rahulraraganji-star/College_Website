import mongoose from "mongoose";
import Page from "../models/page.js";
import NavigationItem from "../models/NavigationItem.js";
import { createApprovalRequest } from "../services/approvalService.js";
import { clearServerNavigationCache } from "./navigation.controller.js";

// In-Memory Fast Cache for public page reads
const serverPageCache = new Map();
const serverSidebarCache = new Map();

export const clearServerPageCache = () => {
  serverPageCache.clear();
  serverSidebarCache.clear();
  clearServerNavigationCache();
};

export const getPageBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    if (serverPageCache.has(slug)) {
      return res.json(serverPageCache.get(slug));
    }

    const page = await Page.findOne({
      slug,
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } }
      ],
    }).lean();

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    serverPageCache.set(slug, page);
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPages = async (req, res) => {
  try {

    const allowedPages =
      req.authUser?.allowedPages || [];

    let query = {};

    /* ------------------------------------------
       RESTRICT BY EFFECTIVE USER PAGE SCOPE
    ------------------------------------------ */

    if (
      allowedPages.length > 0 &&
      !allowedPages.includes("*")
    ) {
      query.$or = [
        { parentSlug: { $in: allowedPages } },
        { slug: { $in: allowedPages } },
      ];
    }

    const pages = await Page.find(query)
      .select("title slug parentSlug template isPublished createdAt updatedAt")
      .sort({
        createdAt: -1,
      })
      .lean();

    res.json(pages);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getPagesByParent = async (req, res) => {
  try {
    const parentSlug = req.params.parentSlug;
    if (serverSidebarCache.has(parentSlug)) {
      return res.json(serverSidebarCache.get(parentSlug));
    }

    const pages = await Page.find({
      parentSlug,
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } },
      ],
    })
      .select("title slug parentSlug")
      .sort({ createdAt: 1 })
      .lean();

    serverSidebarCache.set(parentSlug, pages);
    res.json(pages);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch pages",
    });
  }
};

export const createPage = async (req, res) => {
  try {
    const page = new Page(req.body);

    await page.save();
    clearServerPageCache();

    // Automatically create a navigation child
    if (page.parentSlug) {
      const lastItem = await NavigationItem
        .find({ menuKey: page.parentSlug })
        .sort({ order: -1 })
        .limit(1);

      const nextOrder =
        lastItem.length > 0
          ? lastItem[0].order + 1
          : 1;

      await NavigationItem.create({
        pageId: page._id,
        menuKey: page.parentSlug,
        label: page.title,
        slug: `/${page.parentSlug}/${page.slug}`,
        icon: "",
        order: nextOrder,
        isActive: true,
      });
    }

    res.status(201).json(page);

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Slug already exists",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updatePage = async (req, res) => {
  try {
    /* ==========================================
       FIND EXISTING PAGE
    ========================================== */

    const idOrSlug = req.params.id;
    let page = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      page = await Page.findById(idOrSlug);
    }

    if (!page) {
      page = await Page.findOne({ slug: idOrSlug });
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }


    /* ==========================================
       DEPARTMENT EDITOR
       → APPROVAL REQUIRED
    ========================================== */

    /* ==========================================
       APPROVAL GATE
       Anyone WITHOUT the pages.publish permission
       must submit changes for approval — this
       covers all department editors regardless of
       what their role is named.
    ========================================== */

    const canPublishDirectly =
      req.authUser.role === "super_admin" ||
      req.authUser.role === "admin";

    if (!canPublishDirectly) {

      const before = page.toObject();

      const after = {
        ...before,
        ...req.body,
      };


      const { approvalRequest } =
        await createApprovalRequest({
          req,
          actor: req.authUser,

          resourceType: "page",

          resourceId: page._id,

          resourceName: page.title,

          action: "update",

          before,

          after,
        });


      return res.status(202).json({
        success: true,

        message:
          "Your changes have been submitted for Admin approval. They will go live once approved.",

        approvalRequired: true,

        approvalRequestId:
          approvalRequest._id,
      });
    }


    /* ==========================================
       ADMIN / SUPER ADMIN
       → DIRECT UPDATE
    ========================================== */

    const updatedPage =
      await Page.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!updatedPage) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    clearServerPageCache();

    /* ==========================================
       UPDATE NAVIGATION ITEM
    ========================================== */

    await NavigationItem.findOneAndUpdate(
      {
        pageId: updatedPage._id,
      },
      {
        label: updatedPage.title,

        slug:
          `/${updatedPage.parentSlug}/${updatedPage.slug}`,
      }
    );


    return res.json({
      success: true,
      message: "Page updated successfully.",
      page: updatedPage,
      approvalRequired: false,
    });


  } catch (error) {

    console.error(
      "UPDATE PAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update page",
    });
  }
};

export const deletePage = async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    let page = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      page = await Page.findByIdAndDelete(idOrSlug);
    }

    if (!page) {
      page = await Page.findOneAndDelete({ slug: idOrSlug });
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    clearServerPageCache();

    // Delete corresponding navigation item
    try {
      await NavigationItem.findOneAndDelete({
        pageId: page._id,
      });
    } catch (navErr) {
      console.warn("NavigationItem cleanup warning:", navErr);
    }

    res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });

  } catch (error) {
    console.error("DELETE PAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const togglePublishPage = async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    let page = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      page = await Page.findById(idOrSlug);
    }

    if (!page) {
      page = await Page.findOne({ slug: idOrSlug });
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    page.isPublished = !page.isPublished;

    await page.save();
    clearServerPageCache();

    // Update navigation item active status to match page
    try {
      await NavigationItem.findOneAndUpdate(
        { pageId: page._id },
        { isActive: page.isPublished }
      );
    } catch (navErr) {
      console.warn("NavigationItem update warning:", navErr);
    }

    res.status(200).json({
      success: true,
      message: page.isPublished
        ? "Page published successfully"
        : "Page unpublished successfully",
      page,
    });
  } catch (error) {
    console.error("TOGGLE PUBLISH ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getPageById = async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    let page = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      page = await Page.findById(idOrSlug);
    }

    if (!page) {
      page = await Page.findOne({ slug: idOrSlug });
    }

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    res.json(page);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};