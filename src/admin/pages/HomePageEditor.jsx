import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";

import HeroEditor from "../editors/HeroEditor";
import CollectionEditor from "../editors/CollectionEditor";
import MediaPicker from "../media/components/MediaPicker";
import SectionCard from "../components/SectionCard";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors";

const labelClass =
  "block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500";

const HomePageEditor = () => {
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    fetchHome();
  }, []);

  const fetchHome = async () => {
    try {
      const res = await axios.get("/api/home");
      setHome(res.data);
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
    const res = await axios.put("/api/home", home);
    console.log(res.data);
    alert("Saved");
  } catch (err) {
    console.error(err);
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

  const toggleAll = () => {
    const allCollapsed = [0, 1, 2, 3, 4].every(
      (index) => collapsedSections[index] === true
    );

    const newState = {};

    [0, 1, 2, 3, 4].forEach((index) => {
      newState[index] = !allCollapsed;
    });

    setCollapsedSections(newState);
  };

  const allCollapsed =
    [0, 1, 2, 3, 4].every(
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
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Pages
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
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
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Pages
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
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
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Pages
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Home Page
          </h1>
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
          <HeroEditor
            mode="home"
            section={home.sections.hero}
            onChange={(updated) =>
              updateSection("hero", updated)
            }
          />
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
          <CollectionEditor
            section={{
              ...home.sections.eventsMarquee,
              type: "list",
            }}
            onChange={(updated) => updateSection("eventsMarquee", updated)}
            context="homepage"
          />
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
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={home.sections.heroSection2.title || ""}
                onChange={(e) =>
                  updateSection("heroSection2", {
                    ...home.sections.heroSection2,
                    title: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea
                rows={3}
                value={home.sections.heroSection2.subtitle || ""}
                onChange={(e) =>
                  updateSection("heroSection2", {
                    ...home.sections.heroSection2,
                    subtitle: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Primary Button</label>
              <input
                type="text"
                value={home.sections.heroSection2.primaryButton || ""}
                onChange={(e) =>
                  updateSection("heroSection2", {
                    ...home.sections.heroSection2,
                    primaryButton: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Primary Button Link</label>
              <input
                type="text"
                value={home.sections.heroSection2.primaryButtonLink || ""}
                onChange={(e) =>
                  updateSection("heroSection2", {
                    ...home.sections.heroSection2,
                    primaryButtonLink: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Secondary Button</label>
              <input
                type="text"
                value={home.sections.heroSection2.secondaryButton || ""}
                onChange={(e) =>
                  updateSection("heroSection2", {
                    ...home.sections.heroSection2,
                    secondaryButton: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Secondary Button Link</label>
              <input
                type="text"
                value={home.sections.heroSection2.secondaryButtonLink || ""}
                onChange={(e) =>
                  updateSection("heroSection2", {
                    ...home.sections.heroSection2,
                    secondaryButtonLink: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          <CollectionEditor
            section={{
              ...home.sections.heroSection2,
              type: "learningSpaces",
            }}
            onChange={(updated) => updateSection("heroSection2", updated)}
            context="homepage"
          />
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
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={home.sections.eventsSection.title || ""}
                onChange={(e) =>
                  updateSection("eventsSection", {
                    ...home.sections.eventsSection,
                    title: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea
                rows={3}
                value={home.sections.eventsSection.subtitle || ""}
                onChange={(e) =>
                  updateSection("eventsSection", {
                    ...home.sections.eventsSection,
                    subtitle: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Button Text</label>
              <input
                type="text"
                value={home.sections.eventsSection.buttonText || ""}
                onChange={(e) =>
                  updateSection("eventsSection", {
                    ...home.sections.eventsSection,
                    buttonText: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Button Link</label>
              <input
                type="text"
                value={home.sections.eventsSection.buttonLink || ""}
                onChange={(e) =>
                  updateSection("eventsSection", {
                    ...home.sections.eventsSection,
                    buttonLink: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Cover Image</label>
              <MediaPicker
                type="image"
                multiple={false}
                value={home.sections.eventsSection.coverImage || null}
                onChange={(media) =>
                  updateSection("eventsSection", {
                    ...home.sections.eventsSection,
                    coverImage: media,
                  })
                }
              />
            </div>
          </div>

          <CollectionEditor
            section={{
              ...home.sections.eventsSection,
              type: "eventsSection",
            }}
            onChange={(updated) => updateSection("eventsSection", updated)}
            context="homepage"
          />
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
          <div className="grid md:grid-cols-3 gap-5 mb-6">
            <div>
              <label className={labelClass}>Tag</label>
              <input
                type="text"
                value={home.sections.coreStrengths.tag || ""}
                onChange={(e) =>
                  updateSection("coreStrengths", {
                    ...home.sections.coreStrengths,
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
                value={home.sections.coreStrengths.title || ""}
                onChange={(e) =>
                  updateSection("coreStrengths", {
                    ...home.sections.coreStrengths,
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
                value={home.sections.coreStrengths.description || ""}
                onChange={(e) =>
                  updateSection("coreStrengths", {
                    ...home.sections.coreStrengths,
                    description: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          <CollectionEditor
            section={{
              ...home.sections.coreStrengths,
              type: "coreStrengths",
            }}
            onChange={(updated) => updateSection("coreStrengths", updated)}
            context="homepage"
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default HomePageEditor;