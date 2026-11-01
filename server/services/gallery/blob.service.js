import { put, getDownloadUrl } from '@vercel/blob';
import { ApiError } from '@/server/lib/apiError';

export async function proxyBlobImage({ blobUrl }) {
  if (!blobUrl) {
    throw new ApiError(400, 'url مطلوب');
  }

  const urlWithToken = `${blobUrl}?token=${process.env.BLOB_READ_WRITE_TOKEN}`;
  const response = await fetch(urlWithToken);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';

  return { buffer, contentType };
}

export async function createSignedUrl({ blobUrl }) {
  if (!blobUrl) {
    throw new ApiError(400, { error: 'url مطلوب' });
  }

  const { url } = await getDownloadUrl(blobUrl, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
    expiresIn: 3600,
  });

  return { signedUrl: url };
}

// 💡 توسيع الأنواع المسموحة لتشمل الصور والفيديوهات الكبيرة
const ALLOWED_MEDIA_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'
];

export async function uploadGalleryImage({ file }) {
  if (!file || typeof file === 'string') {
    throw new ApiError(400, { error: 'لم يتم العثور على ملف مرفوع' });
  }

  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    throw new ApiError(400, { error: 'نوع الملف غير مدعوم. يرجى رفع صورة أو فيديو صالح.' });
  }

  // 💡 تحديد ما إذا كان الملف فيديو أم صورة لتخزينه بالمسار المناسب
  const isVideo = file.type.startsWith('video/');
  const folder = isVideo ? 'gallery/videos' : 'gallery/images';
  const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

  const blob = await put(filename, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN || process.env.PUBLIC_BLOB_READ_WRITE_TOKEN,
  });

  const generatedUrl = blob.url;

  return {
    success: true,
    url: generatedUrl,
    imageUrl: generatedUrl,
    image: generatedUrl,
    link: generatedUrl,
    path: generatedUrl,
    type: isVideo ? 'video' : 'image', // 💡 إرجاع النوع تلقائياً للداشبورد
  };
}