import React, { useEffect, useState, useMemo } from "react";
import {
  Network,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Award,
} from "lucide-react";
import SectionHeading from "./SectionHeading";
import { buildOrganogramTree, migrateDepartmentsToNodes } from "../../utils/organogramTree";

const API_URL = "/api";

const OrganogramSection = ({ section }) => {
  const [apiTree, setApiTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collapsedBranches, setCollapsedBranches] = useState({});

  // Determine tree data: section.tree -> section.nodes -> legacy section.departments -> API fallback
  const treeData = useMemo(() => {
    if (Array.isArray(section?.tree) && section.tree.length > 0) {
      return section.tree;
    }
    if (Array.isArray(section?.nodes) && section.nodes.length > 0) {
      return buildOrganogramTree(section.nodes);
    }
    if (Array.isArray(section?.departments) && section.departments.length > 0) {
      const migrated = migrateDepartmentsToNodes(section.departments);
      return buildOrganogramTree(migrated);
    }
    return apiTree;
  }, [section, apiTree]);

  useEffect(() => {
    // Only fetch if no local tree or nodes are provided in the section
    const hasLocalData =
      (Array.isArray(section?.tree) && section.tree.length > 0) ||
      (Array.isArray(section?.nodes) && section.nodes.length > 0) ||
      (Array.isArray(section?.departments) && section.departments.length > 0);

    if (hasLocalData) return;

    let isCurrent = true;
    setLoading(true);

    fetch(`${API_URL}/organogram`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isCurrent) return;
        if (data && data.success && Array.isArray(data.tree)) {
          setApiTree(data.tree);
        }
      })
      .catch((err) => {
        console.error("PUBLIC ORGANOGRAM FETCH ERROR:", err);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [section]);

  const toggleBranch = (nodeId) => {
    setCollapsedBranches((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  /* ==========================================
     RECURSIVE ORGANOGRAM NODE
  ========================================== */
  const OrganogramNodeCard = ({ node, level = 0 }) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isCollapsed = Boolean(collapsedBranches[node._id || node.id]);
    const photoUrl =
      node.photo?.url ||
      (typeof node.photo === "string" ? node.photo : null) ||
      node.media?.url ||
      (typeof node.media === "string" ? node.media : null);

    return (
      <div className="relative flex flex-col items-center">
        {/* Card Box */}
        <div
          className={`group relative z-10 w-[270px] sm:w-[300px] rounded-2xl bg-white border transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(201,165,85,0.15)] ${
            level === 0
              ? "border-[#C9A555] ring-2 ring-[#C9A555]/20"
              : level === 1
              ? "border-[#D9C496] hover:border-[#C9A555]"
              : "border-[#EAE3D6] hover:border-[#C9A555]/60"
          }`}
        >
          {/* Top Decorative Gold Bar */}
          <div
            className={`h-1.5 w-full rounded-t-2xl ${
              level === 0
                ? "bg-gradient-to-r from-[#A37B2C] via-[#C9A555] to-[#A37B2C]"
                : level === 1
                ? "bg-[#C9A555]"
                : "bg-[#DFD3BE]"
            }`}
          />

          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3.5">
              {/* Photo / Avatar */}
              <div className="relative shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={node.name}
                    className="h-13 w-13 sm:h-14 sm:w-14 rounded-2xl object-cover border border-[#E6DED3] shadow-inner"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-13 w-13 sm:h-14 sm:w-14 rounded-2xl bg-[#FAF6EE] border border-[#E8DFC8] flex items-center justify-center text-[#8A6B3F] font-['Fraunces'] font-bold text-base sm:text-lg">
                    {node.name
                      ? node.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "P"}
                  </div>
                )}

                {level === 0 && (
                  <div
                    title="Apex Governing Position"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-[#C9A555] text-white flex items-center justify-center shadow-sm"
                  >
                    <Award size={12} />
                  </div>
                )}
              </div>

              {/* Title & Role */}
              <div className="min-w-0 flex-1">
                <h4 className="font-['Fraunces'] font-semibold text-[#2A2623] text-[15px] sm:text-base leading-tight tracking-tight">
                  {node.name}
                </h4>
                <p className="text-[12.5px] sm:text-[13px] font-medium text-[#8A6B3F] leading-snug mt-1 font-['Inter']">
                  {node.designation}
                </p>
                {node.department && (
                  <span className="inline-block mt-2 text-[11px] px-2.5 py-0.5 rounded-full bg-[#F4EEE1] text-[#6A532E] font-semibold font-['Inter'] tracking-wide truncate max-w-full">
                    {node.department}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Details */}
            {(node.email || node.phone) && (
              <div className="mt-3.5 pt-3 border-t border-[#F2ECE1] flex flex-wrap items-center gap-3 text-xs text-[#5C5346] font-['Inter']">
                {node.email && (
                  <a
                    href={`mailto:${node.email}`}
                    className="flex items-center gap-1.5 hover:text-[#C9A555] transition-colors truncate max-w-full"
                    title={node.email}
                  >
                    <Mail size={12} className="text-[#8A6B3F] shrink-0" />
                    <span className="truncate">{node.email}</span>
                  </a>
                )}
                {node.phone && (
                  <a
                    href={`tel:${node.phone}`}
                    className="flex items-center gap-1.5 hover:text-[#C9A555] transition-colors"
                  >
                    <Phone size={12} className="text-[#8A6B3F] shrink-0" />
                    <span>{node.phone}</span>
                  </a>
                )}
              </div>
            )}

            {/* Brief Bio Overview */}
            {node.bio && (
              <p className="mt-2.5 text-xs text-[#6B6357] font-['Inter'] leading-relaxed line-clamp-2">
                {node.bio}
              </p>
            )}
          </div>

          {/* Child Subtree Expand/Collapse Badge */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleBranch(node._id || node.id)}
              aria-label={isCollapsed ? "Expand sub-branch" : "Collapse sub-branch"}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#D9CDB8] text-[11px] font-bold text-[#8A6B3F] shadow-sm hover:border-[#C9A555] hover:bg-[#FAF7F0] transition-all"
            >
              <span>{node.children.length} Reporting</span>
              {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {/* Tree Connectors & Sub-Branches */}
        {hasChildren && !isCollapsed && (
          <div className="relative pt-6 flex flex-col items-center w-full">
            {/* Vertical connector down from parent card */}
            <div className="w-0.5 h-6 bg-[#D4C4A8]" />

            <div className="flex flex-row items-start justify-center relative">
              {node.children.map((childNode, idx) => {
                const isOnly = node.children.length === 1;
                const isFirst = idx === 0;
                const isLast = idx === node.children.length - 1;

                return (
                  <div
                    key={childNode._id || childNode.id}
                    className="relative flex flex-col items-center px-3 sm:px-5"
                  >
                    {/* Horizontal crossbar connecting sibling branches */}
                    {!isOnly && (
                      <div
                        className={`absolute top-0 h-0.5 bg-[#D4C4A8] ${
                          isFirst
                            ? "left-1/2 right-0"
                            : isLast
                            ? "left-0 right-1/2"
                            : "left-0 right-0"
                        }`}
                      />
                    )}

                    {/* Vertical connector down to child card */}
                    <div className="w-0.5 h-6 bg-[#D4C4A8] relative z-0" />

                    {/* Child Recursive Node */}
                    <OrganogramNodeCard node={childNode} level={level + 1} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="my-10">
      {/* Section Title */}
      <SectionHeading
        title={section?.title || "Institutional Organogram"}
        subheading={
          section?.subheading ||
          "Hierarchical governance structure and reporting framework of the college."
        }
      />

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-[#C9A555] border-r-transparent mb-3" />
          <p className="text-sm font-['Inter'] text-[#6B6357]">
            Loading institutional structure...
          </p>
        </div>
      ) : treeData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DFD5C2] bg-white p-12 text-center">
          <Network size={36} className="mx-auto text-[#A89D8B] mb-2.5" />
          <p className="text-sm font-['Inter'] text-[#6B6357]">
            Organizational hierarchy information will be updated shortly.
          </p>
        </div>
      ) : (
        /* Organogram Tree Visualization Container */
        <div className="mt-8 overflow-x-auto pb-8 pt-4 px-2 [-webkit-overflow-scrolling:touch]">
          <div className="flex flex-col items-center gap-12 min-w-max mx-auto px-4">
            {treeData.map((rootNode) => (
              <OrganogramNodeCard
                key={rootNode._id || rootNode.id}
                node={rootNode}
                level={0}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default OrganogramSection;
