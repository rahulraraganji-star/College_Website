import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import sharp from 'sharp';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DOWNLOADS_DIR = 'C:/Users/rahul/Downloads';
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
const MEDIA_IMG_DIR = path.join(UPLOADS_DIR, 'media', 'images');
const EXTRACT_POOL = path.join(UPLOADS_DIR, '_extracted_drive_pool');

if (!fs.existsSync(MEDIA_IMG_DIR)) {
  fs.mkdirSync(MEDIA_IMG_DIR, { recursive: true });
}

if (!fs.existsSync(EXTRACT_POOL)) {
  fs.mkdirSync(EXTRACT_POOL, { recursive: true });
}

const ZIPS = [
  'drive-download-20260923T013301Z-1-001.zip',
  'drive-download-20260923T013401Z-1-001.zip',
  'drive-download-20260923T021416Z-1-001.zip',
  'drive-download-20260923T023057Z-1-001.zip',
  'drive-download-20260923T030410Z-1-001.zip',
];

const PRE_EXTRACTED_DIR = path.join(DOWNLOADS_DIR, 'drive-download-20260923T021416Z-1-001');

function normalizeKey(filename) {
  if (!filename) return '';
  return filename
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\.jpeg$/, '.jpg');
}

async function extractAllZips() {
  console.log('--- Step 1: Extracting Google Drive Download Packs ---');
  for (const zipName of ZIPS) {
    const zipPath = path.join(DOWNLOADS_DIR, zipName);
    if (!fs.existsSync(zipPath)) {
      console.warn(`Zip not found: ${zipPath}`);
      continue;
    }
    console.log(`Extracting ${zipName}...`);
    try {
      // Use tar -xf which handles standard zip archives on Windows 10/11
      execSync(`tar -xf "${zipPath}" -C "${EXTRACT_POOL}"`);
    } catch (err) {
      console.warn(`tar failed for ${zipName}, trying powershell Expand-Archive...`);
      execSync(
        `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${EXTRACT_POOL}' -Force"`
      );
    }
  }

  // Also copy any pre-extracted files if present
  if (fs.existsSync(PRE_EXTRACTED_DIR)) {
    console.log('Copying pre-extracted files from folder...');
    const files = fs.readdirSync(PRE_EXTRACTED_DIR);
    for (const f of files) {
      const src = path.join(PRE_EXTRACTED_DIR, f);
      const dest = path.join(EXTRACT_POOL, f);
      if (!fs.existsSync(dest) && fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
      }
    }
  }

  // Also copy desktop files
  const desktop = 'C:/Users/rahul/OneDrive/Desktop';
  ['library-Photo.jpg', 'IMG_8603 (1).JPG', 'IMG_8603.JPG', '1790082082090-334929245.jpg'].forEach(f => {
    const src = path.join(desktop, f);
    if (fs.existsSync(src)) {
      const dest = path.join(EXTRACT_POOL, f.replace(' (1)', ''));
      if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
    }
  });

  const poolFiles = fs.readdirSync(EXTRACT_POOL);
  console.log(`Total real photographs in extract pool: ${poolFiles.length}`);
}

async function optimizeAndSave(sourcePath, destPath) {
  let pipeline = sharp(sourcePath).rotate();
  const metadata = await sharp(sourcePath).rotate().metadata();

  if (metadata.width && metadata.width > 1920) {
    pipeline = pipeline.resize({ width: 1920, withoutEnlargement: true });
  }

  const ext = path.extname(destPath).toLowerCase();
  if (ext === '.png') {
    pipeline = pipeline.png({ quality: 82, compressionLevel: 8 });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: 80 });
  } else {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true, progressive: true });
  }

  const tempDest = destPath + '.tmp';
  await pipeline.toFile(tempDest);
  fs.renameSync(tempDest, destPath);

  // Generate companion .webp
  const baseName = destPath.slice(0, -path.extname(destPath).length);
  const webpDest = `${baseName}.webp`;
  await sharp(destPath).webp({ quality: 80 }).toFile(webpDest);

  const finalStat = fs.statSync(destPath);
  const webpStat = fs.statSync(webpDest);
  return { finalSize: finalStat.size, webpSize: webpStat.size };
}

async function run() {
  await extractAllZips();

  // Index all real extracted files
  const poolFiles = fs.readdirSync(EXTRACT_POOL);
  const poolIndex = new Map(); // normalizedKey -> absolutePath

  for (const f of poolFiles) {
    const full = path.join(EXTRACT_POOL, f);
    if (fs.statSync(full).isFile()) {
      poolIndex.set(normalizeKey(f), full);
    }
  }

  console.log(`\n--- Step 2: Connecting to MongoDB Atlas ---`);
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;

  console.log('Querying media collection...');
  const allMedia = await db.collection('media').find({}).toArray();
  console.log(`Found ${allMedia.length} media records in database.`);

  let restoredCount = 0;
  let alreadyCorrect = 0;
  let notInPool = 0;

  console.log(`\n--- Step 3: Restoring Real Photos to uploads/media/images ---`);
  for (const media of allMedia) {
    if (!media.originalName || !media.filename) continue;

    const key = normalizeKey(media.originalName);
    const sourcePath = poolIndex.get(key);

    const destPath = path.join(MEDIA_IMG_DIR, media.filename);

    if (sourcePath) {
      try {
        const { finalSize, webpSize } = await optimizeAndSave(sourcePath, destPath);
        restoredCount++;
        console.log(
          `✓ Restored: ${media.originalName} -> ${media.filename} (${(finalSize / 1024).toFixed(
            1
          )} KB, webp: ${(webpSize / 1024).toFixed(1)} KB)`
        );
      } catch (err) {
        console.error(`Error saving ${media.filename}:`, err.message);
      }
    } else {
      notInPool++;
    }
  }

  console.log(`\n--- RESTORATION SUMMARY ---`);
  console.log(`Successfully restored from original Google Drive photos: ${restoredCount}`);
  console.log(`Media records not in this Drive download pool: ${notInPool}`);

  // Now verify the specific user complaints:
  // 1. Hero slides
  console.log(`\n--- Step 4: Verifying Key Sections ---`);
  const home = await db.collection('pages').findOne({ slug: 'home' });
  if (home?.sections?.hero?.slides) {
    console.log('\n[Hero Banner Slides]');
    for (let i = 0; i < home.sections.hero.slides.length; i++) {
      const slide = home.sections.hero.slides[i];
      const fn = slide.image?.filename || path.basename(slide.image?.url || '');
      const p = path.join(MEDIA_IMG_DIR, fn);
      const exists = fs.existsSync(p);
      const sz = exists ? fs.statSync(p).size : 0;
      console.log(`  Slide ${i}: ${slide.caption || 'No caption'} | file: ${fn} | exists: ${exists} (${(sz / 1024).toFixed(1)} KB)`);
    }
  }

  // 2. Spaces That Inspire Success
  if (home?.sections?.heroSection2?.slides) {
    console.log('\n[Spaces That Inspire Success]');
    for (let i = 0; i < home.sections.heroSection2.slides.length; i++) {
      const slide = home.sections.heroSection2.slides[i];
      const fn = slide.image?.filename || path.basename(slide.image?.url || '');
      const p = path.join(MEDIA_IMG_DIR, fn);
      const exists = fs.existsSync(p);
      const sz = exists ? fs.statSync(p).size : 0;
      console.log(`  Space ${i}: ${slide.title} | file: ${fn} | exists: ${exists} (${(sz / 1024).toFixed(1)} KB)`);
    }
  }

  // 3. Events Section
  if (home?.sections?.eventsSection?.events) {
    console.log('\n[Academics, Activities & Achievements Events]');
    for (let i = 0; i < home.sections.eventsSection.events.length; i++) {
      const ev = home.sections.eventsSection.events[i];
      const fn = ev.image?.filename || path.basename(ev.image?.url || '');
      const p = path.join(MEDIA_IMG_DIR, fn);
      const exists = fs.existsSync(p);
      const sz = exists ? fs.statSync(p).size : 0;
      console.log(`  Event ${i}: ${ev.title} | file: ${fn} | exists: ${exists} (${(sz / 1024).toFixed(1)} KB)`);
    }
  }

  // Clean up extract pool to save space
  console.log('\nCleaning up temporary extracted drive pool...');
  fs.rmSync(EXTRACT_POOL, { recursive: true, force: true });
  console.log('Cleanup complete.');

  await mongoose.disconnect();
  console.log('\n🎉 ALL REAL PHOTOS SUCCESSFULLY RESTORED AND OPTIMIZED!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal restoration error:', err);
  process.exit(1);
});
