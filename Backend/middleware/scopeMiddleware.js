import mongoose from "mongoose";
import Page from "../models/page.js";

/* ==========================================
   LOAD AUTHORIZATION CONTEXT
   
   Reuses req.authUser if already populated by
   requireAuth. Otherwise loads from DB.
========================================== */

const loadAuthContext = async (req) => {
  if (!req.user?.userId) {
    return null;
  }

  if (req.authUser) {
    return {
      user: req.authUser,
      role: req.authRole,
    };
  }

  // Fallback: load fresh (shouldn't normally happen
  // since requireAuth runs first)
  const { default: User } = await import("../models/User.js");

  const user = await User.findById(
    req.user.userId
  ).populate(
    "roleId",
    "name slug permissions allowedPages isSystemRole systemRole isActive"
  );

  if (!user) return null;

  return {
    user,
    role: user.roleId,
  };
};


/* ==========================================
   GET EFFECTIVE ALLOWED PAGES
   
   Reads from req.authUser.allowedPages which
   was computed by authMiddleware.
========================================== */

const getEffectiveAllowedPages = (req) => {
  return Array.isArray(req.authUser?.allowedPages)
    ? req.authUser.allowedPages
    : [];
};


/* ==========================================
   IS SUPER ADMIN
========================================== */

const isSuperAdmin = (req) =>
  req.authUser?.role === "super_admin" ||
  getEffectiveAllowedPages(req).includes("*");


/* ==========================================
   REQUIRE PAGE ACCESS — FROM PAGE ID (URL param)
   
   Used on routes like PUT /pages/:id
   Checks req.authUser.allowedPages for the page's
   parentSlug (section grouping).
========================================== */

export const requirePageAccessFromPage = async (
  req,
  res,
  next
) => {
  try {

    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Page ID is required.",
      });
    }


    const idOrSlug = req.params.id;
    let page = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      page = await Page.findById(idOrSlug).select(
        "_id parentSlug slug title"
      );
    }

    if (!page) {
      page = await Page.findOne({ slug: idOrSlug }).select(
        "_id parentSlug slug title"
      );
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found.",
      });
    }

    req.targetPage = page;


    /* ------------------------------------------
       SUPER ADMIN BYPASS
    ------------------------------------------ */

    if (!req.authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (isSuperAdmin(req)) {
      req.pageScope = page.parentSlug || page.slug;
      return next();
    }


    /* ------------------------------------------
       PAGE SCOPE CHECK
       
       The page's parentSlug is the section/module
       key (e.g. "nss", "library").
       
       If the page has no parentSlug, it IS the
       top-level page — check for its slug directly.
    ------------------------------------------ */

    const allowedPages = getEffectiveAllowedPages(req);
    const scopeToCheck = page.parentSlug || page.slug;
    const hasScope =
      (page.parentSlug && allowedPages.includes(page.parentSlug)) ||
      (page.slug && allowedPages.includes(page.slug));

    if (!hasScope) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this page.",
        requiredPageScope: scopeToCheck,
      });
    }

    req.pageScope = scopeToCheck;
    next();

  } catch (error) {

    console.error(
      "PAGE ID ACCESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Page authorization check failed.",
    });
  }
};


/* ==========================================
   REQUIRE PAGE ACCESS — FROM REQUEST BODY
   
   Used on POST /pages (create).
   Reads parentSlug from body.
========================================== */

export const requirePageAccessFromBody = async (
  req,
  res,
  next
) => {

  try {

    const pageScope = req.body?.parentSlug;


    /* ------------------------------------------
       AUTH & SUPER ADMIN BYPASS
    ------------------------------------------ */

    if (!req.authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (isSuperAdmin(req)) {
      req.pageScope = pageScope || req.body?.slug || "root";
      return next();
    }

    /* ------------------------------------------
       ROOT / NO PARENT (FOR NON-SUPERADMIN)
    ------------------------------------------ */

    if (!pageScope) {
      return res.status(403).json({
        success: false,
        message:
          "A page scope (parentSlug) is required to create this page.",
      });
    }


    /* ------------------------------------------
       CHECK SCOPE
    ------------------------------------------ */

    const allowedPages = getEffectiveAllowedPages(req);

    if (!allowedPages.includes(pageScope)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to create pages in this section.",
        requiredPageScope: pageScope,
      });
    }

    req.pageScope = pageScope;
    next();

  } catch (error) {

    console.error(
      "CREATE PAGE ACCESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Page authorization check failed.",
    });
  }
};


/* ==========================================
   REQUIRE HOME SECTION ACCESS
   
   Used on PUT /api/home.
   Reads which sections the user is allowed to
   update. Strips unauthorized sections from
   req.body.sections server-side.
========================================== */

export const filterHomeSections = async (
  req,
  res,
  next
) => {

  try {

    if (!req.authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }


    /* ------------------------------------------
       SUPER ADMIN — allow all sections
    ------------------------------------------ */

    if (isSuperAdmin(req)) {
      return next();
    }


    /* ------------------------------------------
       FILTER SECTIONS
       
       Home sections use allowedPages keys like:
         "home:hero"
         "home:notices"
         "home:eventsSection"
       etc.
       
       A user with "home:notices" in allowedPages
       can only update sections.notices.
       They cannot update sections.hero.
    ------------------------------------------ */

    const allowedPages = getEffectiveAllowedPages(req);

    // Extract which home sub-sections the user has access to
    // e.g. "home:notices" → "notices"
    const allowedSectionKeys = allowedPages
      .filter((p) => p.startsWith("home:"))
      .map((p) => p.replace("home:", ""));

    // If they have global "home" access (no colon), allow all
    if (allowedPages.includes("home")) {
      return next();
    }

    if (allowedSectionKeys.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to edit any Home page sections.",
      });
    }

    // Strip unauthorized sections from body before saving
    if (req.body?.sections) {
      const filteredSections = {};

      for (const key of allowedSectionKeys) {
        if (req.body.sections[key] !== undefined) {
          filteredSections[key] = req.body.sections[key];
        }
      }

      req.body.sections = filteredSections;
      req.allowedHomeSections = allowedSectionKeys;
    }

    next();

  } catch (error) {

    console.error(
      "HOME SECTION ACCESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Home section authorization check failed.",
    });
  }
};


/* ==========================================
   LEGACY EXPORT — kept for compatibility
   with any code that still imports it
========================================== */

export const requirePageAccess = (getPageScope) => {
  return async (req, res, next) => {
    try {

      if (!req.authUser) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      if (isSuperAdmin(req)) {
        return next();
      }

      const pageScope =
        typeof getPageScope === "function"
          ? await getPageScope(req)
          : getPageScope;

      if (!pageScope) {
        return res.status(500).json({
          success: false,
          message: "Page scope middleware is misconfigured.",
        });
      }

      const allowedPages = getEffectiveAllowedPages(req);

      if (!allowedPages.includes(pageScope)) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this page.",
          requiredPageScope: pageScope,
        });
      }

      req.pageScope = pageScope;
      next();

    } catch (error) {
      console.error("PAGE ACCESS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Page authorization check failed.",
      });
    }
  };
};