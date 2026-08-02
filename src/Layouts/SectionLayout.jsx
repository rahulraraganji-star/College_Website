import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const SectionLayout = () => {
  const { parentSlug } = useParams();
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!parentSlug) {
      setNavItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    fetch(`http://localhost:5000/api/pages/sidebar/${parentSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch sidebar data');
        return res.json();
      })
      .then((data) => {
        const items = Array.isArray(data)
          ? data.map((page) => ({
              to: `/${parentSlug}/${page.slug}`,
              label: page.title,
            }))
          : [];
        setNavItems(items);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [parentSlug]);

  return (
    <Outlet
      context={{
        navItems,
        parentSlug,
        loading,
        error
      }}
    />
  );
};

export default SectionLayout;