import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    const { email, authorName, title, status } = await req.json();

    // إعداد بيانات الخادم (مثلاً Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // إيميل المؤتمر الرسمي
            pass: process.env.EMAIL_PASS, // كلمة مرور التطبيق
        },
    });

    const isAccepted = status === 'accepted';

    const mailOptions = {
        from: '"مؤتمر الأمراض الباطنة" <your-email@gmail.com>',
        to: email,
        subject: isAccepted ? 'تهانينا! تم قبول بحثك العلمي' : 'تحديث بخصوص بحثك العلمي المقدم',
        html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #1B365D;">عزيزي الباحث ${authorName}،</h2>
        <p>نود إعلامكم بأنه تم الانتهاء من مراجعة بحثكم الموسوم بـ:</p>
        <p><strong>"${title}"</strong></p>
        <div style="padding: 15px; background-color: ${isAccepted ? '#e6fffa' : '#fff5f5'}; color: ${isAccepted ? '#2c7a7b' : '#c53030'}; font-weight: bold; text-align: center;">
          الحالة: ${isAccepted ? 'تم قبول البحث للعرض في المؤتمر' : 'نعتذر، لم يتم قبول البحث هذه المرة'}
        </div>
        <p>نتمنى لكم دوام التوفيق.</p>
        <hr>
        <p style="font-size: 0.8rem; color: #888;">هذا إيميل تلقائي من نظام تدقيق الأبحاث - مؤتمر الباطنة الثاني عشر.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}