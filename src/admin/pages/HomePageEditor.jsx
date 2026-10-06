import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

import HeroEditor from "../editors/HeroEditor";
import CollectionEditor from "../editors/CollectionEditor";
import MediaPicker from "../media/components/MediaPicker";
import SectionCard from "../components/SectionCard";
import IconPicker from "../components/IconPicker"; // Import IconPicker
import Toast from "../components/Toast";
import { clearClientHomeCache } from "../../utils/homeCache";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors";

const labelClass =
  "block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500";

const HomePageEditor = () => {
  const { hasPageAccess } = useAuth();
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingPm, setSyncingPm] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  // Section access helpers
  const canEditSection = (sectionKey) =>
    hasPageAccess("home") || hasPageAccess(`home:${sectionKey}`);
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    fetchHome();
  }, []);

  const fetchHome = async () => {
    try {
      const res = await axios.get("/api/home");

      const homeData = res.data;

      const updatedHome = {
        ...homeData,
        sections: {
          ...homeData.sections,

          notices: homeData.sections?.notices || {
            tag: "STAY INFORMED",
            title: "Quick Notices",
            description:
              "The latest circulars, admissions updates and openings from across the college, in one place.",
            cards: [
              {
                id: "circulars",
                title: "Circulars & Notifications",
                icon: "List",
                viewAllText: "VIEW ALL",
                viewAllUrl: "/notices/circulars"
              },
              {
                id: "admissions",
                title: "Admission News",
                icon: "GraduationCap",
                viewAllText: "VIEW ALL",
                viewAllUrl: "/notices/admissions"
              },
              {
                id: "vacancies",
                title: "Vacancies",
                icon: "BriefcaseBusiness",
                viewAllText: "VIEW ALL",
                viewAllUrl: "/notices/vacancies"
              }
            ],
            notices: [],
          },

          principalMessage: homeData.sections?.principalMessage || {
            tag: "INSTITUTIONAL LEADERSHIP",
            title: "Principal’s Message",
            name: "Prof.(Dr.) Annie Rajan",
            designation: "Principal",
            message:
              "I extend a hearty welcome to you for seeking admission in this institution of higher learning. You are now at the crucial phase of your life when you have to opt for a course that matches the best with your dreams and your future career planning. Besides your pursuit of academic excellence, a lot of emphasis is laid on personality development and holistic growth.",
            image: {
              url: "/uploads/media/images/1790087827760-975692188.jpg",
              alt: "Prof.(Dr.) Annie Rajan - Principal",
            },
            buttonText: "Read Principal’s Message",
            buttonLink: "/about/principal-s-message",
          },
        },
      };

      setHome(updatedHome);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (sectionName, updatedSection) => {
    setHome((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionName]: updatedSection,
      },
    }));
  };

  const handleSave = async () => {
    console.log("========== HOME ==========");
    console.log(home);
    console.log("========== SECTIONS ==========");
    console.log(home.sections);
    console.log(JSON.stringify(home, null, 2));

    setSaving(true);

    try {
      const res = await axios.put("/api/home", home, { withCredentials: true });
      console.log(res.data);
      clearClientHomeCache?.();
      showToast("success", "Changes saved successfully!");
    } catch (err) {
      console.error("Save Home Error:", err);
      showToast("error", err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleCollapse = (index) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSyncPrincipalMessage = async () => {
    try {
      setSyncingPm(true);
      const res = await axios.get("/api/pages/principal-s-message");
      const pageData = res.data;
      if (pageData && Array.isArray(pageData.sections)) {
        const gallerySec = pageData.sections.find((s) => s.type === "gallery");
        const pmBlock = gallerySec?.galleries?.find((g) => g.type === "principalMessage");
        if (pmBlock) {
          let excerpt = pmBlock.message || "";
          const paras = excerpt.split(/\n+/).map((p) => p.trim()).filter(Boolean);
          if (paras.length > 1 && paras[0].length < 150) {
            excerpt = `${paras[0]}\n\n${paras[1]}`;
          } else if (paras.length > 0) {
            excerpt = paras[0];
          }

          updateSection("principalMessage", {
            ...home.sections?.principalMessage,
            title: pmBlock.title || "Principal’s Message",
            name: pmBlock.name || "",
            designation: pmBlock.designation || "Principal",
            message: excerpt,
            image: pmBlock.media || null,
            buttonText: home.sections?.principalMessage?.buttonText || "Read Principal’s Message",
            buttonLink: `/${pageData.parentSlug ? pageData.parentSlug + "/" : ""}${pageData.slug}`,
          });
          alert("Synced successfully from Principal’s Message page!");
          return;
        }
      }
      alert("No Principal’s Message block found on the page.");
    } catch (err) {
      console.error(err);
      alert("Failed to sync from Principal’s Message page.");
    } finally {
      setSyncingPm(false);
    }
  };

  const SECTION_INDICES = [0, 1, 5, 6, 2, 3, 4];

  const toggleAll = () => {
    const allCollapsed = SECTION_INDICES.every(
      (index) => collapsedSections[index] === true
    );

    const newState = {};

    SECTION_INDICES.forEach((index) => {
      newState[index] = !allCollapsed;
    });

    setCollapsedSections(newState);
  };

  const allCollapsed = SECTION_INDICES.every(
    (index) => collapsedSections[index] === true
  );

  // LOADING STATE
  if (loading) {
    console.log("HOME:", home);
    console.log("SECTIONS:", home?.sections);
    console.log("HERO2:", home?.sections?.heroSection2);

    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1">
              Pages
            </p>
            <h1 className="text-[28px] font-extrabold text-black tracking-tight">
              Edit Home Page
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-24 text-sm text-gray-400">
          Loading home page…
        </div>
      </div>
    );
  }

  // EMPTY / NOT FOUND STATE
  if (!home) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1">
              Pages
            </p>
            <h1 className="text-[28px] font-extrabold text-black tracking-tight">
              Edit Home Page
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-24 text-sm text-gray-500">
          Home Page not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1">
            Pages
          </p>
          <h1 className="text-[28px] font-extrabold text-black tracking-tight">
            Edit Home Page
          </h1>
          <p className="text-[14px] text-neutral-500 mt-1.5">
            Manage live modular sections and layout ordering for the college home page.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="bg-gray-900 hover:bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Collapse/Expand All Button */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs text-white bg-gray-900 hover:bg-black px-3 py-2 rounded-lg transition flex items-center gap-1.5"
        >
          {allCollapsed ? (
            <>
              <span>Expand All</span>
              <ChevronDown size={14} />
            </>
          ) : (
            <>
              <span>Collapse All</span>
              <ChevronUp size={14} />
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* ==========================================
              HERO SECTION
        ========================================== */}
        <SectionCard
          title="hero"
          editable={false}
          showNumber={false}
          index={0}
          isCollapsed={collapsedSections[0] || false}
          onToggleCollapse={toggleCollapse}
        >
          {canEditSection("hero") ? (
            <HeroEditor
              mode="home"
              section={home.sections.hero}
              onChange={(updated) => updateSection("hero", updated)}
            />
          ) : (
            <LockedSection label="Hero Banner" />
          )}
        </SectionCard>

        {/* ==========================================
              MARQUEE
        ========================================== */}
        <SectionCard
          title="eventsMarquee"
          editable={false}
          showNumber={false}
          index={1}
          isCollapsed={collapsedSections[1] || false}
          onToggleCollapse={toggleCollapse}
        >
          {canEditSection("eventsMarquee") ? (
            <CollectionEditor
              section={{ ...home.sections.eventsMarquee, type: "list" }}
              onChange={(updated) => updateSection("eventsMarquee", updated)}
              context="homepage"
            />
          ) : (
            <LockedSection label="Events Marquee" />
          )}
        </SectionCard>

        {/* ==========================================
              NOTICES SECTION
        ========================================== */}
        <SectionCard
          title="Notices"
          editable={false}
          showNumber={false}
          index={5}
          isCollapsed={collapsedSections[5] || false}
          onToggleCollapse={toggleCollapse}
        >
          {canEditSection("notices") ? (
            <>
              <div className="grid md:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className={labelClass}>Tag</label>
                  <input
                    type="text"
                    value={home.sections.notices?.tag || ""}
                    onChange={(e) =>
                      updateSection("notices", {
                        ...home.sections.notices,
                        tag: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={home.sections.notices?.title || ""}
                    onChange={(e) =>
                      updateSection("notices", {
                        ...home.sections.notices,
                        title: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={3}
                    value={home.sections.notices?.description || ""}
                    onChange={(e) =>
                      updateSection("notices", {
                        ...home.sections.notices,
                        description: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* NOTICE CARDS */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Notice Cards
                </h3>

                <div className="grid md:grid-cols-3 gap-5">
                  {(home.sections.notices?.cards || []).map((card, index) => (
                    <div
                      key={card.id || index}
                      className="rounded-xl border border-gray-200 bg-white p-5"
                    >
                      <h4 className="mb-4 font-semibold text-gray-800">
                        Card {index + 1}
                      </h4>

                      <div className="mb-4">
                        <label className={labelClass}>Card Title</label>
                        <input
                          type="text"
                          value={card.title || ""}
                          onChange={(e) => {
                            const cards = [...(home.sections.notices?.cards || [])];
                            cards[index] = { ...cards[index], title: e.target.value };
                            updateSection("notices", { ...home.sections.notices, cards });
                          }}
                          className={inputClass}
                        />
                      </div>

                      <div className="mb-4">
                        <label className={labelClass}>Icon</label>
                        <IconPicker
                          value={card.icon || ""}
                          onChange={(icon) => {
                            const cards = [...(home.sections.notices?.cards || [])];
                            cards[index] = { ...cards[index], icon };
                            updateSection("notices", { ...home.sections.notices, cards });
                          }}
                        />
                      </div>

                      <div className="mb-4">
                        <label className={labelClass}>View All Text</label>
                        <input
                          type="text"
                          value={card.viewAllText || ""}
                          onChange={(e) => {
                            const cards = [...(home.sections.notices?.cards || [])];
                            cards[index] = { ...cards[index], viewAllText: e.target.value };
                            updateSection("notices", { ...home.sections.notices, cards });
                          }}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>View All URL</label>
                        <input
                          type="text"
                          value={card.viewAllUrl || ""}
                          onChange={(e) => {
                            const cards = [...(home.sections.notices?.cards || [])];
                            cards[index] = { ...cards[index], viewAllUrl: e.target.value };
                            updateSection("notices", { ...home.sections.notices, cards });
                          }}
                          className={inputClass}
                          placeholder="/notices/circulars"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <CollectionEditor
                section={{ ...home.sections.notices, type: "notices" }}
                onChange={(updated) => updateSection("notices", updated)}
                context="homepage"
                showSectionInfo={false}
              />
            </>
          ) : (
            <LockedSection label="Notices" />
          )}
        </SectionCard>

        {/* ==========================================
              PRINCIPAL'S MESSAGE
        ========================================== */}
        <SectionCard
          title="principalMessage"
          editable={false}
          showNumber={false}
          index={6}
          isCollapsed={collapsedSections[6] || false}
          onToggleCollapse={toggleCollapse}
        >
          {canEditSection("principalMessage") ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-gray-100">
                <p className="text-xs text-gray-500">
                  Feature an excerpt from the Principal, official portrait, and a button linking to the full message page.
                </p>
                <button
                  type="button"
                  disabled={syncingPm}
                  onClick={handleSyncPrincipalMessage}
                  className="text-xs font-medium text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition disabled:opacity-50 shrink-0 self-start sm:self-auto flex items-center gap-1.5"
                  title="Sync details from the existing Principal's Message page"
                >
                  {syncingPm ? "Syncing..." : "↻ Sync from Principal’s Page"}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className={labelClass}>Tag / Eyebrow</label>
                  <input
                    type="text"
                    value={home.sections.principalMessage?.tag || ""}
                    onChange={(e) =>
                      updateSection("principalMessage", {
                        ...home.sections.principalMessage,
                        tag: e.target.value,
                      })
                    }
                    placeholder="INSTITUTIONAL LEADERSHIP"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Section Title</label>
                  <input
                    type="text"
                    value={home.sections.principalMessage?.title || ""}
                    onChange={(e) =>
                      updateSection("principalMessage", {
                        ...home.sections.principalMessage,
                        title: e.target.value,
                      })
                    }
                    placeholder="Principal’s Message"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Principal Name</label>
                  <input
                    type="text"
                    value={home.sections.principalMessage?.name || ""}
                    onChange={(e) =>
                      updateSection("principalMessage", {
                        ...home.sections.principalMessage,
                        name: e.target.value,
                      })
                    }
                    placeholder="Prof.(Dr.) Annie Rajan"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Designation</label>
                  <input
                    type="text"
                    value={home.sections.principalMessage?.designation || ""}
                    onChange={(e) =>
                      updateSection("principalMessage", {
                        ...home.sections.principalMessage,
                        designation: e.target.value,
                      })
                    }
                    placeholder="Principal"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Message / Short Excerpt</label>
                  <textarea
                    rows={4}
                    value={home.sections.principalMessage?.message || ""}
                    onChange={(e) =>
                      updateSection("principalMessage", {
                        ...home.sections.principalMessage,
                        message: e.target.value,
                      })
                    }
                    placeholder="A concise welcome message excerpt for the homepage..."
                    className={inputClass}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    This excerpt is displayed on the home page. The full message remains on the dedicated Principal’s Message page.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Button Text</label>
                  <input
                    type="text"
                    value={home.sections.principalMessage?.buttonText || ""}
                    onChange={(e) =>
                      updateSection("principalMessage", {
                        ...home.sections.principalMessage,
                        buttonText: e.target.value,
                      })
                    }
                    placeholder="Read Principal’s Message"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Button Link</label>
                  <input
                    type="text"
                    value={home.sections.principalMessage?.buttonLink || ""}
                    onChange={(e) =>
                      updateSection("principalMessage", {
                        ...home.sections.principalMessage,
                        buttonLink: e.target.value,
                      })
                    }
                    placeholder="/about/principal-s-message"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Principal Photograph</label>
                  <MediaPicker
                    type="image"
                    multiple={false}
                    value={home.sections.principalMessage?.image || null}
                    onChange={(media) =>
                      updateSection("principalMessage", {
                        ...home.sections.principalMessage,
                        image: media,
                      })
                    }
                  />
                </div>
              </div>
            </>
          ) : (
            <LockedSection label="Principal's Message" />
          )}
        </SectionCard>

        {/* ==========================================
              LEARNING SPACES
        ========================================== */}
        <SectionCard
          title="heroSection2"
          editable={false}
          showNumber={false}
          index={2}
          isCollapsed={collapsedSections[2] || false}
          onToggleCollapse={toggleCollapse}
        >
          {canEditSection("heroSection2") ? (
            <>
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className={labelClass}>Title</label>
                  <input type="text" value={home.sections.heroSection2?.title || ""}
                    onChange={(e) => updateSection("heroSection2", { ...home.sections.heroSection2, title: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Subtitle</label>
                  <textarea rows={3} value={home.sections.heroSection2?.subtitle || ""}
                    onChange={(e) => updateSection("heroSection2", { ...home.sections.heroSection2, subtitle: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Primary Button</label>
                  <input type="text" value={home.sections.heroSection2?.primaryButton || ""}
                    onChange={(e) => updateSection("heroSection2", { ...home.sections.heroSection2, primaryButton: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Primary Button Link</label>
                  <input type="text" value={home.sections.heroSection2?.primaryButtonLink || ""}
                    onChange={(e) => updateSection("heroSection2", { ...home.sections.heroSection2, primaryButtonLink: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Secondary Button</label>
                  <input type="text" value={home.sections.heroSection2?.secondaryButton || ""}
                    onChange={(e) => updateSection("heroSection2", { ...home.sections.heroSection2, secondaryButton: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Secondary Button Link</label>
                  <input type="text" value={home.sections.heroSection2?.secondaryButtonLink || ""}
                    onChange={(e) => updateSection("heroSection2", { ...home.sections.heroSection2, secondaryButtonLink: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <CollectionEditor
                section={{ ...home.sections.heroSection2, type: "learningSpaces" }}
                onChange={(updated) => updateSection("heroSection2", updated)}
                context="homepage"
              />
            </>
          ) : (
            <LockedSection label="Learning Spaces" />
          )}
        </SectionCard>

        {/* ==========================================
              EVENTS
        ========================================== */}
        <SectionCard
          title="eventsSection"
          editable={false}
          showNumber={false}
          index={3}
          isCollapsed={collapsedSections[3] || false}
          onToggleCollapse={toggleCollapse}
        >
          {canEditSection("eventsSection") ? (
            <>
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className={labelClass}>Title</label>
                  <input type="text" value={home.sections.eventsSection?.title || ""}
                    onChange={(e) => updateSection("eventsSection", { ...home.sections.eventsSection, title: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Subtitle</label>
                  <textarea rows={3} value={home.sections.eventsSection?.subtitle || ""}
                    onChange={(e) => updateSection("eventsSection", { ...home.sections.eventsSection, subtitle: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Button Text</label>
                  <input type="text" value={home.sections.eventsSection?.buttonText || ""}
                    onChange={(e) => updateSection("eventsSection", { ...home.sections.eventsSection, buttonText: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Button Link</label>
                  <input type="text" value={home.sections.eventsSection?.buttonLink || ""}
                    onChange={(e) => updateSection("eventsSection", { ...home.sections.eventsSection, buttonLink: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cover Image</label>
                  <MediaPicker type="image" multiple={false}
                    value={home.sections.eventsSection?.coverImage || null}
                    onChange={(media) => updateSection("eventsSection", { ...home.sections.eventsSection, coverImage: media })} />
                </div>
              </div>
              <CollectionEditor
                section={{ ...home.sections.eventsSection, type: "eventsSection" }}
                onChange={(updated) => updateSection("eventsSection", updated)}
                context="homepage"
              />
            </>
          ) : (
            <LockedSection label="Events Section" />
          )}
        </SectionCard>

        {/* ==========================================
              CORE STRENGTHS
        ========================================== */}
        <SectionCard
          title="coreStrengths"
          editable={false}
          showNumber={false}
          index={4}
          isCollapsed={collapsedSections[4] || false}
          onToggleCollapse={toggleCollapse}
        >
          {canEditSection("coreStrengths") ? (
            <>
              <div className="grid md:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className={labelClass}>Tag</label>
                  <input type="text" value={home.sections.coreStrengths?.tag || ""}
                    onChange={(e) => updateSection("coreStrengths", { ...home.sections.coreStrengths, tag: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Title</label>
                  <input type="text" value={home.sections.coreStrengths?.title || ""}
                    onChange={(e) => updateSection("coreStrengths", { ...home.sections.coreStrengths, title: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} value={home.sections.coreStrengths?.description || ""}
                    onChange={(e) => updateSection("coreStrengths", { ...home.sections.coreStrengths, description: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <CollectionEditor
                section={{ ...home.sections.coreStrengths, type: "coreStrengths" }}
                onChange={(updated) => updateSection("coreStrengths", updated)}
                context="homepage"
              />
            </>
          ) : (
            <LockedSection label="Core Strengths" />
          )}
        </SectionCard>
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};


// ==========================================
// LOCKED SECTION PLACEHOLDER
// Shown when the user lacks edit access
// to a particular home section.
// ==========================================

const LockedSection = ({ label }) => (
  <div className="py-4 px-1">
    <p className="text-sm text-gray-500">
      You don't have access to {label ? `the "${label}"` : "this"} section. Please contact your Admin or Super Admin to request access.
    </p>
  </div>
);


export default HomePageEditor;