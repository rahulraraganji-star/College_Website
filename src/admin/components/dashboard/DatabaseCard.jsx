import DashboardCard from "./DashboardCard";

const DatabaseCard = () => {
  const collections = [
    {
      name: "Pages",
      count: "186",
    },
    {
      name: "Media",
      count: "2,812",
    },
    {
      name: "Navigation",
      count: "61",
    },
    {
      name: "Settings",
      count: "12",
    },
    {
      name: "Users",
      count: "5",
    },
  ];

  return (
    <DashboardCard
      eyebrow="Database"
      action="5 collections"
      className="min-h-[300px]"
    >
      <div className="divide-y divide-gray-200">

        {collections.map((item) => (
          <div
            key={item.name}
            className="
              flex
              items-center
              justify-between
              py-3
            "
          >
            <span className="text-sm text-gray-900">
              {item.name}
            </span>

            <div className="flex items-center gap-3">

              <span
                className="
                  flex
                  items-center
                  justify-center
                  min-w-8
                  h-6
                  px-2
                  rounded-full
                  border
                  border-gray-300
                  text-[11px]
                  text-gray-700
                "
              >
                {item.count}
              </span>

              <span className="text-gray-400">
                ›
              </span>

            </div>
          </div>
        ))}

      </div>
    </DashboardCard>
  );
};

export default DatabaseCard;