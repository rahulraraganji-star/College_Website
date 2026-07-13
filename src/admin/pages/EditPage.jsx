import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const EditPage = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    status: "published",
  });

  const [loading, setLoading] = useState(true);

  // FETCH PAGE
  useEffect(() => {
    fetch(`http://localhost:5000/api/pages`)
      .then((res) => res.json())
      .then((data) => {
        const page = data.find((p) => p._id === id);

        if (page) {
          setFormData({
            title: page.title || "",
            slug: page.slug || "",
            status: page.status || "published",
          });
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // UPDATE PAGE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/pages/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log(data);

      alert("Page updated successfully!");

    } catch (error) {
      console.error(error);

      alert("Failed to update page");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Edit Page
        </h1>

        <p className="text-gray-500 mt-1">
          Update existing page
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl p-6 space-y-6"
      >
        {/* TITLE */}
        <div>
          <label className="block mb-2 font-medium">
            Page Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 outline-none"
          />
        </div>

        {/* SLUG */}
        <div>
          <label className="block mb-2 font-medium">
            Slug
          </label>

          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 outline-none"
          />
        </div>

        {/* STATUS */}
        <div>
          <label className="block mb-2 font-medium">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 outline-none"
          >
            <option value="published">
              Published
            </option>

            <option value="draft">
              Draft
            </option>
          </select>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          Update Page
        </button>
      </form>
    </div>
  );
};

export default EditPage;