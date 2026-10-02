import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
import { getCleanImageUrl } from "../utils/imageUrl";

/**
 * PrincipalMessageSection
 *
 * Additive section displayed on the Home Page immediately after "Quick Notices".
 * Displays the Principal's portrait, name, designation, message excerpt,
 * and a CTA button navigating to the full Principal's Message page.
 */
const PrincipalMessageSection = ({ data }) => {
  if (!data) return null;

  const {
    tag = "INSTITUTIONAL LEADERSHIP",
    title = "Principal’s Message",
    name = "Prof.(Dr.) Annie Rajan",
    designation = "Principal",
    message = "I extend a hearty welcome to you for seeking admission in this institution of higher learning. You are now at the crucial phase of your life when you have to opt for a course that matches the best with your dreams and your future career planning. Besides your pursuit of academic excellence, a lot of emphasis is laid on personality development and holistic growth.",
    image,
    buttonText = "Read Principal’s Message",
    buttonLink = "/about/principal-s-message",
  } = data;

  const rawUrl = (typeof image === "object" ? image?.url : image) || null;
  const imageUrl = getCleanImageUrl(rawUrl);
  const imageAlt =
    image?.alt || (name ? `${name} - ${designation}` : "Principal Photograph");

  // Split message into paragraphs if multiline
  const paragraphs = message
    ? message
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="relative overflow-hidden bg-white border-y border-[#EFE9DE] py-16 sm:py-20 lg:py-24">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FAF6EE] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)] gap-10 lg:gap-14 items-center">
          
          {/* ================= LEFT COLUMN: PORTRAIT & CREDENTIALS ================= */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="w-full max-w-[320px] lg:max-w-none rounded-2xl border border-[#E6DED3] bg-[#FAF8F5] p-3 sm:p-4 shadow-sm group transition-all duration-300 hover:shadow-md">
              
              {/* Photo Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#2A2623]/5">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#8A6B3F]/10 flex items-center justify-center text-[#8A6B3F] mb-3">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-8 h-8"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#7A7268]">
                      Principal Photo
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 pointer-events-none" />
              </div>

              {/* Photo Caption / Credentials */}
              <div className="pt-4 pb-1 px-2 text-center lg:text-left">
                {name && (
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#292622] leading-snug">
                    {name}
                  </h3>
                )}
                {designation && (
                  <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#A47A2D] font-semibold mt-1">
                    {designation}
                  </p>
                )}
                <p className="text-[12px] text-[#817A70] mt-1 font-sans">
                  Fr. Agnel College of Arts & Commerce
                </p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: MESSAGE & CTA ================= */}
          <div className="flex flex-col justify-center min-w-0">
            
            {/* Tag / Eyebrow */}
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-6 bg-[#C99A3C]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#A47A2D]">
                {tag}
              </span>
            </div>

            {/* Section Heading */}
            <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[46px] leading-[1.1] tracking-tight text-[#292622]">
              {title}
            </h2>

            {/* Gold Accent Divider */}
            <div className="w-12 h-[2px] bg-[#C99A3C] rounded-full my-5" />

            {/* Quote Container */}
            <div className="relative pl-0 sm:pl-2">
              <Quote
                size={38}
                className="text-[#C99A3C]/20 mb-3 -scale-x-100"
                aria-hidden="true"
              />

              {/* Excerpt Paragraphs */}
              <div className="space-y-3.5 text-[#4A433B] text-[15px] sm:text-[16px] leading-[1.8] font-sans">
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
                ) : (
                  <p>
                    Principal’s message will be updated shortly.
                  </p>
                )}
              </div>
            </div>

            {/* Signature & CTA Row */}
            <div className="mt-8 pt-6 border-t border-[#EFE9DE] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#A47A2D] font-semibold block">
                  Warm Regards,
                </span>
                <span className="font-serif text-lg font-medium text-[#292622] block mt-0.5">
                  {name}
                </span>
              </div>

              {/* CTA Navigation Button */}
              <div>
                <Link
                  to={buttonLink || "/about/principal-s-message"}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#292622] text-[#FAF8F5] hover:bg-[#8A6B3F] hover:text-white active:scale-[0.98] transition-all duration-300 font-medium text-sm sm:text-[15px] shadow-sm group shrink-0"
                >
                  <span>{buttonText || "Read Principal’s Message"}</span>
                  <ArrowRight
                    size={17}
                    className="text-[#C99A3C] group-hover:text-white transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PrincipalMessageSection;
