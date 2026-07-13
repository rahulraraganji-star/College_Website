import SectionCard from "../components/SectionCard";

const TableEditor = ({
  section,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {

  const updateSection = (updates) => {
    onChange({
      ...section,
      ...updates,
    });
  };

  /* --------------------------
      HEADER FUNCTIONS
  -------------------------- */

  const addHeader = () => {

    updateSection({
      headers: [
        ...(section.headers || []),
        "",
      ],
    });

  };

  const updateHeader = (
    index,
    value
  ) => {

    const headers = [...section.headers];

    headers[index] = value;

    updateSection({
      headers,
    });

  };

  const deleteHeader = (
    index
  ) => {

    const headers = section.headers.filter(
      (_, i) => i !== index
    );

    const rows = section.rows.map((row) =>
      row.filter((_, i) => i !== index)
    );

    updateSection({
      headers,
      rows,
    });

  };

  /* --------------------------
      ROW FUNCTIONS
  -------------------------- */

  const addRow = () => {

    const row = Array(
      section.headers.length
    ).fill("");

    updateSection({
      rows: [
        ...(section.rows || []),
        row,
      ],
    });

  };

  const updateCell = (
    rowIndex,
    columnIndex,
    value
  ) => {

    const rows = [...section.rows];

    rows[rowIndex][columnIndex] = value;

    updateSection({
      rows,
    });

  };

  const deleteRow = (
    rowIndex
  ) => {

    updateSection({
      rows: section.rows.filter(
        (_, i) => i !== rowIndex
      ),
    });

  };

  return (

    <SectionCard
      title="Table"
      icon="📊"
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >

      {/* SECTION TITLE */}

      <div className="mb-8">

        <label className="block mb-2 text-sm font-medium">

          Table Title

        </label>

        <input
          value={section.title || ""}
          onChange={(e)=>
            updateSection({
              title: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

      {/* HEADERS */}

      <div className="mb-8">

        <div className="flex justify-between items-center mb-4">

          <h3 className="font-semibold">

            Columns

          </h3>

          <button
            type="button"
            onClick={addHeader}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >

            + Add Column

          </button>

        </div>

        {(section.headers || []).map(
          (header, index) => (

            <div
              key={index}
              className="flex gap-3 mb-3"
            >

              <input
                value={header}
                onChange={(e)=>
                  updateHeader(
                    index,
                    e.target.value
                  )
                }
                placeholder={`Column ${index + 1}`}
                className="flex-1 border rounded-xl px-4 py-3"
              />

              <button
                type="button"
                onClick={() =>
                  deleteHeader(index)
                }
                className="bg-red-500 text-white px-4 rounded-xl"
              >

                Delete

              </button>

            </div>

          )
        )}

      </div>

            {/* TABLE */}

      <div className="mb-8">

        <div className="flex justify-between items-center mb-4">

          <h3 className="font-semibold">

            Table Data

          </h3>

          <button
            type="button"
            onClick={addRow}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >

            + Add Row

          </button>

        </div>

        {section.headers?.length === 0 ? (

          <div className="border-2 border-dashed rounded-2xl p-10 text-center text-gray-500">

            Add at least one column before adding rows.

          </div>

        ) : (

          <div className="overflow-x-auto border rounded-2xl">

            <table className="min-w-full border-collapse">

              <thead className="bg-gray-100">

                <tr>

                  {section.headers.map((header, index) => (

                    <th
                      key={index}
                      className="border px-4 py-3 text-left font-semibold whitespace-nowrap"
                    >

                      {header || `Column ${index + 1}`}

                    </th>

                  ))}

                  <th className="border px-4 py-3 w-32">

                    Actions

                  </th>

                </tr>

              </thead>

              <tbody>

                {(section.rows || []).length === 0 ? (

                  <tr>

                    <td
                      colSpan={
                        section.headers.length + 1
                      }
                      className="text-center py-10 text-gray-500"
                    >

                      No rows added yet.

                    </td>

                  </tr>

                ) : (

                  section.rows.map(

                    (row, rowIndex) => (

                      <tr key={rowIndex}>

                        {section.headers.map(

                          (_, columnIndex) => (

                            <td
                              key={columnIndex}
                              className="border p-2"
                            >

                              <input
                                type="text"
                                value={
                                  row[columnIndex] || ""
                                }
                                onChange={(e)=>
                                  updateCell(
                                    rowIndex,
                                    columnIndex,
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-lg border px-3 py-2"
                              />

                            </td>

                          )

                        )}

                        <td className="border p-2">

                          <button
                            type="button"
                            onClick={() =>
                              deleteRow(rowIndex)
                            }
                            className="w-full bg-red-500 text-white rounded-lg py-2"
                          >

                            Delete

                          </button>

                        </td>

                      </tr>

                    )

                  )

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </SectionCard>

  );

};

export default TableEditor;