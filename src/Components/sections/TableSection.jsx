import SectionHeading from "./SectionHeading";

const TableSection = ({ section }) => {
  const headers = section.headers || [];
  const rows = section.rows || [];
  if (rows.length === 0) return null;

  return (
    <section className="pt-20 md:pt-24 border-t border-[#2A2623]/10">
      <SectionHeading eyebrow="Reference" title={section.title} />
      <div className="overflow-x-auto border border-[#2A2623]/10">
        <table className="min-w-full border-collapse font-['Inter']">
          <thead className="bg-[#2A2623] text-[#F8F5F0]">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-6 py-4 text-left text-xs uppercase tracking-wide font-['IBM_Plex_Mono'] font-medium"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2623]/10">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[#8A6B3F]/[0.04] transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 text-[15px] text-[#2A2623]/75">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TableSection;
