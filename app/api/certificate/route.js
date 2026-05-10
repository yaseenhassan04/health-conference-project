import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email parameter is missing' }), { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found or not registered' }), { status: 404 });
    }

    // Generate QR Code
    const verificationUrl = `http://localhost:3000/verify?id=${user.id}`;
    const qrImage = await QRCode.toDataURL(verificationUrl); // Data URL base64

    // Create PDF Document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([800, 600]);

    // Simple Template
    page.drawText('المؤتمر العلمي الاول لطب الباطنة', { x: 300, y: 500, size: 24, color: rgb(0.06, 0.72, 0.5) }); // primary color
    page.drawText('Certificate of Attendance', { x: 280, y: 450, size: 30, color: rgb(0, 0, 0) });
    
    page.drawText('This is to certify that', { x: 330, y: 380, size: 18, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(user.fullName, { x: 300, y: 330, size: 28, color: rgb(0.1, 0.1, 0.1) });

    page.drawText('has attended the First Internal Medicine Scientific Conference', { x: 180, y: 280, size: 16, color: rgb(0.4, 0.4, 0.4) });
    page.drawText('Resilience & Sustainability - Gaza', { x: 260, y: 250, size: 16, color: rgb(0.4, 0.4, 0.4) });

    // Embed QR Code
    const qrImageBytes = Buffer.from(qrImage.split(',')[1], 'base64');
    const qrPdfImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrPdfImage, {
      x: 350,
      y: 80,
      width: 100,
      height: 100,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Certificate_${user.id}.pdf`
      }
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
