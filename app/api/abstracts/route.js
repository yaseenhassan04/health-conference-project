import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client'; // استيراد الـ Prisma للتعامل مع قاعدة البيانات الحقيقية

const prisma = new PrismaClient();
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

    // 1️⃣ تعديل مسار الحفظ ليكون في مجلد الـ /tmp المسموح به في Vercel
    const uploadDir = '/tmp'; 
    const timestamp     = Date.now();
    const sanitizedName = authorName.replace(/\s+/g, '-').toLowerCase();
    const filename      = `${timestamp}-${sanitizedName}.pdf`;
    const bytes         = await file.arrayBuffer();
    const fullFilePath  = join(uploadDir, filename);
    
    // كتابة الملف مؤقتاً في السيرفر السحابي
    await writeFile(fullFilePath, Buffer.from(bytes));

    // 2️⃣ الحفظ الاحترافي والآمن داخل قاعدة بيانات Aiven MySQL عبر Prisma
    // (ملاحظة: تأكد أن أسماء الحقول تتطابق مع الـ schema.prisma لديك)
    const researchData = await prisma.abstract.create({
      data: {
        title,
        authorName,
        email,
        category,
        filename,
        filepath: `/api/download/${filename}`, // مسار افتراضي أو يمكنك تركه كما يحب مشروعك
        status: 'pending',
      }
    });

    // 3️⃣ إرسال الإيميل للباحث (مع إرفاق ملف الـ PDF كنسخة احتياطية إذا رغبت)
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

    // 4️⃣ إشعار للجنة (مع إرفاق البحث الفعلي مباشرة كـ Attachment حتى يستطيعوا قراءته!)
    try {
      await transporter.sendMail({
        from: `"نظام المؤتمر" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `📋 بحث جديد #${researchData.id}: ${title}`,
        attachments: [
          {
            filename: filename,
            path: fullFilePath // إرسال الملف المكتوب في الـ /tmp مباشرة عبر الإيميل
          }
        ],
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;padding:24px;max-width:600px">
            <h2 style="color:#1B365D;border-bottom:2px solid #D4AF37;padding-bottom:10px">بحث جديد تم استلامه (الملف مرفق بالإيميل)</h2>
            <table style="width:100%;border-collapse:collapse;margin-top:16px">
              <tr style="background:#f8fafc"><td style="padding:10px;color:#64748b;width:120px">الباحث</td><td style="padding:10px;font-weight:bold;color:#1B365D">${authorName}</td></tr>
              <tr><td style="padding:10px;color:#64748b">الإيميل</td><td style="padding:10px">${email}</td></tr>
              <tr style="background:#f8fafc"><td style="padding:10px;color:#64748b">العنوان</td><td style="padding:10px;font-weight:bold">${title}</td></tr>
              <tr><td style="padding:10px;color:#64748b">المجال</td><td style="padding:10px">${category}</td></tr>
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
      researchId: researchData.id,
      data: researchData
    }, { status:200 });

  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ success:false, error:'حدث خطأ في الخادم', details:error.message }, { status:500 });
  }
}

export async function GET() {
  try {
    // جلب البيانات من الداتابيز مباشرة وترتيبها من الأحدث للأقدم
    const abstracts = await prisma.abstract.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return Response.json({ success:true, total:abstracts.length, abstracts }, { status:200 });
  } catch (error) {
    return Response.json({ success:false, error:'حدث خطأ في جلب البيانات', abstracts:[] }, { status:500 });
  }
}

export async function PUT(request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status)
      return Response.json({ success:false, error:'البيانات غير كاملة' }, { status:400 });

    // تحديث الحالة في قاعدة البيانات الحقيقية
    const abstract = await prisma.abstract.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    const isAccepted = status === 'accepted';
    try {
      await transporter.sendMail({
        from: `"مؤتمر الصمود والاستدامة" <${process.env.EMAIL_USER}>`,
        to: abstract.email,
        subject: isAccepted ? '✅ تم قبول بحثك — مؤتمر الباطنة الثاني عشر' : '❌ نتيجة تحكيم بحثك — مؤتمر الباطنة الثاني عشر',
        html: ``
      });
    } catch (mailErr) {
      console.error('❌ Status email failed:', mailErr.message);
    }

    return Response.json({ success:true, message:'تم تحديث الحالة', data:abstract }, { status:200 });
  } catch (error) {
    return Response.json({ success:false, error:'حدث خطأ في التحديث' }, { status:500 });
  }
}