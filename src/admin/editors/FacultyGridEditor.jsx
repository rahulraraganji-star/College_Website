import SectionCard from "../components/SectionCard";

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

  const updateDepartment = (
    departmentIndex,
    value
  ) => {

    const updated = [...section.departments];

    updated[departmentIndex].name = value;

    updateSection(updated);

  };

  const deleteDepartment = (
    departmentIndex
  ) => {

    updateSection(

      section.departments.filter(
        (_, index) =>
          index !== departmentIndex
      )

    );

  };

  /* ----------------------------------
      FACULTY MEMBER FUNCTIONS
  ---------------------------------- */

  const addMember = (departmentIndex) => {

    const updated = [...section.departments];

    updated[departmentIndex].members.push({

      id: crypto.randomUUID(),

      image: {
        id: "",
        url: "",
        alt: "",
      },

      name: "",

      designation: "",

      qualification: "",

      email: "",

      phone: "",

      profileLink: "",

    });

    updateSection(updated);

  };

  const updateMember = (
    departmentIndex,
    memberIndex,
    field,
    value
  ) => {

    const updated = [...section.departments];

    updated[departmentIndex]
      .members[memberIndex][field] = value;

    updateSection(updated);

  };

  const deleteMember = (
    departmentIndex,
    memberIndex
  ) => {

    const updated = [...section.departments];

    updated[departmentIndex]
      .members.splice(memberIndex, 1);

    updateSection(updated);

  };

  const duplicateMember = (
    departmentIndex,
    memberIndex
  ) => {

    const updated = [...section.departments];

    const member = structuredClone(

      updated[departmentIndex]
        .members[memberIndex]

    );

    member.id = crypto.randomUUID();

    updated[departmentIndex]
      .members.splice(
        memberIndex + 1,
        0,
        member
      );

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
          onChange={(e)=>
            updateTitle(
              e.target.value
            )
          }
          placeholder="Teaching Faculty"
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

      {/* DEPARTMENTS */}

      <div className="space-y-8">

        {(section.departments || []).map(

          (
            department,
            departmentIndex
          ) => (

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
                  onClick={() =>
                    deleteDepartment(
                      departmentIndex
                    )
                  }
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
                onChange={(e)=>
                  updateDepartment(
                    departmentIndex,
                    e.target.value
                  )
                }
                placeholder="Example: BCA"
                className="w-full border rounded-xl px-4 py-3"
              />

              {/* FACULTY MEMBERS WILL COME IN PART 2 */}

              <div className="mt-8">

  <div className="flex items-center justify-between mb-6">

    <h4 className="text-lg font-semibold">

      Faculty Members

    </h4>

    <button
      type="button"
      onClick={() =>
        addMember(departmentIndex)
      }
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

  {(department.members || []).map(

    (member, memberIndex) => (

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
                duplicateMember(
                  departmentIndex,
                  memberIndex
                )
              }
              className="border rounded-lg px-3 py-2 hover:bg-gray-100"
            >

              Duplicate

            </button>

            <button
              type="button"
              onClick={() =>
                deleteMember(
                  departmentIndex,
                  memberIndex
                )
              }
              className="bg-red-500 text-white rounded-lg px-3 py-2"
            >

              Delete

            </button>

          </div>

        </div>

        {/* MEDIA */}

        <div className="border-2 border-dashed rounded-2xl h-52 flex flex-col justify-center items-center text-center mb-8">

          <div className="text-5xl">

            👤

          </div>

          <p className="font-medium mt-4">

            Faculty Photo

          </p>

          <p className="text-sm text-gray-500 mt-2">

            Media Library integration coming soon

          </p>

          <div className="flex gap-3 mt-6">

            <button
              type="button"
              className="border rounded-lg px-4 py-2"
            >

              Choose from Media Library

            </button>

            <button
              type="button"
              className="border rounded-lg px-4 py-2"
            >

              Remove

            </button>

          </div>

        </div>

        {/* DETAILS */}

        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <label className="block mb-2 text-sm font-medium">

              Name

            </label>

            <input
              value={member.name}
              onChange={(e)=>
                updateMember(
                  departmentIndex,
                  memberIndex,
                  "name",
                  e.target.value
                )
              }
              className="w-full border rounded-xl px-4 py-3"
            />

          </div>

          <div>

            <label className="block mb-2 text-sm font-medium">

              Designation

            </label>

            <input
              value={member.designation}
              onChange={(e)=>
                updateMember(
                  departmentIndex,
                  memberIndex,
                  "designation",
                  e.target.value
                )
              }
              className="w-full border rounded-xl px-4 py-3"
            />

          </div>

          <div>

            <label className="block mb-2 text-sm font-medium">

              Qualification

            </label>

            <input
              value={member.qualification}
              onChange={(e)=>
                updateMember(
                  departmentIndex,
                  memberIndex,
                  "qualification",
                  e.target.value
                )
              }
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
              onChange={(e)=>
                updateMember(
                  departmentIndex,
                  memberIndex,
                  "email",
                  e.target.value
                )
              }
              className="w-full border rounded-xl px-4 py-3"
            />

          </div>

          <div>

            <label className="block mb-2 text-sm font-medium">

              Phone

            </label>

            <input
              value={member.phone}
              onChange={(e)=>
                updateMember(
                  departmentIndex,
                  memberIndex,
                  "phone",
                  e.target.value
                )
              }
              className="w-full border rounded-xl px-4 py-3"
            />

          </div>

          <div>

            <label className="block mb-2 text-sm font-medium">

              Profile URL

            </label>

            <input
              value={member.profileLink}
              onChange={(e)=>
                updateMember(
                  departmentIndex,
                  memberIndex,
                  "profileLink",
                  e.target.value
                )
              }
              className="w-full border rounded-xl px-4 py-3"
            />

          </div>

        </div>

      </div>

    )

  )}

</div>
            </div>

          )

        )}

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