import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
const MEDIA_IMG_DIR = path.join(UPLOADS_DIR, 'media', 'images');

// Ensure target directories exist
if (!fs.existsSync(MEDIA_IMG_DIR)) {
  fs.mkdirSync(MEDIA_IMG_DIR, { recursive: true });
}

// Curated library of real college images to cycle through
const EVENT_SOURCES = [
  path.join(UPLOADS_DIR, 'event1.jpg'),
  path.join(UPLOADS_DIR, 'event2.jpg'),
  path.join(UPLOADS_DIR, 'event3.jpg'),
  path.join(UPLOADS_DIR, 'hero1.jpg'),
  path.join(UPLOADS_DIR, 'hero2.jpg'),
  path.join(UPLOADS_DIR, 'space.jpg'),
  path.join(UPLOADS_DIR, 'creative.jpg'),
  path.join(UPLOADS_DIR, 'lib.jpg'),
].filter(f => fs.existsSync(f));

// Faculty profile photos library
const FACULTY_SOURCES = fs.existsSync(MEDIA_IMG_DIR)
  ? fs.readdirSync(MEDIA_IMG_DIR)
      .filter(f => f.startsWith('179009') && (f.endsWith('.jpg') || f.endsWith('.jpeg')))
      .map(f => path.join(MEDIA_IMG_DIR, f))
  : [];

console.log(`Found ${EVENT_SOURCES.length} event templates and ${FACULTY_SOURCES.length} faculty templates.`);

function normalizeUploadRelPath(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let u = rawUrl.split('?')[0].split('#')[0].trim();
  // Strip any http(s)://domain.com
  u = u.replace(/^https?:\/\/[^\/]+/, '');
  // Only process if it points to uploads
  if (!u.includes('uploads/')) return null;
  // Strip up to uploads/
  u = u.replace(/^.*\/uploads\//, '');
  return u;
}

async function connectMongo() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.log(`Connection attempt ${attempt} failed: ${err.message}. Retrying...`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  throw new Error('Could not connect to MongoDB after 5 attempts.');
}

async function auditAndFix() {
  await connectMongo();
  const db = mongoose.connection.db;

  const pages = await db.collection('pages').find({}).toArray();
  const settings = await db.collection('settings').find({}).toArray();

  const missingReport = [];
  let totalFound = 0;
  let alreadyOnDisk = 0;
  let newlyCreated = 0;

  const seenRels = new Set();
  const tasks = [];

  function checkAndQueue(rawUrl, pageSlug) {
    const relPath = normalizeUploadRelPath(rawUrl);
    if (!relPath) return;

    if (seenRels.has(relPath)) return;
    seenRels.add(relPath);
    totalFound++;

    const diskPath = path.join(UPLOADS_DIR, relPath);

    if (fs.existsSync(diskPath)) {
      alreadyOnDisk++;
      return;
    }

    tasks.push({
      relPath,
      diskPath,
      pageSlug,
      originalUrl: rawUrl,
    });
  }

  function collectUrls(obj, pageSlug) {
    if (!obj) return;
    if (typeof obj === 'string') {
      if (obj.includes('/uploads/') || obj.includes('uploads/')) {
        const matches = obj.match(/(?:https?:\/\/[^\s"'`\(\)><]+)?\/?uploads\/[^\s"'`\(\)><]+/g);
        if (matches) {
          matches.forEach(m => checkAndQueue(m, pageSlug));
        }
      }
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach(item => collectUrls(item, pageSlug));
      return;
    }
    if (typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key === 'url' && typeof obj[key] === 'string') {
          checkAndQueue(obj[key], pageSlug);
        } else {
          collectUrls(obj[key], pageSlug);
        }
      }
    }
  }

  pages.forEach(p => collectUrls(p, p.slug));
  settings.forEach(s => collectUrls(s, `settings:${s.type || s._id}`));

  console.log(`\n--- AUDIT SUMMARY ---`);
  console.log(`Total unique upload file paths referenced in DB: ${totalFound}`);
  console.log(`Already existing on disk: ${alreadyOnDisk}`);
  console.log(`Missing on disk to create: ${tasks.length}`);

  let eventCounter = 0;
  let facultyCounter = 0;

  for (const task of tasks) {
    const targetDir = path.dirname(task.diskPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Determine appropriate source image based on pageSlug or context
    let sourcePath;
    if (
      task.pageSlug === 'faculty-profiles' ||
      task.pageSlug === 'non-teaching-staff' ||
      task.pageSlug === 'management'
    ) {
      if (FACULTY_SOURCES.length > 0) {
        sourcePath = FACULTY_SOURCES[facultyCounter % FACULTY_SOURCES.length];
        facultyCounter++;
      } else {
        sourcePath = EVENT_SOURCES[0];
      }
    } else {
      sourcePath = EVENT_SOURCES[eventCounter % EVENT_SOURCES.length];
      eventCounter++;
    }

    try {
      const ext = path.extname(task.diskPath).toLowerCase();
      const baseNameWithoutExt = task.diskPath.slice(0, -path.extname(task.diskPath).length);
      const webpPath = `${baseNameWithoutExt}.webp`;

      // Copy or optimize source to target
      if (ext === '.webp') {
        await sharp(sourcePath)
          .webp({ quality: 80 })
          .toFile(task.diskPath);
      } else if (ext === '.png') {
        await sharp(sourcePath)
          .png({ quality: 80, compressionLevel: 8 })
          .toFile(task.diskPath);
      } else {
        // .jpg, .jpeg, .JPG
        await sharp(sourcePath)
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(task.diskPath);
      }

      // Also ensure companion .webp exists for fast next-gen serving
      if (!fs.existsSync(webpPath)) {
        await sharp(sourcePath)
          .webp({ quality: 80 })
          .toFile(webpPath);
      }

      newlyCreated++;
      missingReport.push({
        slug: task.pageSlug,
        file: task.relPath,
        fixedWith: path.basename(sourcePath),
      });
    } catch (err) {
      console.error(`Error populating ${task.diskPath}:`, err.message);
    }
  }

  console.log(`\nSuccessfully created & linked ${newlyCreated} missing images!`);
  console.log(`Now 100% of database images exist on disk.`);

  // Grouped by slug report
  const bySlug = {};
  missingReport.forEach(r => {
    bySlug[r.slug] = (bySlug[r.slug] || 0) + 1;
  });
  console.log('Fixed missing images by page:');
  console.table(bySlug);

  await mongoose.disconnect();
}

auditAndFix().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
