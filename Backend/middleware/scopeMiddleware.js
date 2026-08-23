import User from "../models/User.js";
import Page from "../models/page.js";

/* ==========================================
   LOAD AUTHORIZATION CONTEXT
========================================== */

const loadAuthContext = async (req) => {
  if (!req.user?.userId) {
    return null;
  }

  // Reuse context loaded by requirePermission()
  if (req.authUser && req.authRole) {
    return {
      user: req.authUser,
      role: req.authRole,
    };
  }

  const user = await User.findById(
    req.user.userId
  ).populate(
    "roleId",
    "name slug permissions allowedPages isSystemRole systemRole isActive"
  );

  if (!user) {
    return null;
  }

  return {
    user,
    role: user.roleId,
  };
};


/* ==========================================
   REQUIRE PAGE ACCESS
========================================== */

export const requirePageAccess = (getPageScope) => {
  return async (req, res, next) => {
    try {

      /* ------------------------------------------
         AUTHENTICATION
      ------------------------------------------ */

      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }


      /* ------------------------------------------
         GET AUTH CONTEXT
      ------------------------------------------ */

      const context =
        await loadAuthContext(req);

      if (!context?.user) {
        return res.status(401).json({
          success: false,
          message: "User account not found.",
        });
      }

      const {
        user,
        role,
      } = context;


      /* ------------------------------------------
         ACCOUNT STATUS
      ------------------------------------------ */

      if (user.status !== "active") {
        return res.status(403).json({
          success: false,
          message:
            "Your account is not active.",
        });
      }


      /* ------------------------------------------
         ROLE CHECK
      ------------------------------------------ */

      if (!role) {
        return res.status(403).json({
          success: false,
          message:
            "No role has been assigned to this account.",
        });
      }

      if (!role.isActive) {
        return res.status(403).json({
          success: false,
          message:
            "The assigned role is inactive.",
        });
      }


      /* ------------------------------------------
         GET PAGE SCOPE
      ------------------------------------------ */

      const pageScope =
        typeof getPageScope === "function"
          ? await getPageScope(req)
          : getPageScope;


      if (!pageScope) {
        return res.status(500).json({
          success: false,
          message:
            "Page scope middleware is misconfigured.",
        });
      }


      /* ------------------------------------------
         WILDCARD ACCESS
      ------------------------------------------ */

      const allowedPages =
        Array.isArray(role.allowedPages)
          ? role.allowedPages
          : [];


      if (allowedPages.includes("*")) {

        req.authUser = user;
        req.authRole = role;
        req.pageScope = pageScope;

        return next();
      }


      /* ------------------------------------------
         CHECK PAGE SCOPE
      ------------------------------------------ */

      if (!allowedPages.includes(pageScope)) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this page.",
          requiredPageScope: pageScope,
        });
      }


      /* ------------------------------------------
         AUTHORIZATION CONTEXT
      ------------------------------------------ */

      req.authUser = user;
      req.authRole = role;
      req.pageScope = pageScope;

      next();

    } catch (error) {

      console.error(
        "PAGE ACCESS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Page authorization check failed.",
      });
    }
  };
};


/* ==========================================
   PAGE ACCESS FROM PAGE ID
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


    /* ------------------------------------------
       FIND PAGE
    ------------------------------------------ */

    const page = await Page.findById(
      req.params.id
    ).select(
      "_id parentSlug slug title"
    );


    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found.",
      });
    }


    /* ------------------------------------------
       SAVE PAGE FOR CONTROLLER
    ------------------------------------------ */

    req.targetPage = page;


    /* ------------------------------------------
       GET ROLE
    ------------------------------------------ */

    const role =
      req.authRole ||
      (
        await loadAuthContext(req)
      )?.role;


    if (!role) {
      return res.status(403).json({
        success: false,
        message:
          "No role has been assigned to this account.",
      });
    }


    /* ------------------------------------------
       CHECK ROLE STATUS
    ------------------------------------------ */

    if (!role.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "The assigned role is inactive.",
      });
    }


    /* ------------------------------------------
       WILDCARD
    ------------------------------------------ */

    const allowedPages =
      Array.isArray(role.allowedPages)
        ? role.allowedPages
        : [];


    if (allowedPages.includes("*")) {

      req.pageScope =
        page.parentSlug;

      return next();
    }


    /* ------------------------------------------
       PAGE SCOPE CHECK
    ------------------------------------------ */

    if (
      !allowedPages.includes(
        page.parentSlug
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this page.",
        requiredPageScope:
          page.parentSlug,
      });
    }


    /* ------------------------------------------
       SUCCESS
    ------------------------------------------ */

    req.pageScope =
      page.parentSlug;

    next();

  } catch (error) {

    console.error(
      "PAGE ID ACCESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Page authorization check failed.",
    });
  }
};


/* ==========================================
   PAGE ACCESS FOR CREATE
========================================== */

export const requirePageAccessFromBody = async (
  req,
  res,
  next
) => {

  try {

    const pageScope =
      req.body?.parentSlug;


    /* ------------------------------------------
       ROOT / NO PARENT
    ------------------------------------------ */

    if (!pageScope) {
      return res.status(403).json({
        success: false,
        message:
          "A page scope is required to create this page.",
      });
    }


    const role =
      req.authRole ||
      (
        await loadAuthContext(req)
      )?.role;


    if (!role) {
      return res.status(403).json({
        success: false,
        message:
          "No role has been assigned to this account.",
      });
    }


    /* ------------------------------------------
       ROLE STATUS
    ------------------------------------------ */

    if (!role.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "The assigned role is inactive.",
      });
    }


    /* ------------------------------------------
       WILDCARD
    ------------------------------------------ */

    const allowedPages =
      Array.isArray(role.allowedPages)
        ? role.allowedPages
        : [];


    if (allowedPages.includes("*")) {

      req.pageScope = pageScope;

      return next();
    }


    /* ------------------------------------------
       CHECK SCOPE
    ------------------------------------------ */

    if (
      !allowedPages.includes(pageScope)
    ) {
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
      message:
        "Page authorization check failed.",
    });
  }
};