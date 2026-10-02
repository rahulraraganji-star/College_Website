import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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
    try {
      const output = execSync(`tar -tf "${p}"`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      const files = output.split('\n').map(s => s.trim()).filter(Boolean);
      console.log(`\n=== ${z} ===`);
      console.log(`Total files: ${files.length}`);
      console.log('Sample files:', files.slice(0, 10));
    } catch (e) {
      console.error(`Error reading ${z}:`, e.message);
    }
  }
}
