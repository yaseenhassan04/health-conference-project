import nodemailer from 'nodemailer';
import { ApiError } from '@/server/lib/apiError';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendAbstractStatusEmail({ email, authorName, title, status }) {
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
    return { message: 'Email sent successfully' };
  } catch (error) {
    throw new ApiError(500, { error: 'Failed to send email' });
  }
}
