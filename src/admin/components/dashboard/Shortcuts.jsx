import DashboardCard from "./DashboardCard";

const Shortcuts = () => {
  const shortcuts = [
    {
      key: "Ctrl + K",
      action: "Command Palette",
    },
    {
      key: "G → P",
      action: "Go to Pages",
    },
    {
      key: "G → M",
      action: "Go to Media",
    },
    {
      key: "G → U",
      action: "Go to Users",
    },
    {
      key: "G → N",
      action: "Go to Navigation",
    },
  ];

  return (
    <DashboardCard
      eyebrow="Shortcuts"
      action="Keyboard"
      className="min-h-[300px]"
    >
      <div className="space-y-3">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.key}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-sm text-gray-600">
              {shortcut.action}
            </span>

            <kbd
              className="
                rounded-md
                border
                border-gray-300
                bg-gray-50
                px-2
                py-1
                text-[10px]
                font-mono
                text-gray-600
                whitespace-nowrap
              "
            >
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default Shortcuts;