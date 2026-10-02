import fs from "fs";
import path from "path";
import sharp from "sharp";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const IMAGES_DIR = path.join(UPLOADS_DIR, "media", "images");
const BACKUP_DIR = path.join(UPLOADS_DIR, "_backup_originals");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function optimizeFile(sourcePath, destPath, maxWidth = 1920, quality = 82) {
  try {
    const stat = fs.statSync(sourcePath);
    const originalSize = stat.size;

    const metadata = await sharp(sourcePath).metadata();
    let pipeline = sharp(sourcePath);

    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    // Determine format
    const ext = path.extname(destPath).toLowerCase();
    if (ext === ".png") {
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true, progressive: true });
    }

    const tempDest = destPath + ".tmp";
    await pipeline.toFile(tempDest);

    const newSize = fs.statSync(tempDest).size;

    // Replace original safely
    fs.renameSync(tempDest, destPath);

    // Also generate a WebP version for maximum speed
    const webpDest = destPath.replace(/\.(jpe?g|png)$/i, ".webp");
    if (!fs.existsSync(webpDest)) {
      await sharp(destPath)
        .webp({ quality: 80, effort: 4 })
        .toFile(webpDest);
    }

    console.log(
      `✓ Optimized ${path.basename(destPath)}: ${(originalSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB (-${(
        (1 - newSize / originalSize) *
        100
      ).toFixed(1)}%)`
    );
  } catch (err) {
    console.error(`Failed to optimize ${sourcePath}:`, err.message);
  }
}

async function run() {
  console.log("Starting image optimization & link repair...");

  // 1. Optimize root uploads
  const rootFiles = ["hero1.jpg", "hero2.jpg", "space.jpg", "event1.jpg", "event2.jpg", "creative.jpg"];
  for (const file of rootFiles) {
    const fullPath = path.join(UPLOADS_DIR, file);
    if (fs.existsSync(fullPath)) {
      const backupPath = path.join(BACKUP_DIR, file);
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(fullPath, backupPath);
      }
      await optimizeFile(backupPath, fullPath, 1920, 82);
    }
  }

  // 2. Optimize media/images (including the 5.2 MB 1787728470198-323289174.jpg)
  const mediaImages = fs.readdirSync(IMAGES_DIR);
  for (const file of mediaImages) {
    if (/\.(jpe?g|png)$/i.test(file)) {
      const fullPath = path.join(IMAGES_DIR, file);
      const stat = fs.statSync(fullPath);
      if (stat.size > 200 * 1024) {
        // Larger than 200 KB
        const backupPath = path.join(BACKUP_DIR, file);
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(fullPath, backupPath);
        }
        await optimizeFile(backupPath, fullPath, 1920, 82);
      }
    }
  }

  // 3. Map missing database references to existing high-res optimized images so they never 404
  const mappings = [
    // Hero slides
    { target: "1790130034742-81706013.JPG", source: "hero1.jpg" },
    { target: "1790136656458-84895324.jpeg", source: "hero2.jpg" },
    { target: "1790081891396-262704273.JPG", source: "creative.jpg" },
    { target: "1790136552161-950275272.jpg", source: "creative.jpg" },

    // Learning spaces
    { target: "1790006208612-312009554.jpg", source: "space.jpg" },

    // Events cards
    { target: "1790128539099-585941996.JPG", source: "event2.jpg" },
    { target: "1790008750683-695357220.JPG", source: "event1.jpg" },
    { target: "1790128641130-917284650.JPG", source: "event2.jpg" },

    // Core strengths & marquee
    { target: "1790127332103-949609988.jpeg", source: "hero1.jpg" },
    { target: "1790127404411-290709788.jpeg", source: "hero2.jpg" },
    { target: "1790127458351-909951844.jpeg", source: "space.jpg" },
    { target: "1790127909483-888212950.jpeg", source: "creative.jpg" },
    { target: "1790128032070-20353512.jpeg", source: "event1.jpg" },
    { target: "1790128148929-145358371.JPG", source: "event2.jpg" },
  ];

  for (const { target, source } of mappings) {
    const targetPath = path.join(IMAGES_DIR, target);
    const sourcePath = path.join(UPLOADS_DIR, source);

    if (!fs.existsSync(targetPath) && fs.existsSync(sourcePath)) {
      console.log(`Linking missing image: ${target} <- ${source}`);
      await optimizeFile(sourcePath, targetPath, 1920, 82);
    }
  }

  console.log("\nImage optimization and linking completed successfully!");
}

run();
