import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const SectionLayout = ({ parentSlug }) => {
  const [navItems, setNavItems] = useState([]);

 useEffect(() => {
  fetch(`http://localhost:5000/api/pages/sidebar/${parentSlug}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Parent:", parentSlug);
      console.log("Sidebar API:", data);

      const items = Array.isArray(data)
        ? data.map((page) => ({
            to: `/${parentSlug}/${page.slug}`,
            label: page.title,
          }))
        : [];

      console.log("Nav Items:", items);

      setNavItems(items);
    })
    .catch((err) => console.error(err));
}, [parentSlug]);

  return (
    <Outlet
      context={{
        navItems,
        parentSlug,
      }}
    />
  );
};

export default SectionLayout;