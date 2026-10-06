import { useState } from "react";
import MediaPicker from "../media/components/MediaPicker";
import FacultyOverlay from "../../Components/sections/FacultyOverlay";
import { Eye, ChevronDown, ChevronUp, Sparkles, ArrowUp, ArrowDown } from "lucide-react";

const FacultyGridEditor = ({
  section,
  onChange,
}) => {
  const [previewMember, setPreviewMember] = useState(null);
  const [expandedOverlays, setExpandedOverlays] = useState({});

  const toggleOverlayDetails = (memberId) => {
    setExpandedOverlays((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  /* ----------------------------------
      UPDATE SECTION
  ---------------------------------- */

  const updateSection = (updatedDepartments) => {
    onChange({
      ...section,
      departments: updatedDepartments,
    });
  };

  /* ----------------------------------
      UPDATE TITLE
  ---------------------------------- */

  const updateTitle = (value) => {
    onChange({
      ...section,
      title: value,
    });
  };

  /* ----------------------------------
      DEPARTMENT FUNCTIONS
  ---------------------------------- */

  const addDepartment = () => {
    updateSection([
      ...(section.departments || []),
      {
        id: crypto.randomUUID(),
        name: "",
        members: [],
      },
    ]);
  };

  const updateDepartment = (departmentIndex, value) => {
    const updated = [...section.departments];
    updated[departmentIndex].name = value;
    updateSection(updated);
  };

  const deleteDepartment = (departmentIndex) => {
    updateSection(
      section.departments.filter((_, index) => index !== departmentIndex)
    );
  };

  /* ----------------------------------
      FACULTY MEMBER FUNCTIONS
  ---------------------------------- */

  const addMember = (departmentIndex) => {
    const updated = [...section.departments];
    const newId = crypto.randomUUID();

    updated[departmentIndex].members.push({
      id: newId,
      media: null,
      name: "",
      designation: "",
      qualification: "",
      specialization: "",
      experience: "",
      bio: "",
      email: "",
      phone: "",
      officeLocation: "",
      officeHours: "",
      linkedin: "",
      googleScholar: "",
      website: "",
      education: "",
      researchInterests: "",
      publications: "",
      coursesTaught: "",
      awards: "",
    });
    
    setExpandedOverlays((prev) => ({ ...prev, [newId]: true }));
    updateSection(updated);
  };

  const updateMember = (departmentIndex, memberIndex, field, value) => {
    const updated = [...section.departments];
    updated[departmentIndex].members[memberIndex][field] = value;
    updateSection(updated);
  };

  // Improvement 1: Helper for media updates
  const updateMemberMedia = (departmentIndex, memberIndex, media) => {
    const updated = [...section.departments];
    const member = updated[departmentIndex].members[memberIndex];
    member.media = media;
    updateSection(updated);
  };

  const deleteMember = (departmentIndex, memberIndex) => {
    const updated = [...section.departments];
    updated[departmentIndex].members.splice(memberIndex, 1);
    updateSection(updated);
  };

  const duplicateMember = (departmentIndex, memberIndex) => {
    const updated = [...section.departments];
    const member = structuredClone(
      updated[departmentIndex].members[memberIndex]
    );
    member.id = crypto.randomUUID();
    updated[departmentIndex].members.splice(memberIndex + 1, 0, member);
    updateSection(updated);
  };

  const moveMember = (departmentIndex, memberIndex, direction) => {
    const updated = [...section.departments];
    const department = updated[departmentIndex];
    if (!department || !Array.isArray(department.members)) return;

    const members = [...department.members];
    const targetIndex = direction === "up" ? memberIndex - 1 : memberIndex + 1;

    if (targetIndex < 0 || targetIndex >= members.length) return;

    const temp = members[memberIndex];
    members[memberIndex] = members[targetIndex];
    members[targetIndex] = temp;

    updated[departmentIndex] = {
      ...department,
      members,
    };
    updateSection(updated);
  };

  return (
    <>
      {/* SECTION TITLE */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Section Title
        </label>
        <input
          type="text"
          value={section.title || ""}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Teaching Faculty"
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      {/* DEPARTMENTS */}
      <div className="space-y-8">
        {(section.departments || []).map((department, departmentIndex) => (
          <div
            key={department.id}
            className="border rounded-2xl p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">
                Department {departmentIndex + 1}
              </h3>
              <button
                type="button"
                onClick={() => deleteDepartment(departmentIndex)}
                className="text-red-500"
              >
                Delete Department
              </button>
            </div>

            <label className="block text-sm font-medium mb-2">
              Department Name
            </label>
            <input
              type="text"
              value={department.name}
              onChange={(e) => updateDepartment(departmentIndex, e.target.value)}
              placeholder="Example: BCA"
              className="w-full border rounded-xl px-4 py-3"
            />

            {/* FACULTY MEMBERS */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold">Faculty Members</h4>
                <button
                  type="button"
                  onClick={() => addMember(departmentIndex)}
                  className="bg-black text-white px-4 py-2 rounded-xl"
                >
                  + Add Faculty
                </button>
              </div>

              {(department.members || []).length === 0 && (
                <div className="border-2 border-dashed rounded-2xl p-10 text-center text-gray-500">
                  No faculty members added yet.
                </div>
              )}

              {(department.members || []).map((member, memberIndex) => {
                const hasMemberOverlay = Boolean(
                  member?.officeLocation?.trim() ||
                  member?.officeHours?.trim() ||
                  member?.linkedin?.trim() ||
                  member?.googleScholar?.trim() ||
                  member?.website?.trim() ||
                  member?.education?.trim() ||
                  member?.researchInterests?.trim() ||
                  member?.publications?.trim() ||
                  member?.coursesTaught?.trim() ||
                  member?.awards?.trim()
                );

                return (
                  <div
                    key={member.id}
                    className="bg-white border rounded-2xl p-6 mt-6 shadow-sm"
                  >
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">
                            Faculty {memberIndex + 1}
                          </h4>
                          {hasMemberOverlay ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Overlay Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                              Hover Info Only
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {department.name || "Department"}
                        </p>
                      </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          moveMember(departmentIndex, memberIndex, "up")
                        }
                        disabled={memberIndex === 0}
                        title="Move up"
                        aria-label="Move faculty up"
                        className="border rounded-lg p-2 hover:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition flex items-center justify-center"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          moveMember(departmentIndex, memberIndex, "down")
                        }
                        disabled={
                          memberIndex ===
                          (department.members || []).length - 1
                        }
                        title="Move down"
                        aria-label="Move faculty down"
                        className="border rounded-lg p-2 hover:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition flex items-center justify-center"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewMember({
                            ...member,
                            department: department.name,
                          })
                        }
                        className="border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50 rounded-lg px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 shadow-xs"
                        title="Preview how this faculty member's big overlay looks"
                      >
                        <Eye size={14} />
                        Preview Overlay
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          duplicateMember(departmentIndex, memberIndex)
                        }
                        className="border rounded-lg px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deleteMember(departmentIndex, memberIndex)
                        }
                        className="bg-red-500 text-white rounded-lg px-3 py-2 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* MEDIA PICKER - Improvement 2 & 3 */}
                  <div className="border-2 border-dashed rounded-2xl p-6 mb-8">
                    <div className="mb-4">
                      <h5 className="font-medium">Faculty Photo</h5>
                    </div>

                    {/* Improvement 3: Preview if image exists */}
                    {member.media?.url && (
                      <div className="mb-4 flex justify-center">
                        <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                          <img
                            src={member.media.url}
                            alt={member.media.alt || "Faculty photo"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <MediaPicker
                      type="image"
                      multiple={false}
                      value={member.media}
                      onChange={(media) =>
                        updateMemberMedia(departmentIndex, memberIndex, media)
                      }
                    />

                    {member.media?.url && (
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            updateMemberMedia(departmentIndex, memberIndex, null)
                          }
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Remove Photo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DETAILS - Updated Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Name
                      </label>
                      <input
                        value={member.name}
                        onChange={(e) =>
                          updateMember(
                            departmentIndex,
                            memberIndex,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Dr. John Doe"
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Designation
                      </label>
                      <input
                        value={member.designation}
                        onChange={(e) =>
                          updateMember(
                            departmentIndex,
                            memberIndex,
                            "designation",
                            e.target.value
                          )
                        }
                        placeholder="Assistant Professor"
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Qualification
                      </label>
                      <input
                        value={member.qualification}
                        onChange={(e) =>
                          updateMember(
                            departmentIndex,
                            memberIndex,
                            "qualification",
                            e.target.value
                          )
                        }
                        placeholder="Ph.D., M.Tech"
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </div>

                    {/* 2.2 - Experience Field */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Experience
                      </label>
                      <input
                        value={member.experience}
                        onChange={(e) =>
                          updateMember(
                            departmentIndex,
                            memberIndex,
                            "experience",
                            e.target.value
                          )
                        }
                        placeholder="14 Years"
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </div>

                    {/* 2.3 - Specialization Field */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Specialization
                      </label>
                      <input
                        value={member.specialization}
                        onChange={(e) =>
                          updateMember(
                            departmentIndex,
                            memberIndex,
                            "specialization",
                            e.target.value
                          )
                        }
                        placeholder="Artificial Intelligence"
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) =>
                          updateMember(
                            departmentIndex,
                            memberIndex,
                            "email",
                            e.target.value
                          )
                        }
                        placeholder="john.doe@university.edu"
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Phone
                      </label>
                      <input
                        value={member.phone}
                        onChange={(e) =>
                          updateMember(
                            departmentIndex,
                            memberIndex,
                            "phone",
                            e.target.value
                          )
                        }
                        placeholder="+91 98765 43210"
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </div>

                    {/* Profile URL - REMOVED as requested */}
                  </div>

                  {/* 2.4 - Bio Field (Full Width) */}
                  <div className="mt-6">
                    <label className="block mb-2 text-sm font-medium">
                      Short Bio
                    </label>
                    <textarea
                      rows={3}
                      value={member.bio || ""}
                      onChange={(e) =>
                        updateMember(
                          departmentIndex,
                          memberIndex,
                          "bio",
                          e.target.value
                        )
                      }
                      placeholder="Write a short introduction about the faculty member..."
                      className="w-full border rounded-xl px-4 py-3 resize-none"
                    />
                  </div>

                  {/* 2.5 - EXTENDED OVERLAY / BIG POPUP PROFILE DETAILS */}
                  <div className="mt-6 border border-neutral-200 rounded-2xl bg-neutral-50/50 overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => toggleOverlayDetails(member.id)}
                      className="w-full px-5 py-3.5 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-between transition text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 shrink-0" />
                        <span className="font-semibold text-sm text-neutral-900">
                          Extended Overlay Profile (Big Popup Details)
                        </span>
                        <span className="text-[11px] text-neutral-600 bg-white border border-neutral-200 px-2.5 py-0.5 rounded-full font-medium shadow-2xs">
                          {hasMemberOverlay ? "Overlay Enabled on Click" : "Optional (Acts as normal card if blank)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 shrink-0">
                        <span>{expandedOverlays[member.id] ? "Hide Overlay Fields" : "Edit Overlay Details"}</span>
                        {expandedOverlays[member.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </button>

                    {expandedOverlays[member.id] && (
                      <div className="p-6 border-t border-neutral-200 space-y-6 bg-white/70">
                        <div className="flex items-start gap-2.5 text-xs text-neutral-600 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                          <Sparkles size={16} className="text-neutral-900 shrink-0 mt-0.5" />
                          <p className="m-0 leading-relaxed">
                            These comprehensive details are displayed in the full-screen academic dossier overlay when students or visitors click on this faculty member's card. Fill in whatever is applicable.
                          </p>
                        </div>

                        {/* Office & Hours */}
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                              Cabin / Office Location
                            </label>
                            <input
                              value={member.officeLocation || ""}
                              onChange={(e) =>
                                updateMember(
                                  departmentIndex,
                                  memberIndex,
                                  "officeLocation",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Science Block, Room 204 / Cabin B-12"
                              className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                              Office Hours / Consultation Time
                            </label>
                            <input
                              value={member.officeHours || ""}
                              onChange={(e) =>
                                updateMember(
                                  departmentIndex,
                                  memberIndex,
                                  "officeHours",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Mon & Wed: 2:00 PM – 4:00 PM"
                              className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                            />
                          </div>
                        </div>

                        {/* Social & Research Profiles */}
                        <div className="grid md:grid-cols-3 gap-5">
                          <div>
                            <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                              LinkedIn Profile URL
                            </label>
                            <input
                              type="url"
                              value={member.linkedin || ""}
                              onChange={(e) =>
                                updateMember(
                                  departmentIndex,
                                  memberIndex,
                                  "linkedin",
                                  e.target.value
                                )
                              }
                              placeholder="https://linkedin.com/in/username"
                              className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                              Google Scholar / Research Profile
                            </label>
                            <input
                              type="url"
                              value={member.googleScholar || ""}
                              onChange={(e) =>
                                updateMember(
                                  departmentIndex,
                                  memberIndex,
                                  "googleScholar",
                                  e.target.value
                                )
                              }
                              placeholder="https://scholar.google.com/citations?user=..."
                              className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                              Personal Website / Portfolio
                            </label>
                            <input
                              type="url"
                              value={member.website || ""}
                              onChange={(e) =>
                                updateMember(
                                  departmentIndex,
                                  memberIndex,
                                  "website",
                                  e.target.value
                                )
                              }
                              placeholder="https://faculty-portfolio.edu"
                              className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                            />
                          </div>
                        </div>

                        {/* Academic Education & Degrees (Multi-line) */}
                        <div>
                          <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                            Academic Qualifications & Education (One degree per line)
                          </label>
                          <textarea
                            rows={3}
                            value={member.education || ""}
                            onChange={(e) =>
                              updateMember(
                                departmentIndex,
                                memberIndex,
                                "education",
                                e.target.value
                              )
                            }
                            placeholder={"Ph.D. in Computer Science & Engineering - IIT Bombay (2018)\nM.Tech in Software Systems - BITS Pilani (2012)\nB.E. in Information Technology - Goa University (2009)"}
                            className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white resize-y focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                          />
                        </div>

                        {/* Research Interests & Areas */}
                        <div>
                          <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                            Research Interests & Areas of Expertise
                          </label>
                          <textarea
                            rows={2}
                            value={member.researchInterests || ""}
                            onChange={(e) =>
                              updateMember(
                                departmentIndex,
                                memberIndex,
                                "researchInterests",
                                e.target.value
                              )
                            }
                            placeholder="Machine Learning, Cloud Architecture, Distributed Systems, Ethical AI"
                            className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white resize-y focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                          />
                        </div>

                        {/* Key Publications */}
                        <div>
                          <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                            Key Publications & Research Papers (One paper per line)
                          </label>
                          <textarea
                            rows={3}
                            value={member.publications || ""}
                            onChange={(e) =>
                              updateMember(
                                departmentIndex,
                                memberIndex,
                                "publications",
                                e.target.value
                              )
                            }
                            placeholder={"Deep Learning Approaches in Medical Image Analysis, IEEE Transactions 2023\nScalable Data Pipelines for Educational Analytics, Springer LNCS 2021"}
                            className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white resize-y focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                          />
                        </div>

                        {/* Courses / Subjects Taught */}
                        <div>
                          <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                            Courses & Subjects Handled (Comma or new line separated)
                          </label>
                          <textarea
                            rows={2}
                            value={member.coursesTaught || ""}
                            onChange={(e) =>
                              updateMember(
                                departmentIndex,
                                memberIndex,
                                "coursesTaught",
                                e.target.value
                              )
                            }
                            placeholder="Data Structures & Algorithms, Web Engineering, Advanced DBMS, Python Programming"
                            className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white resize-y focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                          />
                        </div>

                        {/* Awards & Additional Responsibilities */}
                        <div>
                          <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                            Awards, Honors & Additional Responsibilities (One per line)
                          </label>
                          <textarea
                            rows={2}
                            value={member.awards || ""}
                            onChange={(e) =>
                              updateMember(
                                departmentIndex,
                                memberIndex,
                                "awards",
                                e.target.value
                              )
                            }
                            placeholder={"Best Teacher of the Year Award 2022\nHead of Institutional Innovation Council (IIC)\nNAAC Criterion 2 Faculty In-Charge"}
                            className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white resize-y focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                          />
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewMember({
                                ...member,
                                department: department.name,
                              })
                            }
                            className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Eye size={13} />
                            Preview This Member's Overlay
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ))}
      </div>

      {/* ADD DEPARTMENT */}
      <div className="mt-8">
        <button
          type="button"
          onClick={addDepartment}
          className="bg-black text-white px-5 py-3 rounded-xl cursor-pointer hover:bg-neutral-800 transition"
        >
          + Add Department
        </button>
      </div>

      {/* OVERLAY PREVIEW MODAL */}
      {previewMember && (
        <FacultyOverlay
          member={previewMember}
          isOpen={Boolean(previewMember)}
          onClose={() => setPreviewMember(null)}
        />
      )}
    </>
  );
};

export default FacultyGridEditor;