import Reveal from "./Reveal";

// Item may arrive as a plain string, {text}, or {text: {text}} nested
// one level too deep depending on how the builder saved it. Unwrap
// until we hit a string.
const resolveItemText = (item) => {
  let value = item;
  while (value && typeof value === "object") {
    value = value.text;
  }
  return value ?? "";
};

const ListSection = ({ section }) => {
  const items = section.items || [];
  if (items.length === 0) return null;

  return (
    <Reveal>
      <div className="pt-16 md:pt-20 border-t border-[#2A2623]/10">
        {section.title && (
          <h2 className="font-['Fraunces'] text-[26px] md:text-[30px] font-medium text-[#2A2623] tracking-tight mb-8">
            {section.title}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 border border-[#2A2623]/10 bg-white/40 p-5 hover:border-[#C9A555]/50 transition-colors"
            >
              <span className="mt-2 w-1.5 h-1.5 bg-[#C9A555] shrink-0 rotate-45" />
              <p className="font-['Inter'] text-[#2A2623]/80 leading-7">{resolveItemText(item)}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
};

export default ListSection;
