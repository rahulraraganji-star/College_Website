import * as Icons from "lucide-react";

const STATUS_STYLES = {
  NEW: "bg-[#EEF5E9] text-[#58734F] border-[#D2E3C9]",
  URGENT: "bg-[#FCECE7] text-[#B45D43] border-[#EBC9BD]",
  "CLOSING SOON": "bg-[#FBF3DC] text-[#9A7625] border-[#E8D39A]",
  OPEN: "bg-[#EEF5E9] text-[#58734F] border-[#D2E3C9]",
  RESULT: "bg-[#F3F0E8] text-[#81765E] border-[#E1DCCF]",
  SHORTLIST: "bg-[#FBF3DC] text-[#9A7625] border-[#E8D39A]",
  REFERENCE: "bg-[#F3F0E8] text-[#81765E] border-[#E1DCCF]",
  EXTENDED: "bg-[#FBF3DC] text-[#9A7625] border-[#E8D39A]",
};

const getStatusClass = (status) =>
  STATUS_STYLES[status] ||
  "bg-[#F3F0E8] text-[#81765E] border-[#E1DCCF]";

const getFileUrl = (file) => {
  if (!file) return "";

  if (typeof file === "string") return file;

  return (
    file.url ||
    file.fileUrl ||
    file.src ||
    file.path ||
    file.location ||
    ""
  );
};

const getFileName = (file) => {
  if (!file) return "Document";

  if (typeof file === "string") {
    return file.split("/").pop() || "Document";
  }

  return (
    file.originalName ||
    file.filename ||
    file.name ||
    file.fileName ||
    "Document"
  );
};

const getFileSize = (file) => {
  if (!file || typeof file === "string") return "";

  if (!file.size) return "";

  const size = Number(file.size);

  if (Number.isNaN(size)) return "";

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileType = (file) => {
  if (!file || typeof file === "string") {
    return "DOCUMENT";
  }

  const mime = file.mimeType || file.type || "";

  if (mime.includes("pdf")) {
    return "PDF";
  }

  if (mime.includes("word")) {
    return "DOC";
  }

  if (mime.includes("image")) {
    return "IMAGE";
  }

  return "DOCUMENT";
};

const NoticeFile = ({ file }) => {
  const fileUrl = getFileUrl(file);

  if (!fileUrl) return null;

  const fileName = getFileName(file);
  const fileSize = getFileSize(file);
  const fileType = getFileType(file);

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="
        mt-4
        flex
        w-fit
        max-w-full
        items-center
        gap-3
        rounded-xl
        border
        border-[#E8DFD0]
        bg-[#F7F2E9]
        px-3
        py-2.5
        transition-all
        duration-300
        hover:border-[#D4A13D]
        hover:bg-[#F3ECDF]
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[#B94D36]
          text-white
        "
      >
        <Icons.FileText size={18} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-[#292622]">
          {fileName}
        </p>

        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#8A8174]">
          {fileType}
          {fileSize ? ` · ${fileSize}` : ""}
        </p>
      </div>

      <span
        className="
          ml-2
          shrink-0
          text-[10px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#927033]
        "
      >
        VIEW →
      </span>
    </a>
  );
};

const NoticeItem = ({ notice }) => {
  const {
    title,
    description,
    status,
    file,
    linkText,
    linkUrl,
  } = notice || {};

  return (
    <article className="border-t border-[#E5DED2] py-6 first:border-t-0">
      {/* STATUS */}
      {status && status !== "NONE" && (
        <span
          className={`
            inline-flex
            items-center
            rounded-full
            border
            px-2.5
            py-1
            text-[9px]
            font-medium
            uppercase
            tracking-[0.12em]
            ${getStatusClass(status)}
          `}
        >
          {status}
        </span>
      )}

      {/* TITLE */}
      <h3
        className="
          mt-3
          font-serif
          text-[18px]
          leading-[1.35]
          text-[#292622]
          sm:text-[19px]
        "
      >
        {title}
      </h3>

      {/* DESCRIPTION */}
      {description && (
        <p
          className="
            mt-2
            max-w-[95%]
            text-[13px]
            leading-5
            text-[#7A746B]
          "
        >
          {description}
        </p>
      )}

      {/* PDF / DOCUMENT */}
      {file && <NoticeFile file={file} />}

      {/* WEB LINK */}
      {linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-3
            inline-block
            text-[13px]
            font-medium
            text-[#A57B2E]
            underline
            decoration-[#D8B96E]
            decoration-1
            underline-offset-4
            transition-colors
            hover:text-[#76571E]
          "
        >
          {linkText || "Click here for details"} →
        </a>
      )}
    </article>
  );
};

// Updated NoticeColumn to use dynamic icons from lucide-react
const NoticeColumn = ({ card, notices }) => {
  // Get the icon component dynamically from lucide-react
  const Icon = Icons[card?.icon] || Icons.CircleHelp;

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[18px]
        border
        border-[#E5DED2]
        bg-[#FCFBF8]
        shadow-[0_12px_40px_rgba(50,40,20,0.04)]
      "
    >
      {/* FOLDED CORNER */}
      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-[38px]
          w-[38px]
          border-b
          border-l
          border-[#E9E2D7]
          bg-[#F8F5EF]
          [clip-path:polygon(0_0,100%_100%,0_100%)]
        "
      />

      {/* HEADER */}
      <div className="px-7 pb-5 pt-7 sm:px-8">
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-[#E9D9B4]
              bg-[#FBF7ED]
              text-[#A77B2B]
            "
          >
            <Icon size={17} strokeWidth={1.5} />
          </div>

          <div className="min-w-0">
            {/* Dynamic card title from MongoDB */}
            <h2
              className="
                max-w-[220px]
                font-serif
                text-[20px]
                leading-[1.2]
                text-[#292622]
                sm:text-[21px]
              "
            >
              {card?.title}
            </h2>

            {/* Dynamic VIEW ALL link */}
            {card?.viewAllUrl ? (
              <a
                href={card.viewAllUrl}
                className="
                  mt-1.5
                  inline-block
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.16em]
                  text-[#847B6D]
                  transition-colors
                  hover:text-[#A47A2D]
                "
              >
                {card?.viewAllText || "VIEW ALL"} →
              </a>
            ) : (
              <span
                className="
                  mt-1.5
                  inline-block
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.16em]
                  text-[#847B6D]
                "
              >
                {card?.viewAllText || "VIEW ALL"} →
              </span>
            )}
          </div>
        </div>
      </div>

      {/* NOTICES */}
      <div className="px-7 pb-5 sm:px-8">
        {notices && notices.length > 0 ? (
          notices.map((notice, index) => (
            <NoticeItem
              key={notice._id || notice.id || index}
              notice={notice}
            />
          ))
        ) : (
          <div className="border-t border-[#E5DED2] py-8 text-center">
            <p className="text-sm text-[#91897C]">
              No notices available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Updated NoticesSection with dynamic cards and compatibility logic
const NoticesSection = ({ data }) => {
  const notices = data?.notices || [];
  const cards = data?.cards || [];

  // Group notices by card ID with compatibility for both old and new category formats
  const groupedNotices = cards.reduce((acc, card) => {
    acc[card.id] = notices.filter((notice) => {
      // Support both: category: "circulars" (new) and category: "Circulars & Notifications" (old)
      return (
        notice?.category === card.id ||
        notice?.category === card.title
      );
    });

    return acc;
  }, {});

  return (
    <section className="bg-[#FBF9F5] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1200px]">
        {/* SECTION HEADER */}
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-6 bg-[#C99A3C]" />

              <span
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.24em]
                  text-[#A47A2D]
                "
              >
                {data?.tag || "STAY INFORMED"}
              </span>
            </div>

            <h1
              className="
                font-serif
                text-[42px]
                leading-none
                tracking-tight
                text-[#292622]
                sm:text-[48px]
                lg:text-[54px]
              "
            >
              {data?.title || "Quick Notices"}
            </h1>
          </div>

          <p
            className="
              max-w-[330px]
              text-[14px]
              leading-6
              text-[#817A70]
              lg:mb-1
            "
          >
            {data?.description ||
              "The latest circulars, admissions updates and openings from across the college, in one place."}
          </p>
        </div>

        {/* Dynamic notice columns from cards */}
        <div className="grid gap-7 lg:grid-cols-3">
          {cards.map((card) => (
            <NoticeColumn
              key={card.id}
              card={card}
              notices={groupedNotices[card.id] || []}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NoticesSection;