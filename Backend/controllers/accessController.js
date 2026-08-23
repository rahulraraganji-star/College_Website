import {
  PERMISSION_GROUPS,
} from "../constants/permissions.js";

import {
  SCOPE_OPTIONS,
} from "../constants/scopes.js";


// ==========================================
// GET ACCESS DEFINITIONS
// ==========================================

export const getAccessDefinitions = async (
  req,
  res
) => {
  try {
    return res.status(200).json({
      success: true,

      permissions: PERMISSION_GROUPS,

      scopes: SCOPE_OPTIONS,
    });

  } catch (error) {
    console.error(
      "GET ACCESS DEFINITIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load access definitions.",
    });
  }
};