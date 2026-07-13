import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PageTemplate from "../components/PageTemplate";

const DynamicPage = () => {
  const { slug } = useParams();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 

    if (!slug) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/api/pages/${slug}`)
      .then((res) => {

        if (!res.ok) {
          throw new Error("Page not found");
        }

        return res.json();
      })
      .then((data) => {

        setPage(data);
        setLoading(false);

      })
      .catch((err) => {

        console.error(err);

        setError("Page not found");
        setLoading(false);

      });

  }, [slug]);

  // LOADING
  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading...
        </p>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-red-500 text-lg">
          {error}
        </p>
      </div>
    );
  }

  // NO PAGE
  if (!page) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">
          No content available
        </p>
      </div>
    );
  }

  // RENDER PAGE
  return <PageTemplate data={page} />;
};

export default DynamicPage;