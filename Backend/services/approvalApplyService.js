import Page from "../models/Page.js";
import NavigationItem from "../models/NavigationItem.js";


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


    /* ------------------------------------------
       CREATE NAVIGATION ITEM
    ------------------------------------------ */

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
        isActive: page.isPublished !== false,
      });
    }


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


    /* ------------------------------------------
       UPDATE NAVIGATION ITEM
    ------------------------------------------ */

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


    return page;
  }


  throw new Error(
    `Unsupported page action: ${action}`
  );
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


    default:

      throw new Error(
        `Unsupported approval resource type: ${approval.resourceType}`
      );
  }
};