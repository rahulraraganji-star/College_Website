import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/pages")
      .then((res) => res.json())
      .then((data) => {
        setPages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // GROUP PAGES BY PARENT
  const groupedPages = pages.reduce((acc, page) => {
    const key = page.parentSlug || "Uncategorized";

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(page);

    return acc;
  }, {});

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Pages
          </h1>

          <p className="text-gray-500 mt-1">
            Manage website pages
          </p>
        </div>

        <Link
          to="/admin/pages/create"
          className="bg-black text-white px-5 py-3 rounded-xl"
        >
          Create Page
        </Link>
      </div>

      {/* GROUPS */}
      <div className="space-y-8">
        {Object.entries(groupedPages).map(
          ([parent, items]) => (
            <div
              key={parent}
              className="bg-white border rounded-2xl overflow-hidden"
            >
              {/* PARENT HEADER */}
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold capitalize">
                  {parent.replace("-", " ")}
                </h2>
              </div>

              {/* CHILD PAGES */}
              <div>
                {items.map((page) => (
                  <div
                    key={page._id}
                    className="flex items-center justify-between px-6 py-4 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium">
                        {page.title}
                      </h3>

                      <p className="text-sm text-gray-500">
                        /{page.parentSlug
                          ? `${page.parentSlug}/`
                          : ""}
                        {page.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                        {page.isPublished
                          ? "Published"
                          : "Draft"}
                      </span>

                      <Link
                        to={`/admin/pages/${page._id}`}
                        className="text-blue-600 font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Pages;