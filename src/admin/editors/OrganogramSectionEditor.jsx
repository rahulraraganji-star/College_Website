import React, { useEffect, useState } from "react";
import { Network, ExternalLink, Info, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "/api";

const OrganogramSectionEditor = ({ section, onChange }) => {
  const [nodeCount, setNodeCount] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/organogram/admin/tree`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.nodes) {
          setNodeCount(data.nodes.length);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  return (
    <div className="space-y-5 p-5 bg-white rounded-xl border border-neutral-200">
      {/* Section Title & Subheading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Section Heading
          </label>
          <input
            type="text"
            placeholder="Institutional Organogram"
            value={section.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Section Subheading
          </label>
          <input
            type="text"
            placeholder="Hierarchical governance and operational reporting structure."
            value={section.subheading || ""}
            onChange={(e) => handleChange("subheading", e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Dynamic Data Notice & Direct Link */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Network size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">
              Dynamic Organizational Hierarchy
            </h4>
            <p className="text-xs text-neutral-600 mt-0.5 max-w-xl leading-relaxed">
              This section renders the live, interactive institutional organogram tree automatically. To add positions, reorder hierarchy levels, update leadership photos, or reassign reporting lines, use the dedicated Organogram management module.
            </p>
            {nodeCount !== null && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md bg-white border border-amber-200 text-xs font-semibold text-amber-800">
                <CheckCircle size={13} className="text-emerald-600" />
                <span>{nodeCount} Organizational Positions Currently Active</span>
              </div>
            )}
          </div>
        </div>

        <Link
          to="/admin/organogram"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <span>Manage Organogram Tree</span>
          <ExternalLink size={13} />
        </Link>
      </div>
    </div>
  );
};

export default OrganogramSectionEditor;
