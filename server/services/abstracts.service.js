import { put } from '@vercel/blob';
import nodemailer from 'nodemailer';
import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// تهريب رموز HTML لحماية قالب الإيميل من كسر التنسيق عند كتابة رسالة فيها < > & أو "
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function submitAbstract({ title, authorName, email, category, file }) {
  if (!title || !authorName || !email || !file) {
    throw new ApiError(400, { success: false, error: 'جميع الحقول مطلوبة' });
  }

  if (file.type !== 'application/pdf') {
    throw new ApiError(400, { success: false, error: 'يجب أن يكون الملف PDF فقط' });
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new ApiError(400, { success: false, error: 'حجم الملف يتجاوز 20 MB' });
  }

  // 1️⃣ تحويل الملف إلى Buffer في الذاكرة لقراءته للإيميل وللرفع السحابي
  const bytes = await file.arrayBuffer();
  const fileBuffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const sanitizedName = authorName.replace(/\s+/g, '-').toLowerCase();
  const filename = `${timestamp}-${sanitizedName}.pdf`;

  // 2️⃣ الرفع السحابي المستقر إلى Vercel Blob (الملف لن يختفي أبداً)
  const blob = await put(`abstracts/${filename}`, fileBuffer, {
    access: 'public',
    token: process.env.PUBLIC_BLOB_READ_WRITE_TOKEN,
  });

  // 3️⃣ الحفظ في قاعدة البيانات برابط سحابي دائم (blob.url)
  const researchData = await prisma.abstract.create({
    data: {
      title: title.trim(),
      authorName: authorName.trim(),
      email: email.trim().toLowerCase(),
      category: (category || 'General').trim(),
      pdfUrl: blob.url,
      status: 'PENDING',
    },
  });

  // 4️⃣ إرسال إيميل تأكيدي للباحث
  try {
    await transporter.sendMail({
      from: `"مؤتمر الصمود والاستدامة" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ تم استلام بحثك — مؤتمر الباطنة الثاني عشر',
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:16px">
          <div style="background:#1B365D;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
            <h1 style="color:#D4AF37;margin:0;font-size:22px">مؤتمر الصمود والاستدامة</h1>
            <p style="color:#94a3b8;margin:8px 0 0;font-size:13px">The 12th Conference of Internal Medicine</p>
          </div>
          <h2 style="color:#1B365D;margin:0 0 12px">مرحباً د. ${authorName}،</h2>
          <p style="color:#475569;line-height:1.8;margin-bottom:20px">
            تم استلام بحثك بنجاح وسيتم مراجعته من قبل اللجنة العلمية. سيصلك إشعار بنتيجة التحكيم قريباً.
          </p>
          <div style="background:#fff;border:1px solid #e2e8f0;border-right:4px solid #1B365D;border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="margin:0 0 6px;color:#64748b;font-size:12px">تفاصيل البحث</p>
            <p style="margin:0 0 6px;font-weight:bold;color:#1B365D;font-size:16px">${title}</p>
            <p style="margin:0;color:#94a3b8;font-size:13px">المجال: ${category}</p>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;text-align:center;margin-bottom:20px">
            <p style="color:#166534;margin:0;font-size:14px;font-weight:600">✅ رقم الاستلام: #${researchData.id}</p>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">
            © 2026 مؤتمر الصمود والاستدامة الطبي — غزة
          </p>
        </div>
      `,
    });
  } catch (mailErr) {
    console.error('❌ Email to researcher failed:', mailErr.message);
  }

  // 5️⃣ إشعار للجنة مع إرفاق الملف مباشرة من الـ Buffer بالذاكرة (بدون قراءة من الهارددسك)
  try {
    await transporter.sendMail({
      from: `"نظام المؤتمر" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📋 بحث جديد #${researchData.id}: ${title}`,
      attachments: [
        {
          filename: file.name || filename,
          content: fileBuffer,
        },
      ],
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;padding:24px;max-width:600px">
          <h2 style="color:#1B365D;border-bottom:2px solid #D4AF37;padding-bottom:10px">بحث جديد تم استلامه (الملف مرفق بالإيميل)</h2>
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <tr style="background:#f8fafc"><td style="padding:10px;color:#64748b;width:120px">الباحث</td><td style="padding:10px;font-weight:bold;color:#1B365D">${authorName}</td></tr>
            <tr><td style="padding:10px;color:#64748b">الإيميل</td><td style="padding:10px">${email}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px;color:#64748b">العنوان</td><td style="padding:10px;font-weight:bold">${title}</td></tr>
            <tr><td style="padding:10px;color:#64748b">المجال</td><td style="padding:10px">${category}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px;color:#64748b">رابط التحميل السحابي</td><td style="padding:10px"><a href="${blob.url}" target="_blank">اضغط هنا لفتح الملف</a></td></tr>
          </table>
        </div>
      `,
    });
  } catch (mailErr) {
    console.error('❌ Email to admin failed:', mailErr.message);
  }

  return {
    success: true,
    message: 'تم استلام بحثك بنجاح للرفع السحابي',
    researchId: researchData.id,
    data: researchData,
  };
}

export async function listAbstracts() {
  const abstracts = await prisma.abstract.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return { success: true, total: abstracts.length, abstracts };
}

// يستقبل الآن رسالة اختيارية (note) من اللجنة تُدرج داخل إيميل القبول/الرفض
export async function updateAbstractStatus({ id, status, note }) {
  if (!id || !status) {
    throw new ApiError(400, { success: false, error: 'البيانات غير كاملة' });
  }

  const updatedStatus = status.toUpperCase();
  const targetId = isNaN(id) ? id : parseInt(id);

  const abstract = await prisma.abstract.update({
    where: { id: targetId },
    data: { status: updatedStatus },
  });

  const cleanNote = (note || '').trim();

  try {
    const isAccepted = updatedStatus === 'ACCEPTED';

    // كتلة الرسالة المخصّصة — تظهر فقط إذا كتبت اللجنة رسالة
    const customNoteBlock = cleanNote
      ? `
        <div style="background:#fff;border:1px solid #e2e8f0;border-right:4px solid #D4AF37;border-radius:12px;padding:18px;margin-bottom:20px">
          <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700">رسالة من اللجنة العلمية</p>
          <p style="margin:0;color:#334155;line-height:1.8;font-size:14px;white-space:pre-wrap">${escapeHtml(cleanNote)}</p>
        </div>
      `
      : '';

    await transporter.sendMail({
      from: `"مؤتمر الصمود والاستدامة" <${process.env.EMAIL_USER}>`,
      to: abstract.email,
      subject: isAccepted ? '✅ تم قبول بحثك — مؤتمر الباطنة الثاني عشر' : '❌ نتيجة تحكيم بحثك — مؤتمر الباطنة الثاني عشر',
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:16px">
          <div style="background:#1B365D;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
            <h1 style="color:#D4AF37;margin:0;font-size:22px">مؤتمر الصمود والاستدامة</h1>
            <p style="color:#94a3b8;margin:8px 0 0;font-size:13px">The 12th Conference of Internal Medicine</p>
          </div>
          <h2 style="color:#1B365D;margin:0 0 12px">مرحباً د. ${abstract.authorName}،</h2>
          <p style="color:#475569;line-height:1.8;margin-bottom:20px">
            ${isAccepted
              ? 'يسعدنا إبلاغك بأن اللجنة العلمية قد <strong>قبلت بحثك</strong> للعرض في المؤتمر.'
              : 'نشكرك على تقديم بحثك. بعد مراجعة اللجنة العلمية، <strong>لم يتم قبول البحث</strong> في هذه الدورة.'}
          </p>
          ${customNoteBlock}
          <div style="background:#fff;border:1px solid #e2e8f0;border-right:4px solid ${isAccepted ? '#10B981' : '#C8102E'};border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="margin:0 0 6px;color:#64748b;font-size:12px">تفاصيل البحث</p>
            <p style="margin:0 0 6px;font-weight:bold;color:#1B365D">${abstract.title}</p>
            <p style="margin:0;color:#94a3b8;font-size:13px">رقم الاستلام: #${abstract.id}</p>
          </div>
          <div style="background:${isAccepted ? '#f0fdf4' : '#fef2f2'};border:1px solid ${isAccepted ? '#bbf7d0' : '#fecaca'};border-radius:10px;padding:14px;text-align:center">
            <p style="color:${isAccepted ? '#166534' : '#7F1D1D'};margin:0;font-size:15px;font-weight:700">
              ${isAccepted ? '✅ مقبول' : '❌ غير مقبول'}
            </p>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:20px">
            © 2026 مؤتمر الصمود والاستدامة الطبي — غزة
          </p>
        </div>
      `,
    });
  } catch (mailErr) {
    console.error('❌ Status email failed:', mailErr.message);
  }

  return { success: true, message: 'تم تحديث الحالة', data: abstract };
}

export async function updateAbstractStatusById({ id, status }) {
  if (!status) {
    throw new ApiError(400, { error: 'Status is required' });
  }

  const updated = await prisma.abstract.update({
    where: { id: parseInt(id) },
    data: { status },
  });

  return { abstract: updated };
}