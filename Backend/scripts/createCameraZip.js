import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const pool = path.resolve('original_camera_photos');
if (fs.existsSync(pool)) fs.rmSync(pool, { recursive: true, force: true });
fs.mkdirSync(pool, { recursive: true });

const zips = [
  'drive-download-20260923T013301Z-1-001.zip',
  'drive-download-20260923T013401Z-1-001.zip',
  'drive-download-20260923T021416Z-1-001.zip',
  'drive-download-20260923T023057Z-1-001.zip',
  'drive-download-20260923T030410Z-1-001.zip'
];

for (const z of zips) {
  const p = path.join('C:/Users/rahul/Downloads', z);
  if (fs.existsSync(p)) {
    console.log(`Extracting ${z}...`);
    try {
      execSync(`tar -xf "${p}" -C "${pool}"`);
    } catch (e) {
      console.warn('tar error:', e.message);
    }
  }
}

const desktop = 'C:/Users/rahul/OneDrive/Desktop';
['library-Photo.jpg', 'IMG_8603 (1).JPG', '1790082082090-334929245.jpg'].forEach(f => {
  const src = path.join(desktop, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(pool, f));
  }
});

const files = fs.readdirSync(pool);
console.log(`Total original camera photos assembled: ${files.length}`);
console.log('Creating recovered_original_camera_photos.zip...');
execSync(`tar -a -cf recovered_original_camera_photos.zip original_camera_photos`);
fs.rmSync(pool, { recursive: true, force: true });
console.log('Created recovered_original_camera_photos.zip successfully!');
