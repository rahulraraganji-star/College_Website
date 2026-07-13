import { sectionTypes } from "../config/sectionTypes";

const AddSectionModal = ({ onSelect, onClose }) => {
  const groupedSections = Object.entries(sectionTypes).reduce(
    (acc, [key, value]) => {
      if (!acc[value.category]) {
        acc[value.category] = [];
      }

      acc[value.category].push({
        key,
        ...value,
      });

      return acc;
    },
    {}
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold">
            Add Section
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>

        </div>

        <div className="space-y-8">

          {Object.entries(groupedSections).map(
            ([category, items]) => (

              <div key={category}>

                <h3 className="text-lg font-semibold mb-3">
                  {category}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                  {items.map((item) => (

                    <button
                      key={item.key}
                      onClick={() =>
                        onSelect(item.key)
                      }
                      className="
                        border
                        rounded-xl
                        p-5
                        text-left
                        hover:border-black
                        hover:shadow-md
                        transition
                      "
                    >

                      <div className="text-3xl mb-2">
                        {item.icon}
                      </div>

                      <div className="font-semibold">
                        {item.label}
                      </div>

                    </button>

                  ))}

                </div>

              </div>

            )
          )}

        </div>

      </div>
    </div>
  );
};

export default AddSectionModal;