import SectionHeading from "./SectionHeading";
import { FileText, ArrowUpRight } from "lucide-react";

// Helper functions
const formatFileSize = (bytes) => {
  if (!bytes) return "";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
};

const getFileType = (mimeType = "") => {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("word")) return "DOCX";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "XLSX";
  if (mimeType.includes("presentation")) return "PPT";
  return "FILE";
};

const groupedDocuments = (documents) => {
  return documents.reduce((groups, doc) => {
    const category = doc.category || "Others";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(doc);

    return groups;
  }, {});
};

const DocumentsSection = ({ section }) => {
  const documents = section.documents || [];
  const grouped = groupedDocuments(documents);
  
  if (documents.length === 0) return null;

  return (
    <section className="pt-20 md:pt-24 border-t border-[#2A2623]/10">
      <SectionHeading eyebrow="Documents" title={section.title} />
      
      <div className="border-t border-b border-[#2A2623]/10">
        {Object.entries(grouped).map(([category, docs]) => (
          <div key={category}>
            {/* Category Heading */}
            <div className="px-2 pt-8 pb-3">
              <h3 className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.25em] text-[#8A6B3F]">
                {category}
              </h3>
            </div>

            <div className="divide-y divide-[#2A2623]/10">
              {docs.map((doc, i) => (
                <a
                  key={i}
                  href={doc.file?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-6 py-6 px-2 -mx-2 hover:bg-[#8A6B3F]/[0.04] transition-colors"
                >
                  <FileText
                    size={20}
                    className="shrink-0 text-[#8A6B3F]"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-['Inter'] font-medium text-[#2A2623]">
                      {doc.title}
                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-[11px] font-['IBM_Plex_Mono'] uppercase tracking-wide text-[#8A6B3F]/80">
                      <span>
                        {getFileType(doc.file?.mimeType)}
                      </span>
                      <span>•</span>
                      <span>
                        {formatFileSize(doc.file?.size)}
                      </span>
                    </div>

                    {doc.description && (
                      <p className="text-sm text-[#2A2623]/50 mt-2">
                        {doc.description}
                      </p>
                    )}
                  </div>

                  <span className="flex items-center gap-1.5 text-sm uppercase tracking-wide text-[#8A6B3F] group-hover:text-[#C9A555] whitespace-nowrap transition-colors">
                    Open
                    <ArrowUpRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DocumentsSection;