import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import nodemailer from 'nodemailer';
export const dynamic = 'force-dynamic';
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

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title      = formData.get('title');
    const authorName = formData.get('authorName');
    const email      = formData.get('email');
    const category   = formData.get('category') || 'General';
    const file       = formData.get('file');

    if (!title || !authorName || !email || !file)
      return Response.json({ success:false, error:'جميع الحقول مطلوبة' }, { status:400 });

    if (file.type !== 'application/pdf')
      return Response.json({ success:false, error:'يجب أن يكون الملف PDF فقط' }, { status:400 });

    if (file.size > 20 * 1024 * 1024)
      return Response.json({ success:false, error:'حجم الملف يتجاوز 20 MB' }, { status:400 });

    // حفظ الملف
    const uploadDir = join(process.cwd(), 'public/uploads/research');
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive:true });
    const timestamp     = Date.now();
    const sanitizedName = authorName.replace(/\s+/g, '-').toLowerCase();
    const filename      = `${timestamp}-${sanitizedName}.pdf`;
    const bytes         = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    // حفظ البيانات
    const researchData = {
      id: timestamp, title, authorName, email, category, filename,
      filepath: `/uploads/research/${filename}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      createdAt:   new Date().toISOString(),
    };
    const dataDir  = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) await mkdir(dataDir, { recursive:true });
    const dataFile = join(dataDir, 'abstracts.json');
    let allData = [];
    try { allData = JSON.parse(await readFile(dataFile, 'utf-8')); } catch {}
    allData.push(researchData);
    await writeFile(dataFile, JSON.stringify(allData, null, 2));

    // إيميل للباحث
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
              <p style="margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px">تفاصيل البحث</p>
              <p style="margin:0 0 6px;font-weight:bold;color:#1B365D;font-size:16px">${title}</p>
              <p style="margin:0;color:#94a3b8;font-size:13px">المجال: ${category}</p>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;text-align:center;margin-bottom:20px">
              <p style="color:#166534;margin:0;font-size:14px;font-weight:600">✅ رقم الاستلام: #${timestamp}</p>
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

    // إشعار للجنة
    try {
      await transporter.sendMail({
        from: `"نظام المؤتمر" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `📋 بحث جديد #${timestamp}: ${title}`,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;padding:24px;max-width:600px">
            <h2 style="color:#1B365D;border-bottom:2px solid #D4AF37;padding-bottom:10px">بحث جديد تم استلامه</h2>
            <table style="width:100%;border-collapse:collapse;margin-top:16px">
              <tr style="background:#f8fafc"><td style="padding:10px;color:#64748b;width:120px">الباحث</td><td style="padding:10px;font-weight:bold;color:#1B365D">${authorName}</td></tr>
              <tr><td style="padding:10px;color:#64748b">الإيميل</td><td style="padding:10px">${email}</td></tr>
              <tr style="background:#f8fafc"><td style="padding:10px;color:#64748b">العنوان</td><td style="padding:10px;font-weight:bold">${title}</td></tr>
              <tr><td style="padding:10px;color:#64748b">المجال</td><td style="padding:10px">${category}</td></tr>
              <tr style="background:#f8fafc"><td style="padding:10px;color:#64748b">الوقت</td><td style="padding:10px">${new Date().toLocaleString('ar-EG')}</td></tr>
            </table>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error('❌ Email to admin failed:', mailErr.message);
    }

    return Response.json({
      success: true,
      message: 'تم استلام بحثك بنجاح',
      researchId: timestamp,
      data: researchData
    }, { status:200 });

  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ success:false, error:'حدث خطأ في الخادم', details:error.message }, { status:500 });
  }
}

export async function GET() {
  try {
    const dataFile = join(process.cwd(), 'data/abstracts.json');
    let abstracts = [];
    try { abstracts = JSON.parse(await readFile(dataFile, 'utf-8')); } catch {}
    return Response.json({ success:true, total:abstracts.length, abstracts:abstracts.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)) }, { status:200 });
  } catch (error) {
    return Response.json({ success:false, error:'حدث خطأ', abstracts:[] }, { status:500 });
  }
}

export async function PUT(request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status)
      return Response.json({ success:false, error:'البيانات غير كاملة' }, { status:400 });
    const dataFile = join(process.cwd(), 'data/abstracts.json');
    let abstracts = JSON.parse(await readFile(dataFile, 'utf-8'));
    const index = abstracts.findIndex(a => a.id === parseInt(id));
    if (index === -1)
      return Response.json({ success:false, error:'البحث غير موجود' }, { status:404 });
    abstracts[index].status    = status;
abstracts[index].updatedAt = new Date().toISOString();
await writeFile(dataFile, JSON.stringify(abstracts, null, 2));

const abstract = abstracts[index];
const isAccepted = status === 'accepted';
try {
  await transporter.sendMail({
    from: `"مؤتمر الصمود والاستدامة" <${process.env.EMAIL_USER}>`,
    to: abstract.email,
    subject: isAccepted
      ? '✅ تم قبول بحثك — مؤتمر الباطنة الثاني عشر'
      : '❌ نتيجة تحكيم بحثك — مؤتمر الباطنة الثاني عشر',
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

return Response.json({ success:true, message:'تم تحديث الحالة', data:abstracts[index] }, { status:200 });
  } catch (error) {
    return Response.json({ success:false, error:'حدث خطأ في التحديث' }, { status:500 });
  }
}