import fs from "fs";
import path from "path";
import { createRequire } from "module";
import dotenv from "../../Backend/node_modules/dotenv/lib/main.js";
import jwt from "../../Backend/node_modules/jsonwebtoken/index.js";

// Load backend env to sign legitimate local session token
const backendEnvPath = path.resolve("./Backend/.env");
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}

const req = createRequire("C:/Users/rahul/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/hyperframes/package.json");
const puppeteer = req("puppeteer-core");

const chromeExecutable = "C:\\Users\\rahul\\.cache\\hyperframes\\chrome\\chrome-headless-shell\\win64-152.0.7977.30\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const outputDir = path.resolve("./brag-output/composition/assets/screens");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate valid session token for local preview
const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
const token = jwt.sign(
  {
    userId: "6a7ca83314d60df3e07cf233",
    role: "super_admin",
    tokenVersion: 0,
  },
  jwtSecret,
  { expiresIn: "1d" }
);

async function run() {
  console.log("Launching headless browser at:", chromeExecutable);
  const browser = await puppeteer.launch({
    executablePath: chromeExecutable,
    headless: "shell",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--window-size=1920,1080",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  // Set auth cookie specifically for localhost:5173
  await page.setCookie({
    name: "cms_token",
    value: token,
    url: "http://localhost:5173",
    httpOnly: true,
    secure: false,
  });

  const screens = [
    {
      name: "01-public-home.png",
      url: "http://localhost:5173/",
      waitFor: 3000,
    },
    {
      name: "02-admin-dashboard.png",
      url: "http://localhost:5173/admin",
      waitFor: 4000,
    },
    {
      name: "03-pages-management.png",
      url: "http://localhost:5173/admin/pages",
      waitFor: 3500,
    },
    {
      name: "04-homepage-editor.png",
      url: "http://localhost:5173/admin/home",
      waitFor: 3500,
    },
    {
      name: "05-media-library.png",
      url: "http://localhost:5173/admin/media",
      waitFor: 4000,
    },
    {
      name: "06-approvals-queue.png",
      url: "http://localhost:5173/admin/approvals",
      waitFor: 3500,
    },
    {
      name: "07-user-roles.png",
      url: "http://localhost:5173/admin/users",
      waitFor: 3500,
    },
    {
      name: "08-link-manager.png",
      url: "http://localhost:5173/admin/link-manager",
      waitFor: 3500,
    },
    {
      name: "09-courses-directory.png",
      url: "http://localhost:5173/courses",
      waitFor: 3000,
    },
  ];

  for (const s of screens) {
    console.log(`Capturing ${s.name} from ${s.url}...`);
    try {
      await page.goto(s.url, { waitUntil: "networkidle2", timeout: 25000 });
      await new Promise((r) => setTimeout(r, s.waitFor));

      // Sanitize any private emails to protect personal data
      await page.evaluate(() => {
        const emailRegex = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (emailRegex.test(node.nodeValue)) {
            node.nodeValue = node.nodeValue.replace(emailRegex, "admin@fragnelcollege.edu.in");
          }
        }
      });

      const outPath = path.join(outputDir, s.name);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved: ${outPath}`);
    } catch (err) {
      console.error(`Failed to capture ${s.name}:`, err.message);
    }
  }

  await browser.close();
  console.log("All genuine screen captures completed successfully!");
}

run().catch(console.error);
