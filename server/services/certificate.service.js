import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

export async function generateCertificate({ email, host }) {
  if (!email) {
    throw new ApiError(400, { error: 'Email parameter is missing' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    throw new ApiError(404, { error: 'User not found or not registered' });
  }

  // 1️⃣ حل مشكلة الدومين المحلي: توليد رابط التحقق ديناميكياً حسب بيئة التشغيل المستضيفة
  const resolvedHost = host || 'health-conference.vercel.app';
  const protocol = resolvedHost.includes('localhost') ? 'http' : 'https';
  const verificationUrl = `${protocol}://${resolvedHost}/verify?id=${user.id}`;

  const qrImage = await QRCode.toDataURL(verificationUrl);

  // 2️⃣ بناء كائن الـ PDF باحترافية
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([800, 600]);

  page.drawRectangle({
    x: 20,
    y: 20,
    width: 760,
    height: 560,
    borderColor: rgb(0.06, 0.32, 0.6),
    borderWidth: 3,
  });

  page.drawText('The 12th International Medicine Scientific Conference', {
    x: 180,
    y: 500,
    size: 20,
    color: rgb(0.06, 0.32, 0.6),
  });

  page.drawText('Resilience & Sustainability - Gaza', {
    x: 275,
    y: 465,
    size: 15,
    color: rgb(0.83, 0.69, 0.22),
  });

  page.drawText('CERTIFICATE OF ATTENDANCE', {
    x: 210,
    y: 390,
    size: 28,
    color: rgb(0, 0, 0),
  });

  page.drawText('This is to certify that', {
    x: 330,
    y: 330,
    size: 16,
    color: rgb(0.4, 0.4, 0.4),
  });

  const nameWidth = user.fullName.length * 10;
  const startX = Math.max(100, 400 - nameWidth / 2);

  page.drawText(user.fullName, {
    x: startX,
    y: 270,
    size: 26,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText('has actively attended and participated in the conference activities', {
    x: 175,
    y: 210,
    size: 15,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`Certificate ID: ID-${user.id}`, {
    x: 40,
    y: 50,
    size: 11,
    color: rgb(0.6, 0.6, 0.6),
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

  const pdfBytes = await pdfDoc.save();

  return { pdfBytes, userId: user.id };
}
