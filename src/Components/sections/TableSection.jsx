import SectionHeading from "./SectionHeading";

const TableSection = ({ section }) => {
  const headers = section.headers || [];
  const rows = section.rows || [];
  if (rows.length === 0) return null;

  return (
    <section className="pt-16 sm:pt-20 md:pt-24 border-t border-[#2A2623]/10">
      <SectionHeading eyebrow="Reference" title={section.title} />
      <div className="w-full overflow-x-auto rounded-lg border border-[#2A2623]/10 shadow-sm [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[500px] border-collapse font-['Inter']">
          <thead className="bg-[#2A2623] text-[#F8F5F0]">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 sm:px-6 sm:py-4 text-left text-[11px] sm:text-xs uppercase tracking-wide font-['IBM_Plex_Mono'] font-medium whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2623]/10 bg-white/40">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[#8A6B3F]/[0.04] transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 sm:px-6 sm:py-4 text-[13px] sm:text-[15px] text-[#2A2623]/80 leading-relaxed">
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
