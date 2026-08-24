import Page from "../models/page.js";

import {
  PERMISSION_GROUPS,
} from "../constants/permissions.js";


// ==========================================
// HOME PAGE SECTION SCOPES
// These map 1:1 to the sections inside
// HomePageEditor. They are always available.
// ==========================================

const HOME_SECTION_SCOPES = [
  { key: "home:hero",           label: "Hero Banner" },
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
//
// Returns scopes structured as groups so
// the frontend can render an expandable tree:
//
// {
//   groups: [
//     {
//       key: "home",
//       label: "Home Page",
//       type: "home",
//       children: [
//         { key: "home:hero", label: "Hero Banner" },
//         ...
//       ]
//     },
//     {
//       key: "about-us",
//       label: "About Us",
//       type: "page",
//       children: [
//         { key: "about-us/history", label: "History" },
//         ...
//       ]
//     },
//     ...
//   ]
// }
// ==========================================

export const getAccessDefinitions = async (
  req,
  res
) => {
  try {

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

    // Build a map: parentSlug → child pages
    const childrenByParent = {};
    for (const child of childPages) {
      if (!childrenByParent[child.parentSlug]) {
        childrenByParent[child.parentSlug] = [];
      }
      childrenByParent[child.parentSlug].push(child);
    }


    /* ------------------------------------------
       3. BUILD GROUPS

       Order:
         a) Home Page (always first, special)
         b) Top-level pages (excluding "home")
         c) Any orphan parentSlugs in DB that
            don't have a matching top-level page
    ------------------------------------------ */

    // a) Home group
    const homeGroup = {
      key: "home",
      label: "Home Page",
      type: "home",
      children: HOME_SECTION_SCOPES,
    };

    // b) Top-level DB pages (excluding "home")
    const pageGroups = topLevelPages
      .filter((p) => p.slug !== "home")
      .sort((a, b) => (a.slug > b.slug ? 1 : -1))
      .map((page) => {
        const children = (childrenByParent[page.slug] || [])
          .sort((a, b) => (a.slug > b.slug ? 1 : -1))
          .map((child) => ({
            key: child.slug,
            label: child.title || formatSlug(child.slug),
          }));

        return {
          key: page.slug,
          label: page.title || formatSlug(page.slug),
          type: "page",
          // Also allow selecting the whole top-level page
          children,
        };
      });

    // c) Orphan parent slugs (pages whose parent page doesn't exist as a published top-level page)
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
          .map((child) => ({
            key: child.slug,
            label: child.title || formatSlug(child.slug),
          })),
      }));

    const groups = [homeGroup, ...pageGroups, ...orphanGroups];


    /* ------------------------------------------
       4. ALSO RETURN FLAT SCOPES
       (kept for backward compatibility with any
        code that still reads scopes[].key)
    ------------------------------------------ */

    const scopes = [
      ...HOME_SECTION_SCOPES,
      ...topLevelPages
        .filter((p) => p.slug !== "home")
        .map((p) => ({ key: p.slug, label: p.title || formatSlug(p.slug) })),
      ...childPages.map((p) => ({
        key: p.slug,
        label: `${formatSlug(p.parentSlug)} > ${p.title || formatSlug(p.slug)}`,
      })),
    ];


    return res.status(200).json({
      success: true,
      permissions: PERMISSION_GROUPS,
      scopes,
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