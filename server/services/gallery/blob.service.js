import { put, getDownloadUrl } from '@vercel/blob';
import { ApiError } from '@/server/lib/apiError';

export async function proxyBlobImage({ blobUrl }) {
  if (!blobUrl) {
    throw new ApiError(400, 'url مطلوب');
  }

  // ✅ أضف التوكن كـ query parameter — هذي الطريقة الرسمية لـ Vercel private blobs
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
    expiresIn: 3600, // ساعة واحدة
  });

  return { signedUrl: url };
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadGalleryImage({ file }) {
  if (!file || typeof file === 'string') {
    throw new ApiError(400, { error: 'لم يتم العثور على ملف مرفوع' });
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ApiError(400, { error: 'نوع الملف غير مدعوم' });
  }

  const filename = `${Date.now()}-${file.name}`;

  const blob = await put(filename, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN || process.env.PUBLIC_BLOB_READ_WRITE_TOKEN,
  });

  const generatedUrl = blob.url;

  // 💡 الحل السحري: إرجاع الرابط بكل المسميات المحتملة التي قد يتوقعها الفرونت إند
  return {
    success: true,
    url: generatedUrl,
    imageUrl: generatedUrl,
    image: generatedUrl,
    link: generatedUrl,
    path: generatedUrl,
  };
}
