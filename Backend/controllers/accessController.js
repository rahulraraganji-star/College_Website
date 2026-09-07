import Page from "../models/page.js";

import {
  PERMISSION_GROUPS,
} from "../constants/permissions.js";
import {
  canGrantPermission,
  canGrantScope,
} from "../utils/authorization.js";

// ==========================================
// HOME PAGE SECTION SCOPES
// ==========================================

const HOME_SECTION_SCOPES = [
  { key: "home:hero",          label: "Hero Banner" },
  { key: "home:eventsMarquee", label: "Events Marquee" },
  { key: "home:notices",       label: "Notices" },
  { key: "home:heroSection2",  label: "Learning Spaces" },
  { key: "home:eventsSection", label: "Events Section" },
  { key: "home:coreStrengths", label: "Core Strengths" },
];

// ==========================================
// FORMAT SLUG → READABLE LABEL
// ==========================================

const formatSlug = (slug) =>
  slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// ==========================================
// GET ACCESS DEFINITIONS
// ==========================================

export const getAccessDefinitions = async (req, res) => {
  try {
    const actorRole = req.authRole;
    const isSuper = req.authUser?.role === "super_admin" || actorRole?.systemRole === "super_admin";

    /* ------------------------------------------
       1. LOAD ALL PUBLISHED PAGES
    ------------------------------------------ */

    const allPages = await Page.find({
      isPublished: true,
    }).select("slug parentSlug title").lean();

    /* ------------------------------------------
       2. SEPARATE TOP-LEVEL AND CHILD PAGES
    ------------------------------------------ */

    const topLevelPages = allPages.filter(
      (p) => !p.parentSlug || p.parentSlug === ""
    );

    const childPages = allPages.filter(
      (p) => p.parentSlug && p.parentSlug !== ""
    );

    const childrenByParent = {};
    for (const child of childPages) {
      if (!childrenByParent[child.parentSlug]) {
        childrenByParent[child.parentSlug] = [];
      }
      childrenByParent[child.parentSlug].push(child);
    }

    /* ------------------------------------------
       3. BUILD GROUPS
    ------------------------------------------ */

    const homeGroup = {
      key: "home",
      label: "Home Page",
      type: "home",
      children: isSuper
        ? HOME_SECTION_SCOPES
        : HOME_SECTION_SCOPES.filter((s) => canGrantScope(actorRole, s.key)),
    };

    const pageGroups = topLevelPages
      .filter((p) => p.slug !== "home")
      .sort((a, b) => (a.slug > b.slug ? 1 : -1))
      .map((page) => {
        const children = (childrenByParent[page.slug] || [])
          .sort((a, b) => (a.slug > b.slug ? 1 : -1))
          .filter((child) => isSuper || canGrantScope(actorRole, child.slug))
          .map((child) => ({
            key: child.slug,
            label: child.title || formatSlug(child.slug),
          }));

        return {
          key: page.slug,
          label: page.title || formatSlug(page.slug),
          type: "page",
          children,
        };
      })
      .filter((g) => isSuper || canGrantScope(actorRole, g.key) || g.children.length > 0);

    const knownTopLevelSlugs = new Set([
      "home",
      ...topLevelPages.map((p) => p.slug),
    ]);

    const orphanParentSlugs = Object.keys(childrenByParent).filter(
      (ps) => !knownTopLevelSlugs.has(ps)
    );

    const orphanGroups = orphanParentSlugs
      .sort()
      .map((parentSlug) => ({
        key: parentSlug,
        label: formatSlug(parentSlug),
        type: "page",
        children: childrenByParent[parentSlug]
          .sort((a, b) => (a.slug > b.slug ? 1 : -1))
          .filter((child) => isSuper || canGrantScope(actorRole, child.slug))
          .map((child) => ({
            key: child.slug,
            label: child.title || formatSlug(child.slug),
          })),
      }))
      .filter((g) => isSuper || canGrantScope(actorRole, g.key) || g.children.length > 0);

    const groups = [homeGroup, ...pageGroups, ...orphanGroups].filter(
      (g) => g.children.length > 0 || isSuper || canGrantScope(actorRole, g.key)
    );

    /* ------------------------------------------
       4. FILTER PERMISSION GROUPS BY DELEGATION
    ------------------------------------------ */

    const filteredPermissionGroups = PERMISSION_GROUPS.map((group) => {
      const allowedPermissions = isSuper
        ? group.permissions
        : group.permissions.filter((p) => canGrantPermission(actorRole, p.key));

      return {
        ...group,
        permissions: allowedPermissions,
      };
    }).filter((group) => group.permissions.length > 0);

    /* ------------------------------------------
       5. FLAT SCOPES
    ------------------------------------------ */

    const flatScopes = [
      ...HOME_SECTION_SCOPES,
      ...topLevelPages
        .filter((p) => p.slug !== "home")
        .map((p) => ({ key: p.slug, label: p.title || formatSlug(p.slug) })),
      ...childPages.map((p) => ({
        key: p.slug,
        label: `${formatSlug(p.parentSlug)} > ${p.title || formatSlug(p.slug)}`,
      })),
    ].filter((s) => isSuper || canGrantScope(actorRole, s.key));

    return res.status(200).json({
      success: true,
      permissions: filteredPermissionGroups,
      scopes: flatScopes,
      groups,
    });

  } catch (error) {
    console.error(
      "GET ACCESS DEFINITIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load access definitions.",
    });
  }
};