import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('Backend/.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const pages = await mongoose.connection.db.collection('pages').find({}).toArray();
  for (const p of pages) {
    const sKeys = p.sections ? Object.keys(p.sections) : [];
    const matched = sKeys.filter(k => k.toLowerCase().includes('event') || k.toLowerCase().includes('gallery'));
    if (matched.length > 0 || (p.slug && p.slug.includes('event'))) {
      console.log(`Page: slug="${p.slug}", title="${p.title}"`);
      for (const m of matched) {
        console.log(`  Section "${m}":`);
        const sec = p.sections[m];
        if (sec.events) {
          console.log(`    events count: ${sec.events.length}`);
          sec.events.slice(0, 3).forEach((ev, i) => {
            console.log(`      [${i}] ${ev.title} | images: ${ev.images?.length || 0} | image: ${ev.image?.url || ev.image?.filename || 'none'}`);
            if (ev.images && ev.images.length > 0) {
              console.log(`         first 2 images:`, ev.images.slice(0, 2).map(im => im.url || im.filename));
            }
          });
        }
        if (sec.galleries) {
          console.log(`    galleries count: ${sec.galleries.length}`);
          sec.galleries.forEach((g, i) => {
            console.log(`      gallery [${i}] "${g.title}" | images: ${g.images?.length || 0}`);
            if (g.images && g.images.length > 0) {
              console.log(`         first 3 images:`, g.images.slice(0, 3).map(im => im.media?.url || im.media?.filename || im.url));
            }
          });
        }
      }
    }
  }
  await mongoose.disconnect();
}

run().catch(console.error);
