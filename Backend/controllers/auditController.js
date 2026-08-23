import AuditLog from "../models/AuditLog.js";


/* ==========================================
   GET AUDIT LOGS (paginated + filtered)
========================================== */

export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 30,
      actor = "",
      action = "",
      resourceType = "",
      dateFrom = "",
      dateTo = "",
    } = req.query;


    /* ------------------------------------------
       BUILD FILTER
    ------------------------------------------ */

    const filter = {};

    if (resourceType.trim()) {
      filter.resourceType = resourceType.trim();
    }

    if (action.trim()) {
      filter.action = { $regex: action.trim(), $options: "i" };
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};

      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }

      if (dateTo) {
        // Include the full dateTo day
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }


    /* ------------------------------------------
       PAGINATION
    ------------------------------------------ */

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;


    /* ------------------------------------------
       QUERY — populate actor name/email
    ------------------------------------------ */

    const query = AuditLog.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);


    const [logs, total] = await Promise.all([
      query,
      AuditLog.countDocuments(filter),
    ]);


    /* ------------------------------------------
       ACTOR NAME FILTER (post-populate)
       Mongoose can't efficiently filter by
       populated subdoc fields. If actor search
       is requested, filter in memory on the
       small result set.
    ------------------------------------------ */

    const filteredLogs = actor.trim()
      ? logs.filter((log) => {
          const name =
            log.actor?.name?.toLowerCase() || "";
          const email =
            log.actor?.email?.toLowerCase() || "";
          const search = actor.trim().toLowerCase();

          return name.includes(search) || email.includes(search);
        })
      : logs;


    return res.status(200).json({
      success: true,
      logs: filteredLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });

  } catch (error) {
    console.error("GET AUDIT LOGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs.",
    });
  }
};
