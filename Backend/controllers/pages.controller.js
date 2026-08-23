import Page from "../models/page.js";
import NavigationItem from "../models/NavigationItem.js";
import { createApprovalRequest } from "../services/approvalService.js";

export const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({
      slug: req.params.slug,
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } }
      ],
    });

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPages = async (req, res) => {
  try {

    const role = req.authRole;

    let query = {
      isPublished: true,
    };


    /* ------------------------------------------
       RESTRICT BY PAGE SCOPE
    ------------------------------------------ */

    if (
      role &&
      !role.allowedPages.includes("*")
    ) {

      query.parentSlug = {
        $in: role.allowedPages,
      };

    }


    const pages = await Page.find(
      query
    ).sort({
      createdAt: -1,
    });


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
    const pages = await Page.find({
      parentSlug: req.params.parentSlug,
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } },
      ],
    })
      .select("title slug parentSlug")
      .sort({ createdAt: 1 });

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

    const page = await Page.findById(req.params.id);

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

    if (req.authUser.role === "department_editor") {

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
          "Page update submitted for approval.",

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
    const page = await Page.findByIdAndDelete(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // Delete corresponding navigation item
    await NavigationItem.findOneAndDelete({
      pageId: page._id,
    });

    res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const togglePublishPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    page.isPublished = !page.isPublished;

    await page.save();

    // Update navigation item active status to match page
    await NavigationItem.findOneAndUpdate(
      { pageId: page._id },
      { isActive: page.isPublished }
    );

    res.status(200).json({
      success: true,
      message: page.isPublished
        ? "Page published successfully"
        : "Page unpublished successfully",
      page,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

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