import Page from "../models/page.js";
import { createApprovalRequest } from "../services/approvalService.js";


/* ==========================================
   GET HOME
   PUBLIC
========================================== */

export const getHome = async (req, res) => {
  try {
    const home = await Page.findOne({
      slug: "home",
    }).lean();

    if (!home) {
      return res.status(404).json({
        success: false,
        message: "Home page not found.",
      });
    }

    return res.status(200).json(home);

  } catch (error) {
    console.error("GET HOME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ==========================================
   UPDATE HOME
========================================== */

export const updateHome = async (req, res) => {
  try {
    console.log("========== UPDATE HOME ==========");

    const incomingSections = req.body?.sections;

    console.log(
      "Incoming sections:",
      JSON.stringify(incomingSections, null, 2)
    );

    /* ------------------------------------------
       VALIDATE
    ------------------------------------------ */

    if (
      !incomingSections ||
      typeof incomingSections !== "object" ||
      Array.isArray(incomingSections)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid home sections data.",
      });
    }

    /* ------------------------------------------
       FIND HOME
    ------------------------------------------ */

    const existingHome = await Page.findOne({
      slug: "home",
    });

    if (!existingHome) {
      return res.status(404).json({
        success: false,
        message: "Home page not found.",
      });
    }

    /* ------------------------------------------
       EXISTING SECTIONS
    ------------------------------------------ */

    const existingSections =
      existingHome.sections?.toObject
        ? existingHome.sections.toObject()
        : existingHome.sections || {};

    /* ------------------------------------------
       MERGE SECTIONS
       
       Only sections allowed by
       filterHomeSections are present here.
    ------------------------------------------ */

    const mergedSections = {
      ...existingSections,
      ...incomingSections,
    };

    /* ------------------------------------------
       DIRECT PUBLISH CHECK
    ------------------------------------------ */

    console.log("========== HOME AUTH DEBUG ==========");

    console.log("USER ID:", req.authUser?._id);
    console.log("USER NAME:", req.authUser?.name);
    console.log("USER ROLE:", req.authUser?.role);
    console.log("ROLE ID:", req.authUser?.roleId);
    console.log("PERMISSIONS:", req.authUser?.permissions);
    console.log("ALLOWED PAGES:", req.authUser?.allowedPages);

    const canPublishDirectly =
      req.authUser.role === "super_admin" ||
      req.authUser.role === "admin" ||
      (req.authUser.permissions || []).includes(
        "pages.publish"
      );

    console.log(
      "CAN PUBLISH DIRECTLY:",
      canPublishDirectly
    );

    console.log("====================================");

    /* ==========================================
       APPROVAL REQUIRED
       
       Department Editor / users without
       pages.publish come here.
       
       IMPORTANT:
       DO NOT modify the Home document.
    ========================================== */

    if (!canPublishDirectly) {
      const before = existingHome.toObject();

      const after = {
        ...before,
        sections: mergedSections,
      };

      const { approvalRequest } =
        await createApprovalRequest({
          req,
          actor: req.authUser,

          resourceType: "home",

          resourceId: existingHome._id,

          resourceName: "Home Page",

          action: "update",

          before,

          after,
        });

      console.log(
        "APPROVAL CREATED:",
        approvalRequest._id
      );

      /* ------------------------------------------
         CRITICAL:
         DO NOT SAVE THE CHANGE.
         
         The change will only be applied when
         Admin / Super Admin approves it.
      ------------------------------------------ */

      return res.status(202).json({
        success: true,

        message:
          "Home page changes submitted for approval.",

        approvalRequired: true,

        approvalRequestId:
          approvalRequest._id,
      });
    }

    /* ==========================================
       DIRECT UPDATE
       
       Only:
       - Admin
       - Super Admin
       - User with pages.publish
       
       can reach this point.
    ========================================== */

    existingHome.sections = mergedSections;

    await existingHome.save();

    /* ------------------------------------------
       GET FRESH DATA
    ------------------------------------------ */

    const freshHome = await Page.findOne({
      slug: "home",
    }).lean();

    console.log(
      "========== HOME AFTER UPDATE =========="
    );

    console.log(
      JSON.stringify(freshHome, null, 2)
    );

    return res.status(200).json({
      success: true,

      message:
        "Home page updated successfully.",

      data: freshHome,

      approvalRequired: false,
    });

  } catch (error) {
    console.error(
      "UPDATE HOME ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to update Home page.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};