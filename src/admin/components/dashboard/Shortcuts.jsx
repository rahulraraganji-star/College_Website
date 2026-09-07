import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "./DashboardCard";

const Shortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let lastKey = "";
    let lastKeyTime = 0;

    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        return;
      }

      // Ctrl + K or Cmd + K -> Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("dashboard-search-input");
        if (searchInput) searchInput.focus();
        return;
      }

      const now = Date.now();
      const key = e.key.toLowerCase();

      // Check for two-key sequences (e.g., 'g' then 'p')
      if (now - lastKeyTime < 800) {
        if (lastKey === "g") {
          if (key === "p") {
            e.preventDefault();
            navigate("/admin/pages");
          } else if (key === "m") {
            e.preventDefault();
            navigate("/admin/media");
          } else if (key === "u") {
            e.preventDefault();
            navigate("/admin/users");
          } else if (key === "n") {
            e.preventDefault();
            navigate("/admin/navigation");
          } else if (key === "a") {
            e.preventDefault();
            navigate("/admin/approvals");
          }
        }
      }

      lastKey = key;
      lastKeyTime = now;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const shortcuts = [
    {
      key: "Ctrl + K",
      action: "Command / Search",
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
    {
      key: "G → A",
      action: "Go to Approvals",
    },
  ];

  return (
    <DashboardCard
      eyebrow="Shortcuts"
      action="Interactive"
      className="min-h-[300px]"
    >
      <div className="space-y-3">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.key}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-sm text-gray-600 font-medium">
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
                font-semibold
                text-gray-700
                whitespace-nowrap
                shadow-2xs
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