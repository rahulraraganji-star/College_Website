import SectionHeading from "./SectionHeading";

const TableSection = ({ section }) => {
  const headers = section.headers || [];
  const rows = section.rows || [];
  if (rows.length === 0) return null;

  return (
    <section className="pt-14 sm:pt-18 md:pt-20 border-t border-[#E6DED3]">
      <SectionHeading eyebrow="Tabular Data & Schedules" title={section.title || "Institutional Details"} />
      <div className="w-full overflow-x-auto rounded-2xl border border-[#E6DED3] bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[540px] border-collapse font-['Inter'] text-left">
          <thead>
            <tr className="bg-[#2A2623] text-[#F8F5F0]">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-5 py-4 text-left text-xs uppercase tracking-[0.14em] font-['IBM_Plex_Mono'] font-medium whitespace-nowrap border-b border-white/10"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DED3]/70">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-colors hover:bg-[#8A6B3F]/[0.05] ${
                  rowIndex % 2 === 1 ? "bg-[#FBF9F5]" : "bg-white"
                }`}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-5 py-4 text-[14px] sm:text-[15px] text-[#4A433B] leading-relaxed"
                  >
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

