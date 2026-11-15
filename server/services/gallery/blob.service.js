import { put, getDownloadUrl } from '@vercel/blob';
import { ApiError } from '@/server/lib/apiError';

export async function proxyBlobImage({ blobUrl }) {
  if (!blobUrl) {
    throw new ApiError(400, 'url مطلوب');
  }

  // ✅ إصلاح double encoding
  let cleanUrl = blobUrl;
  try {
    // لو فيها %25 يعني double encoded
    if (cleanUrl.includes('%25')) {
      cleanUrl = decodeURIComponent(cleanUrl);
    }
    // لو لسا فيها %25 بعد أول decode، نعمل decode مرة ثانية
    if (cleanUrl.includes('%25')) {
      cleanUrl = decodeURIComponent(cleanUrl);
    }
  } catch {
    cleanUrl = blobUrl;
  }

  // ✅ Vercel Blob public URLs لا تحتاج token في الـ URL
  const response = await fetch(cleanUrl);

  if (!response.ok) {
    // محاولة ثانية بالـ token لو كان الـ blob private
    const urlWithToken = `${cleanUrl}?token=${process.env.BLOB_READ_WRITE_TOKEN}`;
    const retryResponse = await fetch(urlWithToken);

    if (!retryResponse.ok) {
      throw new Error(`${retryResponse.status} ${retryResponse.statusText}`);
    }

    const buffer = await retryResponse.arrayBuffer();
    const contentType = retryResponse.headers.get('content-type') || 'image/jpeg';
    return { buffer, contentType };
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
    type: isVideo ? 'video' : 'image',
  };
}