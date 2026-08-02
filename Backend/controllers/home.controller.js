import Page from "../models/page.js";

export const getHome = async (req, res) => {
  try {
    const home = await Page.findOne({ slug: "home" }).lean();

    

    return res.status(200).json(home);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const updateHome = async (req, res) => {
  console.log("BODY");
  console.log(req.body.sections);

  const home = await Page.findOneAndUpdate(
    { slug: "home" },
    {
      sections: req.body.sections,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  console.log("AFTER UPDATE");
  console.log(JSON.stringify(home, null, 2));

  const fresh = await Page.findOne({ slug: "home" }).lean();

  console.log("FROM DATABASE");
  console.log(JSON.stringify(fresh, null, 2));

  res.json(home);
};


