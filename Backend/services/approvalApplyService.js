import Page from "../models/page.js";
import NavigationItem from "../models/NavigationItem.js";
import OrganogramNode from "../models/OrganogramNode.js";
import { clearOrganogramCache } from "../controllers/organogram.controller.js";
import { clearServerPageCache } from "../controllers/pages.controller.js";


/* ==========================================
   REMOVE SYSTEM / IMMUTABLE FIELDS
========================================== */

const sanitizeData = (data = {}) => {
  const clean = { ...data };

  delete clean._id;
  delete clean.__v;
  delete clean.createdAt;
  delete clean.updatedAt;

  return clean;
};


/* ==========================================
   APPLY HOME CHANGE
========================================== */

const applyHomeChange = async (approval) => {

  const {
    resourceId,
    action,
    after,
  } = approval;


  /* ------------------------------------------
     ONLY UPDATE ACTION IS SUPPORTED
  ------------------------------------------ */

  if (action !== "update") {
    throw new Error(
      `Unsupported Home action: ${action}`
    );
  }


  /* ------------------------------------------
     RESOURCE ID REQUIRED
  ------------------------------------------ */

  if (!resourceId) {
    throw new Error(
      "Home resourceId is required for update."
    );
  }


  /* ------------------------------------------
     FIND HOME
  ------------------------------------------ */

  const home = await Page.findById(
    resourceId
  );

  if (!home) {
    throw new Error(
      "Home page was not found."
    );
  }


  /* ------------------------------------------
     VALIDATE PROPOSED DATA
  ------------------------------------------ */

  if (
    !after ||
    !after.sections ||
    typeof after.sections !== "object"
  ) {
    throw new Error(
      "Approved Home change does not contain valid sections."
    );
  }


  /* ------------------------------------------
     MERGE ONLY APPROVED SECTIONS
     
     Important: 
     - Preserve existing sections
     - Only apply approved changes
     - Do NOT replace the entire sections object
  ------------------------------------------ */

  const existingSections = home.sections?.toObject
    ? home.sections.toObject()
    : home.sections || {};

  const mergedSections = {
    ...existingSections,
    ...after.sections,
  };

  const updatedHome = await Page.findByIdAndUpdate(
    resourceId,
    {
      $set: { sections: mergedSections },
    },
    { new: true }
  ).lean();

  clearServerPageCache();

  return updatedHome;
};


/* ==========================================
   APPLY PAGE CHANGE
========================================== */

const applyPageChange = async (approval) => {

  const {
    resourceId,
    action,
    after,
  } = approval;


  /* ------------------------------------------
     CREATE PAGE
  ------------------------------------------ */

  if (action === "create") {

    const pageData =
      sanitizeData(after);

    const page =
      await Page.create(pageData);


    if (page.parentSlug) {

      const lastItem =
        await NavigationItem
          .find({
            menuKey: page.parentSlug,
          })
          .sort({
            order: -1,
          })
          .limit(1);

      const nextOrder =
        lastItem.length > 0
          ? lastItem[0].order + 1
          : 1;


      await NavigationItem.create({
        pageId: page._id,
        menuKey: page.parentSlug,
        label: page.title,
        slug:
          `/${page.parentSlug}/${page.slug}`,
        icon: "",
        order: nextOrder,
        isActive:
          page.isPublished !== false,
      });
    }

    clearServerPageCache();
    return page;
  }


  /* ------------------------------------------
     UPDATE PAGE
  ------------------------------------------ */

  if (action === "update") {

    if (!resourceId) {
      throw new Error(
        "Page resourceId is required for update."
      );
    }

    const pageData =
      sanitizeData(after);


    const updatedPage =
      await Page.findByIdAndUpdate(
        resourceId,
        {
          $set: pageData,
        },
        {
          new: true,
          runValidators: true,
        }
      );


    if (!updatedPage) {
      throw new Error(
        "Page to update was not found."
      );
    }


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

    clearServerPageCache();
    return updatedPage;
  }


  /* ------------------------------------------
     DELETE PAGE
  ------------------------------------------ */

  if (action === "delete") {

    if (!resourceId) {
      throw new Error(
        "Page resourceId is required for delete."
      );
    }


    const page =
      await Page.findById(resourceId);


    if (!page) {
      throw new Error(
        "Page to delete was not found."
      );
    }


    await NavigationItem.deleteMany({
      pageId: page._id,
    });


    await Page.findByIdAndDelete(
      resourceId
    );

    clearServerPageCache();
    return page;
  }


  throw new Error(
    `Unsupported page action: ${action}`
  );
};


/* ==========================================
   APPLY ORGANOGRAM CHANGE
========================================== */

const applyOrganogramChange = async (approval) => {
  const { resourceId, action, after } = approval;

  /* ------------------------------------------
     CREATE NODE
  ------------------------------------------ */
  if (action === "create") {
    const nodeData = sanitizeData(after);
    const node = await OrganogramNode.create(nodeData);
    clearOrganogramCache();
    return node;
  }

  /* ------------------------------------------
     UPDATE NODE
  ------------------------------------------ */
  if (action === "update") {
    if (!resourceId) {
      throw new Error("Organogram resourceId is required for update.");
    }
    const nodeData = sanitizeData(after);
    const updatedNode = await OrganogramNode.findByIdAndUpdate(
      resourceId,
      { $set: nodeData },
      { new: true, runValidators: true }
    );
    if (!updatedNode) {
      throw new Error("Organogram position to update was not found.");
    }
    clearOrganogramCache();
    return updatedNode;
  }

  /* ------------------------------------------
     DELETE NODE
  ------------------------------------------ */
  if (action === "delete") {
    if (!resourceId) {
      throw new Error("Organogram resourceId is required for delete.");
    }
    const node = await OrganogramNode.findById(resourceId);
    if (!node) {
      throw new Error("Organogram position to delete was not found.");
    }

    const reassignTo = after?.reassignTo || node.parent || null;
    await OrganogramNode.updateMany(
      { parent: resourceId },
      { $set: { parent: reassignTo } }
    );

    await OrganogramNode.findByIdAndDelete(resourceId);
    clearOrganogramCache();
    return node;
  }

  throw new Error(`Unsupported organogram action: ${action}`);
};


/* ==========================================
   APPLY APPROVED CHANGE
========================================== */

export const applyApprovedChange = async (
  approval
) => {

  if (!approval) {
    throw new Error(
      "Approval request is required."
    );
  }


  switch (approval.resourceType) {

    case "page":

      return await applyPageChange(
        approval
      );


    case "home":

      return await applyHomeChange(
        approval
      );


    case "organogram":

      return await applyOrganogramChange(
        approval
      );


    default:

      throw new Error(
        `Unsupported approval resource type: ${approval.resourceType}`
      );
  }
};