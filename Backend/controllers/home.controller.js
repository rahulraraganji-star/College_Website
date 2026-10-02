import Page from "../models/page.js";
import { createApprovalRequest } from "../services/approvalService.js";
import { clearServerPageCache } from "./pages.controller.js";


// In-Memory Fast Cache for Home Page
let cachedHome = null;

export const clearHomeCache = () => {
  cachedHome = null;
};

/* ==========================================
   GET HOME
   PUBLIC
========================================== */

export const getHome = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    if (cachedHome) {
      return res.status(200).json(cachedHome);
    }

    const home = await Page.findOne({
      slug: "home",
    }).lean();

    if (!home) {
      return res.status(404).json({
        success: false,
        message: "Home page not found.",
      });
    }

    let enrichedSections = home.sections || {};

    if (!enrichedSections.principalMessage || !enrichedSections.principalMessage.name) {
      try {
        const pmPage = await Page.findOne({
          slug: { $in: ["principal-s-message", "principals-message"] },
        }).lean();

        let defaultPm = null;
        if (pmPage && Array.isArray(pmPage.sections)) {
          const gallerySec = pmPage.sections.find((s) => s.type === "gallery");
          const pmBlock = gallerySec?.galleries?.find((g) => g.type === "principalMessage");
          if (pmBlock) {
            let excerpt = pmBlock.message || "";
            const paras = excerpt.split(/\n+/).map((p) => p.trim()).filter(Boolean);
            if (paras.length > 1 && paras[0].length < 150) {
              excerpt = `${paras[0]}\n\n${paras[1]}`;
            } else if (paras.length > 0) {
              excerpt = paras[0];
            }

            defaultPm = {
              tag: "INSTITUTIONAL LEADERSHIP",
              title: pmBlock.title || "Principal’s Message",
              name: pmBlock.name || "Prof.(Dr.) Annie Rajan",
              designation: pmBlock.designation || "Principal",
              message: excerpt,
              image: pmBlock.media || null,
              buttonText: "Read Principal’s Message",
              buttonLink: `/${pmPage.parentSlug ? pmPage.parentSlug + "/" : ""}${pmPage.slug}`,
            };
          }
        }

        if (!defaultPm) {
          defaultPm = {
            tag: "INSTITUTIONAL LEADERSHIP",
            title: "Principal’s Message",
            name: "Prof.(Dr.) Annie Rajan",
            designation: "Principal",
            message:
              "I extend a hearty welcome to you for seeking admission in this institution of higher learning. You are now at the crucial phase of your life when you have to opt for a course that matches the best with your dreams and your future career planning.",
            image: {
              url: "/uploads/media/images/1790087827760-975692188.jpg",
              alt: "Prof.(Dr.) Annie Rajan - Principal",
            },
            buttonText: "Read Principal’s Message",
            buttonLink: "/about/principal-s-message",
          };
        }

        enrichedSections = {
          ...enrichedSections,
          principalMessage: {
            ...defaultPm,
            ...(enrichedSections.principalMessage || {}),
          },
        };
      } catch (pmErr) {
        console.error("Principal Message fallback error:", pmErr);
      }
    }

    const responseHome = {
      ...home,
      sections: enrichedSections,
    };

    cachedHome = responseHome;
    return res.status(200).json(responseHome);

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
    const incomingSections = req.body?.sections;

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
      req.authUser.role === "admin";

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
    existingHome.markModified("sections");

    await existingHome.save();
    clearServerPageCache();
    cachedHome = null;

    /* ------------------------------------------
       GET FRESH DATA
    ------------------------------------------ */

    const freshHome = await Page.findOne({
      slug: "home",
    }).lean();

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