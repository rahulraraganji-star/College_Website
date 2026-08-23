import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";

export const requireAuth = async (req, res, next) => {
  try {
    /* ==========================================
       GET TOKEN
    ========================================== */

    const token = req.cookies.cms_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }


    /* ==========================================
       VERIFY TOKEN
    ========================================== */

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    /* ==========================================
       LOAD USER
    ========================================== */

    const user = await User.findById(
      decoded.userId
    ).populate(
      "roleId",
      "name slug permissions allowedPages isSystemRole systemRole isActive"
    );


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }


    /* ==========================================
       ACCOUNT STATUS
    ========================================== */

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }


    /* ==========================================
       ATTACH AUTH CONTEXT
    ========================================== */

    req.user = decoded;

    req.authUser = user;

    req.authRole = user.roleId;


    next();

  } catch (error) {

    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication.",
    });
  }
};