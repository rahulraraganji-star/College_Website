import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

const SectionRedirect = () => {
  const { parentSlug } = useParams();

  const [firstPage, setFirstPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `http://localhost:5000/api/pages/sidebar/${parentSlug}`
    )
      .then((res) => res.json())
      .then((pages) => {
        if (Array.isArray(pages) && pages.length > 0) {
          setFirstPage(pages[0]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [parentSlug]);

  if (loading) {
    return (
      <div className="p-20 text-center">
        Loading...
      </div>
    );
  }

  if (!firstPage) {
    return (
      <div className="p-20 text-center">
        No pages found.
      </div>
    );
  }

  return (
    <Navigate
      to={`/${parentSlug}/${firstPage.slug}`}
      replace
    />
  );
};

export default SectionRedirect;