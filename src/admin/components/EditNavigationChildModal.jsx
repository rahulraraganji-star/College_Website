import { useState, useEffect } from "react";
import IconPicker from "./IconPicker";

const EditNavigationChildModal = ({
  open,
  child,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState({
    label: "",
    slug: "",
    icon: "",
    isActive: true,
  });

  useEffect(() => {
    if (child) {
      setForm({
        label: child.label || "",
        slug: child.slug || "",
        icon: child.icon || "",
        isActive: child.isActive,
      });
    }
  }, [child]);

  if (!open || !child) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-6">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

        {/* Header */}

        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold">
            Edit Navigation Item
          </h2>
        </div>

        {/* Body */}

        <div className="p-6 space-y-6">

          {/* Label */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Label
            </label>

            <input
              value={form.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  label: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Slug */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Slug
            </label>

            <input
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Icon */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Icon
            </label>

            <IconPicker
              value={form.icon}
              onChange={(icon) =>
                setForm({
                  ...form,
                  icon,
                })
              }
            />
          </div>

          {/* Status */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Status
            </label>

            <select
              value={form.isActive ? "published" : "draft"}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive:
                    e.target.value === "published",
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>
          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t p-6">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(form)}
            className="px-5 py-2 rounded-lg bg-black text-white"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditNavigationChildModal;