import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { hasRenderableSection } from "../utils/sectionValidator";

const Navbar = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH PAGES
  useEffect(() => {
    fetch("http://localhost:5000/api/pages")
      .then((res) => res.json())
      .then((data) => {
        console.log("NAV PAGES FROM API:", data);
        setPages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("NAV FETCH ERROR:", err);
        setPages([]);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  /**
   * TEMPORARY NAVBAR VISIBILITY RULE
   * --------------------------------
   * Show page in navbar if:
   * - published
   * - has sections (even if content is placeholder)
   *
   * NOTE: strict validation already exists in PageTemplate
   */
  const visiblePages = pages.filter(
    (page) =>
      (page.status === "published" || page.isPublished === true) &&
      Array.isArray(page.sections) &&
      page.sections.length > 0
  );

  // GROUP BY CATEGORY (with fallback)
  const pagesByCategory = visiblePages.reduce((acc, page) => {
    const category = page.category || "about-us"; // SAFE DEFAULT

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(page);
    return acc;
  }, {});

  // RENDER DROPDOWN
  const renderDropdown = (label, category, basePath) => {
    const items = pagesByCategory[category];
    if (!items || items.length === 0) return null;

    return (
      <li className="relative group">
        <span className="cursor-pointer font-medium">
          {label}
        </span>

        <ul className="absolute left-0 top-full hidden min-w-[220px] bg-white shadow-lg group-hover:block z-50">
          {items.map((page) => (
            <li key={page.slug}>
              <NavLink
                to={`${basePath}/${page.slug}`}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                {page.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </li>
    );
  };

  return (
    <nav className="bg-white border-b">
      <ul className="flex space-x-6 px-6 py-4">
        {renderDropdown("About Us", "about-us", "/about")}
        {renderDropdown("Administration", "administration", "/administration")}
        {renderDropdown("Student Life", "students-life", "/students")}
        {renderDropdown("Academics", "academics", "/academics")}
        {renderDropdown("Staff", "staff", "/staff")}
        {renderDropdown("Admissions", "admissions", "/admissions")}
        {renderDropdown("Examination", "examination", "/examination")}
        {renderDropdown(
          "Accreditation & Rankings",
          "accreditation-rankings",
          "/accreditation"
        )}
        {renderDropdown("Policies / RTI", "policies", "/policies")}
        {renderDropdown("Alumni", "alumni", "/alumni")}
        {renderDropdown("Infrastructure", "infrastructure", "/infrastructure")}
      </ul>
    </nav>
  );
};

export default Navbar;
