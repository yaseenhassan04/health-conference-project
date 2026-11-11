import { put, list, del } from '@vercel/blob';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const data = readFileSync('./gallery-db.json', 'utf8');
const token = process.env.BLOB_READ_WRITE_TOKEN;

const { blobs } = await list({ prefix: 'gallery/db', token });
if (blobs.length) {
  await Promise.all(blobs.map(b => del(b.url, { token })));
  console.log('حذف القديم ✓');
}

await put('gallery/db.json', data, {
  access: 'public',
  contentType: 'application/json',
  addRandomSuffix: false,
  allowOverwrite: true,
  token,
});

console.log('✅ تم الاسترجاع!');