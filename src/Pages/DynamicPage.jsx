import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

import {
  useParams,
  useOutletContext,
} from "react-router-dom";

import PageTemplate from "../components/PageTemplate";

const DynamicPage = () => {
  const { slug } = useParams();

  // Get navItems from SectionLayout
  const outletContext = useOutletContext();

  const navItems = outletContext?.navItems ?? [];

  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const pageRef = useRef(null);

  useEffect(() => {
    if (!slug) return;

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
      })
      .catch((err) => {
        console.error(err);
        setError("Page not found");
      });
  }, [slug]);

 

  if (!page && !error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">
          No content available
        </p>
      </div>
    );
  }

  return (
    <div ref={pageRef}>
      <PageTemplate
        data={page}
        navItems={navItems}
      />
    </div>
  );
};

export default DynamicPage;