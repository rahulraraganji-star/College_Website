import Settings from "../models/Settings.js";
import { createAuditLog } from "../services/auditService.js";

/* ==========================================
   PUBLIC GET ENDPOINTS
========================================== */

// In-Memory Fast Cache for Header and Footer
let cachedHeader = null;
let cachedFooter = null;

export const clearSettingsCache = () => {
  cachedHeader = null;
  cachedFooter = null;
};

export const getHeader = async (req, res) => {
  try {
    if (cachedHeader) {
      return res.json(cachedHeader);
    }

    let header = await Settings.findOne({ type: "header" }).lean();
    if (!header) {
      header = {
        type: "header",
        logo: "",
        title: "Fr. Agnel College of Arts & Commerce",
        subtitle: "Pilar, Goa - 403 203",
        tagline: "Affiliated to Goa University | Accredited by NAAC",
      };
    }
    cachedHeader = header;
    res.json(header);
  } catch (error) {
    console.error("Error fetching header:", error);
    res.status(500).json({ message: "Error fetching header" });
  }
};

export const getFooter = async (req, res) => {
  try {
    if (cachedFooter) {
      return res.json(cachedFooter);
    }

    let footer = await Settings.findOne({ type: "footer" }).lean();
    if (!footer) {
      footer = {
        type: "footer",
        brand: "Fr. Agnel College",
        tagline: "Inspiring Excellence, Nurturing Values",
        description: "",
        addressLines: [],
        phone: "",
        email: "",
        quickLinks: [],
        supportLinks: [],
        socials: [],
        mapEmbedUrl: "",
      };
    }
    cachedFooter = footer;
    res.json(footer);
  } catch (error) {
    console.error("Error fetching footer:", error);
    res.status(500).json({ message: "Error fetching footer" });
  }
};

export const getAllSettings = async (req, res) => {
  try {
    const [header, footer] = await Promise.all([
      Settings.findOne({ type: "header" }).lean(),
      Settings.findOne({ type: "footer" }).lean(),
    ]);

    res.json({
      header: header || {
        type: "header",
        logo: "",
        title: "",
        subtitle: "",
        tagline: "",
      },
      footer: footer || {
        type: "footer",
        brand: "",
        tagline: "",
        description: "",
        addressLines: [],
        phone: "",
        email: "",
        quickLinks: [],
        supportLinks: [],
        socials: [],
        mapEmbedUrl: "",
      },
    });
  } catch (error) {
    console.error("Error fetching all settings:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
};

/* ==========================================
   ADMIN UPDATE ENDPOINTS
========================================== */

export const updateHeader = async (req, res) => {
  try {
    const { logo, title, subtitle, tagline } = req.body;

    if (title !== undefined && typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Title must be a string",
      });
    }

    const before = await Settings.findOne({ type: "header" });

    const updated = await Settings.findOneAndUpdate(
      { type: "header" },
      {
        $set: {
          type: "header",
          logo: typeof logo === "string" ? logo.trim() : (logo?.url || ""),
          title: typeof title === "string" ? title.trim() : "",
          subtitle: typeof subtitle === "string" ? subtitle.trim() : "",
          tagline: typeof tagline === "string" ? tagline.trim() : "",
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Audit log
    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "settings",
      resourceName: "Header Settings",
      action: before ? "update" : "create",
      before: before ? before.toObject() : null,
      after: updated.toObject(),
    });

    cachedHeader = updated ? (updated.toObject ? updated.toObject() : updated) : null;

    res.json({
      success: true,
      message: "Header settings updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating header:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update header settings",
      error: error.message,
    });
  }
};

export const updateFooter = async (req, res) => {
  try {
    const {
      brand,
      tagline,
      description,
      addressLines,
      phone,
      email,
      quickLinks,
      supportLinks,
      socials,
      mapEmbedUrl,
    } = req.body;

    // Validate quickLinks and supportLinks format
    const cleanLinks = (links) => {
      if (!Array.isArray(links)) return [];
      return links
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          name: String(item.name || "").trim(),
          url: String(item.url || "").trim(),
        }))
        .filter((item) => item.name || item.url);
    };

    // Validate socials format
    const cleanSocials = (items) => {
      if (!Array.isArray(items)) return [];
      return items
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          name: String(item.name || "").trim(),
          icon: String(item.icon || "").trim(),
          url: String(item.url || "").trim(),
        }))
        .filter((item) => item.name || item.url || item.icon);
    };

    // Validate address lines
    const cleanAddressLines = (lines) => {
      if (!Array.isArray(lines)) return [];
      return lines
        .map((line) => String(line || "").trim())
        .filter(Boolean);
    };

    const before = await Settings.findOne({ type: "footer" });

    const updated = await Settings.findOneAndUpdate(
      { type: "footer" },
      {
        $set: {
          type: "footer",
          brand: typeof brand === "string" ? brand.trim() : "",
          tagline: typeof tagline === "string" ? tagline.trim() : "",
          description: typeof description === "string" ? description.trim() : "",
          addressLines: cleanAddressLines(addressLines),
          phone: typeof phone === "string" ? phone.trim() : "",
          email: typeof email === "string" ? email.trim() : "",
          quickLinks: cleanLinks(quickLinks),
          supportLinks: cleanLinks(supportLinks),
          socials: cleanSocials(socials),
          mapEmbedUrl: typeof mapEmbedUrl === "string" ? mapEmbedUrl.trim() : "",
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Audit log
    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "settings",
      resourceName: "Footer Settings",
      action: before ? "update" : "create",
      before: before ? before.toObject() : null,
      after: updated.toObject(),
    });

    cachedFooter = updated ? (updated.toObject ? updated.toObject() : updated) : null;

    res.json({
      success: true,
      message: "Footer settings updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating footer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update footer settings",
      error: error.message,
    });
  }
};