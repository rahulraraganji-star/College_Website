import SectionCard from "../components/SectionCard";
import MediaPicker from "../media/components/MediaPicker";

const FacultyGridEditor = ({
  section,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {

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

    updated[departmentIndex].members.push({
      id: crypto.randomUUID(),
      media: null,
      name: "",
      designation: "",
      qualification: "",
      specialization: "",
      experience: "",
      bio: "",
      email: "",
      phone: "",
    });
    
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

  return (
    <SectionCard
      title="Faculty Grid"
      icon="👨‍🏫"
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >
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

              {(department.members || []).map((member, memberIndex) => (
                <div
                  key={member.id}
                  className="bg-white border rounded-2xl p-6 mt-6 shadow-sm"
                >
                  {/* HEADER */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-semibold text-lg">
                        Faculty {memberIndex + 1}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {department.name || "Department"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          duplicateMember(departmentIndex, memberIndex)
                        }
                        className="border rounded-lg px-3 py-2 hover:bg-gray-100"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deleteMember(departmentIndex, memberIndex)
                        }
                        className="bg-red-500 text-white rounded-lg px-3 py-2"
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
                      rows={4}
                      value={member.bio}
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ADD DEPARTMENT */}
      <div className="mt-8">
        <button
          type="button"
          onClick={addDepartment}
          className="bg-black text-white px-5 py-3 rounded-xl"
        >
          + Add Department
        </button>
      </div>
    </SectionCard>
  );
};

export default FacultyGridEditor;