import Page from "../models/page.js";

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
    const pages = await Page.find().sort({ createdAt: -1 });

    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


export const getPagesByParent = async (
  req,
  res
) => {

  try {

    const pages = await Page.find({
      parentSlug: req.params.parentSlug,
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

export const createPage = async (
  req,
  res
) => {

  try {

    const page = new Page(req.body);

    await page.save();

    res.status(201).json(page);

  } catch (error) {

    // DUPLICATE SLUG
    if (error.code === 11000) {

      return res.status(400).json({
        message:
          "Slug already exists",
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
    const updatedPage = await Page.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedPage) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    res.json(updatedPage);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update page",
    });
  }
};

export const deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    res.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};