import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter is missing' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: 'User not found or not registered' }, { status: 404 });
    }

    // 1️⃣ حل مشكلة الدومين المحلي: توليد رابط التحقق ديناميكياً حسب بيئة التشغيل المستضيفة
    const host = req.headers.get('host') || 'health-conference.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const verificationUrl = `${protocol}://${host}/verify?id=${user.id}`;
    
    // توليد كود الـ QR
    const qrImage = await QRCode.toDataURL(verificationUrl); // Data URL base64

    // 2️⃣ بناء كائن الـ PDF باحترافية
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([800, 600]);

    // رسم خلفية جمالية أو إطار خارجي لحواف الشهادة لتبدو رسمية
    page.drawRectangle({
      x: 20,
      y: 20,
      width: 760,
      height: 560,
      borderColor: rgb(0.06, 0.32, 0.6), // اللون الأزرق الملكي للمؤتمر
      borderWidth: 3,
    });

    // رسم العناوين (تجنب الحروف العربية المقلوبة في المحركات الأساسية لـ pdf-lib)
    page.drawText('The 12th International Medicine Scientific Conference', { 
      x: 180, 
      y: 500, 
      size: 20, 
      color: rgb(0.06, 0.32, 0.6) 
    });
    
    page.drawText('Resilience & Sustainability - Gaza', { 
      x: 275, 
      y: 465, 
      size: 15, 
      color: rgb(0.83, 0.69, 0.22) // اللون الذهبي الشرفي
    });

    page.drawText('CERTIFICATE OF ATTENDANCE', { 
      x: 210, 
      y: 390, 
      size: 28, 
      color: rgb(0, 0, 0) 
    });
    
    page.drawText('This is to certify that', { 
      x: 330, 
      y: 330, 
      size: 16, 
      color: rgb(0.4, 0.4, 0.4) 
    });

    // طباعة اسم الطبيب أو الباحث مكبراً في المنتصف بدقة
    const nameWidth = user.fullName.length * 10; // حساب تقريبي للمحاذاة المركزية
    const startX = Math.max(100, 400 - (nameWidth / 2));
    
    page.drawText(user.fullName, { 
      x: startX, 
      y: 270, 
      size: 26, 
      color: rgb(0.1, 0.1, 0.1) 
    });

    page.drawText('has actively attended and participated in the conference activities', { 
      x: 175, 
      y: 210, 
      size: 15, 
      color: rgb(0.4, 0.4, 0.4) 
    });

    // طباعة الرقم التسلسلي للشهادة للتوثيق
    page.drawText(`Certificate ID: ID-${user.id}`, {
      x: 40,
      y: 50,
      size: 11,
      color: rgb(0.6, 0.6, 0.6)
    });

    // 3️⃣ معالجة وإدراج رمز الـ QR الذكي في أسفل يمين الشهادة
    const qrImageBytes = Buffer.from(qrImage.split(',')[1], 'base64');
    const qrPdfImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrPdfImage, {
      x: 650,
      y: 50,
      width: 90,
      height: 90,
    });

    // 4️⃣ استخراج وحفظ مخرجات الـ PDF النهائية
    const pdfBytes = await pdfDoc.save();

    // تصدير الملف كاستجابة تحميل مباشرة للمتصفح (Binary Stream)
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Certificate_${user.id}.pdf`,
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    console.error('Certificate Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}