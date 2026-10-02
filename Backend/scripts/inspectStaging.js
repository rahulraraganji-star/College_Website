async function compareImages() {
  const urls = [
    { name: 'Hero Slide 0', url: 'https://staging.fragnelcollege.edu.in/uploads/media/images/1790130034742-81706013.JPG' },
    { name: 'Hero Slide 1', url: 'https://staging.fragnelcollege.edu.in/uploads/media/images/1790136656458-84895324.jpeg' },
    { name: 'Hero Slide 2', url: 'https://staging.fragnelcollege.edu.in/uploads/media/images/1785503824800-588579084.jpg' },
    { name: 'Hero Slide 3', url: 'https://staging.fragnelcollege.edu.in/uploads/media/images/1790081891396-262704273.JPG' },
    { name: 'Hero Slide 4', url: 'https://staging.fragnelcollege.edu.in/uploads/media/images/1790136552161-950275272.jpg' },
    { name: 'Spaces Slide', url: 'https://staging.fragnelcollege.edu.in/uploads/media/images/1790006208612-312009554.jpg' },
    { name: 'Event Card 1', url: 'https://staging.fragnelcollege.edu.in/uploads/media/images/1790008750683-695357220.JPG' },
    { name: 'Event Card 2', url: 'https://staging.fragnelcollege.edu.in/uploads/media/images/1790128539099-585941996.JPG' },
    { name: 'Event Card 3', url: 'https://staging.fragnelcollege.edu.in/uploads/media/images/1790128641130-917284650.JPG' }
  ];

  for (const item of urls) {
    const resDesk = await fetch(item.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const bufDesk = Buffer.from(await resDesk.arrayBuffer());

    const resMob = await fetch(item.url, {
      headers: {
        'Accept': 'image/webp,*/*',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    const bufMob = Buffer.from(await resMob.arrayBuffer());

    console.log(`\n=== ${item.name} ===`);
    console.log(`URL: ${item.url}`);
    console.log(`  Desktop: ${resDesk.status} ${resDesk.headers.get('content-type')} size=${bufDesk.length} bytes`);
    console.log(`  Mobile:  ${resMob.status} ${resMob.headers.get('content-type')} size=${bufMob.length} bytes`);
  }
}

compareImages().catch(console.error);
