/**
 * Run this once to create a sample lesson in the SQLite DB.
 * Usage: node init_seed.js
 */
const db = require('./db');

async function seed() {
  await db.init();
  const sample = await db.createLesson({
    title: 'Wonderwall (Acoustic Cover) - Song Lesson',
    description: 'A step-by-step lesson covering rhythm, chords, and strumming patterns.',
    price: 9.99,
    topics: [
      { id: 't1', title: 'Introduction & Overview', description: 'What we will cover', videoPath: 'wonderwall_intro.mp4' },
      { id: 't2', title: 'Chords & Positions', description: 'Finger positions and transitions', videoPath: 'wonderwall_chords.mp4' },
      { id: 't3', title: 'Full Playthrough', description: 'Slow playthrough with tabs', videoPath: 'wonderwall_full.mp4' }
    ]
  });

  console.log('Seeded lesson:', sample);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
