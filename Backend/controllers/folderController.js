import Folder from "../models/Folder.js";
import Media from "../models/Media.js";

/* ==========================================
    Create Folder
========================================== */

export const createFolder = async (
  req,
  res
) => {

  try {

    const {
      name,
      parent,
      description,
      color,
      icon,
    } = req.body;

    if (!name) {

      return res.status(400).json({

        success: false,

        message: "Folder name is required.",

      });

    }

    if (parent) {

      const parentFolder =
        await Folder.findById(parent);

      if (!parentFolder) {

        return res.status(400).json({

          success: false,

          message: "Parent folder not found.",

        });

      }

    }

    const existingFolder =
      await Folder.findOne({

        name,

        parent: parent || null,

      });

    if (existingFolder) {

      return res.status(400).json({

        success: false,

        message:
          "A folder with this name already exists.",

      });

    }

    const folder =
      await Folder.create({

        name,

        parent: parent || null,

        description:
          description || "",

        color:
          color || "#F59E0B",

        icon:
          icon || "folder",

      });

    res.status(201).json({

      success: true,

      message:
        "Folder created successfully.",

      folder,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to create folder.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};

/* ==========================================
    Get All Folders
========================================== */

export const getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.aggregate([
      {
        $lookup: {
          from: "media",
          localField: "_id",
          foreignField: "folder",
          as: "mediaItems",
        },
      },
      {
        $addFields: {
          itemCount: {
            $size: "$mediaItems",
          },
        },
      },
      {
        $project: {
          mediaItems: 0,
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ]);

    res.json({
      success: true,
      count: folders.length,
      folders,
    });
  } catch (error) {
    console.error("GET FOLDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch folders.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/* ==========================================
    Get Folder Tree
========================================== */

export const getFolderTree = async (
  req,
  res
) => {

  try {

    const folders =
      await Folder.find().lean();

    const map = {};

    folders.forEach((folder) => {

      map[folder._id] = {

        ...folder,

        children: [],

      };

    });

    const tree = [];

    folders.forEach((folder) => {

      const parentId =
        folder.parent?.toString();

      if (parentId) {

        map[parentId]?.children.push(
          map[folder._id]
        );

      } else {

        tree.push(map[folder._id]);

      }

    });

    res.json({

      success: true,

      tree,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to build folder tree.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};
/* ==========================================
    Rename Folder
========================================== */

export const updateFolder = async (
  req,
  res
) => {

  try {

    const folder =
      await Folder.findById(
        req.params.id
      );

    if (!folder) {

      return res.status(404).json({

        success: false,

        message: "Folder not found.",

      });

    }

    if (req.body.parent) {

      const parentFolder =
        await Folder.findById(
          req.body.parent
        );

      if (!parentFolder) {

        return res.status(400).json({

          success: false,

          message: "Parent folder not found.",

        });

      }

    }

    if (
      req.body.parent &&
      req.body.parent === folder._id.toString()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "A folder cannot be its own parent.",

      });

    }

    const newName =
      req.body.name ?? folder.name;

    const newParent =
      req.body.parent ?? folder.parent;

    if (
      req.body.name !== undefined ||
      req.body.parent !== undefined
    ) {

      const existingFolder =
        await Folder.findOne({

          name: newName,

          parent: newParent || null,

          _id: { $ne: folder._id },

        });

      if (existingFolder) {

        return res.status(400).json({

          success: false,

          message:
            "A folder with this name already exists.",

        });

      }

    }

    folder.name = newName;

    folder.parent = newParent;

    folder.description =
      req.body.description ??
      folder.description;

    folder.color =
      req.body.color ??
      folder.color;

    folder.icon =
      req.body.icon ??
      folder.icon;

    await folder.save();

    res.json({

      success: true,

      message:
        "Folder updated successfully.",

      folder,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to update folder.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};

/* ==========================================
    Delete Folder
========================================== */

export const deleteFolder = async (
  req,
  res
) => {

  try {

    const folder =
      await Folder.findById(
        req.params.id
      );

    if (!folder) {

      return res.status(404).json({

        success: false,

        message: "Folder not found.",

      });

    }

    const childFolders =
      await Folder.countDocuments({

        parent: folder._id,

      });

    if (childFolders > 0) {

      return res.status(400).json({

        success: false,

        message:
          "Delete child folders first.",

      });

    }

    const mediaCount =
      await Media.countDocuments({

        folder: folder._id,

      });

    if (mediaCount > 0) {

      return res.status(400).json({

        success: false,

        message:
          "Folder contains media files.",

      });

    }

    await folder.deleteOne();

    res.json({

      success: true,

      message:
        "Folder deleted successfully.",

      deletedId:
        req.params.id,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to delete folder.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};

/* ==========================================
    Get Media Inside Folder
========================================== */

export const getFolderMedia = async (
  req,
  res
) => {

  try {

    const folder =
      await Folder.findById(
        req.params.id
      );

    if (!folder) {

      return res.status(404).json({

        success: false,

        message:
          "Folder not found.",

      });

    }

    const media =
      await Media.find({

        folder: folder._id,

      })
        .populate(
          "folder",
          "name slug"
        )
        .sort({

          createdAt: -1,

        });

    res.json({

      success: true,

      count: media.length,

      media,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch folder media.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};

/* ==========================================
    Folder Statistics
========================================== */

export const getFolderStats = async (
  req,
  res
) => {

  try {

    const folders =
      await Folder.countDocuments();

    const media =
      await Media.countDocuments();

    const rootFolders =
      await Folder.countDocuments({

        parent: null,

      });

    res.json({

      success: true,

      stats: {

        folders,

        rootFolders,

        childFolders:
          folders - rootFolders,

        media,

      },

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch folder statistics.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};