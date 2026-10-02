import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Vite Dev Server Plugin: Link Manager Resolver
 *
 * During local development (localhost:5173), intercepts incoming browser/PDF requests
 * and checks if a legacy URL redirect or file mapping exists before Vite serves index.html.
 * If a mapping exists, returns HTTP 301/302 immediately (matching production Nginx behavior).
 * If no mapping exists, passes through to the React SPA without interference.
 */
function linkManagerDevResolverPlugin() {
  return {
    name: "link-manager-dev-resolver",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          return next();
        }

        const url = req.url || "";
        const pathname = url.split("?")[0];

        // Skip internal assets, node_modules, API proxy, and admin routes
        if (
          pathname.startsWith("/@") ||
          pathname.startsWith("/src/") ||
          pathname.startsWith("/node_modules/") ||
          pathname.startsWith("/api/") ||
          pathname.startsWith("/uploads/") ||
          pathname.startsWith("/admin") ||
          /\.(js|ts|jsx|tsx|css|scss|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico|json)$/i.test(pathname)
        ) {
          return next();
        }

        try {
          const response = await fetch(
            `http://localhost:5000/api/link-manager/resolve?path=${encodeURIComponent(url)}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data?.success && data?.resolution?.found && data?.resolution?.valid) {
              const { resolution } = data;

              if (resolution.type === "redirect") {
                res.writeHead(resolution.statusCode || 301, {
                  Location: resolution.destination,
                  "Cache-Control": "no-cache",
                });
                res.end();
                return;
              }

              if (resolution.type === "file") {
                res.writeHead(302, {
                  Location: resolution.fileUrl,
                  "Cache-Control": "no-cache",
                });
                res.end();
                return;
              }
            }
          }
        } catch {
          // Backend may be booting or offline; gracefully pass through
        }

        return next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), linkManagerDevResolverPlugin()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/wp-content": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/legacy-resolve": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/")
          ) {
            return "vendor";
          }
          if (id.includes("node_modules/gsap/")) {
            return "gsap";
          }
          if (id.includes("node_modules/swiper/")) {
            return "swiper";
          }
          if (id.includes("node_modules/yet-another-react-lightbox/")) {
            return "lightbox";
          }
          if (
            id.includes("node_modules/react-icons/") ||
            id.includes("node_modules/@heroicons/")
          ) {
            return "icons";
          }
          if (id.includes("node_modules/lucide-react/")) {
            return "lucide";
          }
        },
      },
    },
  },
});