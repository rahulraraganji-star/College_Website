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
