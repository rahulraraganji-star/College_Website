import React from "react";

/**
 * ChangeDiff
 * Human-readable text-only before/after comparison component.
 * Recursively extracts only the granular fields and text that changed.
 * Zero raw JSON output.
 */

const FIELD_LABELS = {
  // Common & User fields
  name: "Name",
  email: "Email",
  role: "System Role",
  roleId: "Role",
  roleName: "Role Name",
  department: "Department",
  status: "Status",
  slug: "Slug",
  isActive: "Active",
  permissions: "Permissions",
  allowedPages: "Page Access",
  description: "Description",
  title: "Title",
  content: "Content",
  isPublished: "Published",
  parentSlug: "Section",
  template: "Template",

  // Organogram fields
  designation: "Designation / Title",
  parent: "Reports To (Parent Node)",
  photo: "Photo",
  order: "Display Order",
  level: "Hierarchy Level",
  phone: "Phone Number",
  bio: "Biography",

  // Course & Academics fields
  courseData: "Course Information",
  courses: "Courses",
  general: "General Info",
  overview: "Overview",
  curriculum: "Curriculum",
  highlights: "Highlights",
  careerOpportunities: "Career Opportunities",
  learningOutcomes: "Learning Outcomes",
  admissionProcess: "Admission Process",
  eligibility: "Eligibility Criteria",
  feeStructure: "Fee Structure",
  faqs: "FAQs",
  courseName: "Course Name",
  courseCode: "Course Code",
  level: "Degree Level",
  duration: "Duration",
  semesters: "Semesters",
  degree: "Degree Awarded",
  intake: "Annual Intake",
  shortDescription: "Short Summary",
  question: "Question",
  answer: "Answer",
  term: "Term / Semester",
  subjects: "Subjects",
  credits: "Credits",
  code: "Subject Code",
  icon: "Icon",
  kicker: "Kicker / Category Tag",

  // Home & Layout fields
  sections: "Sections",
  hero: "Hero Section",
  heroSection2: "Hero Section 2",
  eventsSection: "Events Section",
  eventsMarquee: "Events Marquee",
  coreStrengths: "Core Strengths",
  notices: "Notices",
  buttonText: "Button Text",
  caption: "Caption",
  image: "Image",
  slides: "Slides",
  heading: "Heading",
  subtitle: "Subtitle",
  subTitle: "Subtitle",
  desc: "Description",
  text: "Text",
  primaryButtonText: "Primary Button Text",
  secondaryButtonText: "Secondary Button Text",
  primaryButtonLink: "Primary Button Link",
  secondaryButtonLink: "Secondary Button Link",
  alignment: "Alignment",
  eventTitle: "Event Title",
  eventDescription: "Event Description",
  date: "Date",
  link: "Link",
  items: "Items",
};

// Keys to ignore from diffing (internal metadata)
const IGNORED_KEYS = new Set([
  "_id",
  "__v",
  "createdAt",
  "updatedAt",
  "tokenVersion",
  "passwordHash",
  "tempPassword",
  "id",
]);

/* ==========================================
   HELPERS
========================================== */

const getLabel = (key) => {
  if (/^\d+$/.test(key)) {
    return `Item ${parseInt(key, 10) + 1}`;
  }

  if (FIELD_LABELS[key]) {
    return FIELD_LABELS[key];
  }

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

const isMediaObject = (value) => {
  if (!value || typeof value !== "object") return false;
  return Boolean(value.filename || value.originalName || value.url || value.mimeType);
};

// Strips HTML tags for clean human reading
const stripHtml = (html) => {
  if (typeof html !== "string") return html;
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
};

/* ==========================================
   DEEP FLATTEN TO LEAF VALUES
========================================== */

const deepFlatten = (obj, prefix = "", result = {}) => {
  if (obj === null || obj === undefined) {
    return result;
  }

  // Primitive value
  if (typeof obj !== "object") {
    result[prefix] = obj;
    return result;
  }

  // Media object
  if (isMediaObject(obj)) {
    result[prefix] = obj.url || obj.originalName || obj.filename || "Media File";
    return result;
  }

  // Array of primitives (e.g. string tags, permissions)
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      result[prefix] = "";
      return result;
    }

    const allPrimitives = obj.every((item) => typeof item !== "object" || item === null);

    if (allPrimitives) {
      obj.forEach((item, index) => {
        deepFlatten(item, prefix ? `${prefix}.${index}` : `${index}`, result);
      });
      return result;
    }

    // Array of objects
    obj.forEach((item, index) => {
      deepFlatten(item, prefix ? `${prefix}.${index}` : `${index}`, result);
    });
    return result;
  }

  // Standard object
  Object.entries(obj).forEach(([key, value]) => {
    if (IGNORED_KEYS.has(key)) return;

    const path = prefix ? `${prefix}.${key}` : key;
    deepFlatten(value, path, result);
  });

  return result;
};

/* ==========================================
   PATH BREADCRUMB FORMATTER
========================================== */

const formatPathLabel = (path) => {
  const parts = path.split(".");

  if (parts.length === 1) {
    return <span className="font-semibold text-gray-900">{getLabel(parts[0])}</span>;
  }

  const category = parts.slice(0, -1).map(getLabel).join(" → ");
  const fieldName = getLabel(parts[parts.length - 1]);

  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
        {category}
      </p>
      <p className="text-xs font-semibold text-gray-900">{fieldName}</p>
    </div>
  );
};

/* ==========================================
   TEXT VALUE FORMATTER
========================================== */

const formatTextValue = (val) => {
  if (val === null || val === undefined || String(val).trim() === "") {
    return <em className="text-gray-400 font-normal italic">None / Empty</em>;
  }

  if (typeof val === "boolean") {
    return (
      <span className={val ? "text-emerald-700 font-semibold" : "text-gray-600 font-medium"}>
        {val ? "Yes / Enabled" : "No / Disabled"}
      </span>
    );
  }

  if (typeof val === "number") {
    return <span>{val}</span>;
  }

  const cleanText = stripHtml(String(val));

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed text-xs">
      {cleanText}
    </div>
  );
};

/* ==========================================
   CHANGE DIFF COMPONENT
========================================== */

const ChangeDiff = ({ before, after }) => {
  if (!before && !after) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-400 italic text-center">
        No change details recorded.
      </div>
    );
  }

  const flatBefore = deepFlatten(before || {});
  const flatAfter = deepFlatten(after || {});

  const allKeys = Array.from(
    new Set([...Object.keys(flatBefore), ...Object.keys(flatAfter)])
  );

  // Find strictly changed leaf properties (ignoring empty-to-empty matches)
  const changedKeys = allKeys.filter((key) => {
    const rawB = flatBefore[key];
    const rawA = flatAfter[key];

    const valB = rawB !== undefined && rawB !== null ? String(rawB).trim() : "";
    const valA = rawA !== undefined && rawA !== null ? String(rawA).trim() : "";

    // If both are empty, ignore
    if (!valB && !valA) return false;

    // If identical text, ignore
    if (valB === valA) return false;

    return true;
  });

  if (changedKeys.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-500 text-center">
        No textual modifications found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Modified Content ({changedKeys.length} field{changedKeys.length !== 1 ? "s" : ""})
          </p>
          <span className="text-[11px] text-gray-500">Only showing modified fields</span>
        </div>

        <div className="divide-y divide-gray-100">
          {changedKeys.map((key) => {
            return (
              <div key={key} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="mb-2.5">{formatPathLabel(key)}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* CURRENT (BEFORE) */}
                  <div className="rounded-lg border border-red-200 bg-red-50/70 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span className="font-bold uppercase tracking-wider text-[10px] text-red-700">
                        Current
                      </span>
                    </div>
                    <div className="text-red-900 line-through decoration-red-400">
                      {formatTextValue(flatBefore[key])}
                    </div>
                  </div>

                  {/* PROPOSED (AFTER) */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700">
                        Proposed
                      </span>
                    </div>
                    <div className="text-emerald-950 font-medium">
                      {formatTextValue(flatAfter[key])}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChangeDiff;