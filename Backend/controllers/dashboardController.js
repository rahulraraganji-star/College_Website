import mongoose from "mongoose";
import Page from "../models/page.js";
import Media from "../models/Media.js";
import NavigationMenu from "../models/NavigationMenu.js";
import NavigationItem from "../models/NavigationItem.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import AuditLog from "../models/AuditLog.js";
import FileMapping from "../models/FileMapping.js";
import { getAnalyticsMetrics } from "../services/analyticsService.js";

/**
 * Format bytes to readable string (e.g., 2.4 MB)
 */
const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds % 60}s`;
};

/**
 * GET /api/dashboard/stats
 * Aggregates all dashboard metrics in parallel
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalPages,
      publishedPages,
      draftPages,
      mediaStats,
      navMenusCount,
      navItemsCount,
      usersCount,
      activeUsersCount,
      rolesCount,
      pendingApprovals,
      totalApprovals,
      approvalsByType,
      totalAuditLogs,
      largestMedia,
      largestDoc,
      unmappedFilesCount,
      analyticsData,
    ] = await Promise.all([
      // Pages
      Page.countDocuments().catch(() => 0),
      Page.countDocuments({ isPublished: { $ne: false } }).catch(() => 0),
      Page.countDocuments({ isPublished: false }).catch(() => 0),

      // Media aggregation (groups by type with count & size)
      Media.aggregate([
        {
          $group: {
            _id: "$type",
            totalSize: { $sum: "$size" },
            count: { $sum: 1 },
          },
        },
      ]).catch(() => []),

      // Navigation
      NavigationMenu.countDocuments().catch(() => 0),
      NavigationItem.countDocuments().catch(() => 0),

      // Users & Roles
      User.countDocuments().catch(() => 0),
      User.countDocuments({ status: "active" }).catch(() => 0),
      Role.countDocuments({ isActive: { $ne: false } }).catch(() => 0),

      // Approvals
      ApprovalRequest.countDocuments({ status: "pending" }).catch(() => 0),
      ApprovalRequest.countDocuments().catch(() => 0),
      ApprovalRequest.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: "$resourceType", count: { $sum: 1 } } },
      ]).catch(() => []),

      // Audit logs
      AuditLog.countDocuments().catch(() => 0),

      // Largest files
      Media.findOne().sort({ size: -1 }).select("filename originalName size type").lean().catch(() => null),
      Media.findOne({ type: { $in: ["document", "pdf"] } }).sort({ size: -1 }).select("filename originalName size type").lean().catch(() => null),

      // Unmapped files
      FileMapping ? FileMapping.countDocuments({ targetUrl: { $in: [null, ""] } }).catch(() => 0) : 0,

      // Google Analytics metrics
      getAnalyticsMetrics("7d").catch(() => null),
    ]);

    // Calculate total media storage size and counts from mediaStats
    let totalSizeBytes = 0;
    let imagesSizeBytes = 0;
    let docsSizeBytes = 0;
    let othersSizeBytes = 0;
    let mediaCount = 0;
    let imageCount = 0;
    let docCount = 0;

    (mediaStats || []).forEach((item) => {
      const size = item.totalSize || 0;
      const count = item.count || 0;
      totalSizeBytes += size;
      mediaCount += count;
      if (item._id === "image") {
        imagesSizeBytes += size;
        imageCount += count;
      } else if (item._id === "document" || item._id === "pdf") {
        docsSizeBytes += size;
        docCount += count;
      } else {
        othersSizeBytes += size;
      }
    });

    const imagesPercentage = totalSizeBytes > 0 ? Math.round((imagesSizeBytes / totalSizeBytes) * 100) : 0;
    const docsPercentage = totalSizeBytes > 0 ? Math.round((docsSizeBytes / totalSizeBytes) * 100) : 0;
    const othersPercentage = totalSizeBytes > 0 ? Math.max(0, 100 - imagesPercentage - docsPercentage) : 0;

    // Convert allocated disk space estimate (default 10 GB limit display or dynamic)
    const usedGigabytes = +(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);
    const totalStorageGB = 10;

    // Approvals breakdown by resource type
    const approvalsBreakdown = {
      pages: 0,
      media: 0,
      navigation: 0,
      other: 0,
    };
    (approvalsByType || []).forEach((item) => {
      const key = (item._id || "").toLowerCase();
      if (key.includes("page")) approvalsBreakdown.pages += item.count;
      else if (key.includes("media") || key.includes("file")) approvalsBreakdown.media += item.count;
      else if (key.includes("nav") || key.includes("menu")) approvalsBreakdown.navigation += item.count;
      else approvalsBreakdown.other += item.count;
    });

    // Server health & metrics
    const dbConnected = mongoose.connection.readyState === 1;
    const memoryRssBytes = process.memoryUsage().rss;
    const memoryMb = +(memoryRssBytes / (1024 * 1024)).toFixed(1);
    const uptimeSec = Math.floor(process.uptime());

    // Calculate website health score (100 base)
    let healthScore = 100;
    if (!dbConnected) healthScore -= 50;
    if (draftPages > 0) healthScore -= Math.min(10, draftPages * 2);
    if (pendingApprovals > 0) healthScore -= Math.min(10, pendingApprovals * 2);
    if (unmappedFilesCount > 0) healthScore -= Math.min(10, unmappedFilesCount * 2);
    healthScore = Math.max(0, healthScore);

    return res.json({
      success: true,
      stats: {
        pages: {
          total: totalPages,
          published: publishedPages,
          draft: draftPages,
        },
        media: {
          total: mediaCount,
          images: imageCount,
          documents: docCount,
          other: Math.max(0, mediaCount - imageCount - docCount),
          totalSizeBytes,
          totalSizeFormatted: formatBytes(totalSizeBytes),
          storage: {
            usedGB: usedGigabytes,
            totalGB: totalStorageGB,
            usedFormatted: formatBytes(totalSizeBytes),
            imagesPercentage,
            docsPercentage,
            othersPercentage,
          },
        },
        navigation: {
          menus: navMenusCount,
          items: navItemsCount,
        },
        users: {
          total: usersCount,
          active: activeUsersCount,
        },
        roles: {
          total: rolesCount,
        },
        approvals: {
          total: totalApprovals,
          pending: pendingApprovals,
          byType: approvalsBreakdown,
        },
        auditLogs: {
          total: totalAuditLogs,
        },
        collections: [
          { name: "Pages", count: totalPages },
          { name: "Media", count: mediaCount },
          { name: "Navigation", count: navItemsCount || navMenusCount },
          { name: "Users", count: usersCount },
          { name: "Roles", count: rolesCount },
          { name: "Approvals", count: totalApprovals },
          { name: "Audit Logs", count: totalAuditLogs },
        ],
        server: {
          status: "Running",
          database: dbConnected ? "Connected" : "Disconnected",
          nodeVersion: process.version,
          expressVersion: "5.2",
          memoryMB: `${memoryMb} MB`,
          uptimeSeconds: uptimeSec,
          uptimeFormatted: formatUptime(uptimeSec),
          environment: process.env.NODE_ENV || "development",
        },
        health: {
          score: healthScore,
          dbConnected,
          backendOnline: true,
          storageHealthy: true,
          draftPagesCount: draftPages,
          pendingApprovalsCount: pendingApprovals,
          unmappedCount: unmappedFilesCount,
        },
        largestContent: {
          largestFile: largestMedia
            ? {
                name: largestMedia.originalName || largestMedia.filename,
                size: formatBytes(largestMedia.size),
                type: largestMedia.type,
              }
            : null,
          largestDoc: largestDoc
            ? {
                name: largestDoc.originalName || largestDoc.filename,
                size: formatBytes(largestDoc.size),
                type: largestDoc.type,
              }
            : null,
        },
        problems: {
          draftPages: draftPages,
          pendingApprovals: pendingApprovals,
          unmappedFiles: unmappedFilesCount,
        },
        analytics: analyticsData?.summary || {
          visitors: 412,
          bounceRate: "29%",
          mostViewed: "Admissions",
          avgVisit: "3m 24s",
          activityBars: [45, 65, 50, 80, 60, 70, 90],
          isConfigured: false,
        },
      },
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
      error: error.message,
    });
  }
};
