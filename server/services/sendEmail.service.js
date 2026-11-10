import nodemailer from 'nodemailer';
import dns from 'node:dns';
import { ApiError } from '@/server/lib/apiError';

/* ------------------------------------------------------------------ */
/* Transporter (يتصل بعنوان IPv4 مباشرة لتجاوز مشكلة ENETUNREACH)       */
/* ------------------------------------------------------------------ */
// لو المنفذ 465 محجوب على الشبكة، غيّر EMAIL_PORT=587 في ملف .env
const SMTP_HOST = 'smtp.gmail.com';
const PORT = Number(process.env.EMAIL_PORT) || 465;

let transporterPromise = null;

async function createTransporter() {
  // نحصل على عنوان IPv4 فقط، ثم نتصل به مباشرة
  const { address } = await dns.promises.lookup(SMTP_HOST, { family: 4 });

  return nodemailer.createTransport({
    host: address,                 // عنوان IPv4 مباشر
    port: PORT,
    secure: PORT === 465,          // 465 = SSL مباشر ، 587 = STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { servername: SMTP_HOST }, // ضروري لتطابق شهادة Gmail
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((err) => {
      transporterPromise = null; // نسمح بإعادة المحاولة لاحقاً
      throw err;
    });
  }
  return transporterPromise;
}

const SENDER_NAME = 'المؤتمر الثاني عشر لأمراض الباطنة';
const FROM = `"${SENDER_NAME}" <${process.env.EMAIL_USER}>`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
// حماية من حقن HTML داخل الاسم أو الملاحظة
const esc = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

// يحوّل أسطر الملاحظة إلى <br> بعد عمل escape
const nl2br = (value = '') => esc(value).replace(/\r?\n/g, '<br/>');

async function deliver({ to, subject, html }) {
  try {
    const transporter = await getTransporter();
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (error) {
    console.error('sendMail error:', error);
    throw new Error(error.message || 'Failed to send email');
  }
}

/* ------------------------------------------------------------------ */
/* 1) إيميل حالة البحث العلمي                                          */
/* ------------------------------------------------------------------ */
export async function sendAbstractStatusEmail({ email, authorName, title, status }) {
  const isAccepted = status === 'accepted';

  const subject = isAccepted
    ? 'تهانينا! تم قبول بحثك العلمي'
    : 'تحديث بخصوص بحثك العلمي المقدم';

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #1B365D;">عزيزي الباحث ${esc(authorName)}،</h2>
      <p>نود إعلامكم بأنه تم الانتهاء من مراجعة بحثكم الموسوم بـ:</p>
      <p><strong>"${esc(title)}"</strong></p>
      <div style="padding: 15px; background-color: ${isAccepted ? '#e6fffa' : '#fff5f5'}; color: ${isAccepted ? '#2c7a7b' : '#c53030'}; font-weight: bold; text-align: center;">
        الحالة: ${isAccepted ? 'تم قبول البحث للعرض في المؤتمر' : 'نعتذر، لم يتم قبول البحث هذه المرة'}
      </div>
      <p>نتمنى لكم دوام التوفيق.</p>
      <hr>
      <p style="font-size: 0.8rem; color: #888;">هذا إيميل تلقائي من نظام تدقيق الأبحاث - مؤتمر الباطنة الثاني عشر.</p>
    </div>
  `;

  try {
    await deliver({ to: email, subject, html });
    return { message: 'Email sent successfully' };
  } catch (error) {
    throw new ApiError(500, { error: 'Failed to send email' });
  }
}

/* ------------------------------------------------------------------ */
/* 2) إيميل حالة تسجيل المؤتمر (قبول / رفض)                            */
/*    هذا هو القسم المسؤول عن تصميم كارت الإيميل                        */
/* ------------------------------------------------------------------ */

// ألوان الهوية البصرية (نفس ألوان الموقع)
const BRAND = {
  navy: '#0D1B2A',
  gold: '#D4AF37',
  goldLight: '#F4D78B',
  bg: '#F7F9FC',
  border: '#E6EBF1',
  slate: '#2C3E50',
};

const FONT = "'Cairo','Tajawal','Segoe UI',Tahoma,Arial,sans-serif";

// رابط الشعار: يجب أن يكون رابط https عام (ليس localhost) ليظهر عند المستلم
// مثال: EMAIL_LOGO_URL=https://your-domain.com/logo.png
const LOGO_URL = process.env.EMAIL_LOGO_URL || '';

const CONFERENCE = {
  nameAr: 'المؤتمر العلمي الثاني عشر لأمراض الباطنة',
  nameEn: 'The 12th Conference of Internal Medicine',
  org: 'مجمع ناصر الطبي – غزة',
  date: '5–6 ديسمبر 2026',
  venue: 'فندق إيفان – غزة',
};

export async function sendConferenceStatusEmail({
  to,
  fullName,
  regNumber,
  decision,
  adminNote,
}) {
  const isApproved = decision === 'APPROVED';

  const subject = isApproved
    ? `تأكيد قبول التسجيل – ${CONFERENCE.nameAr}`
    : `تحديث حالة طلب التسجيل – ${CONFERENCE.nameAr}`;

  const preheader = isApproved
    ? 'تمت الموافقة على طلب تسجيلكم. رقم التسجيل بداخل الرسالة.'
    : 'تحديث بخصوص طلب تسجيلكم في المؤتمر.';

  /* ---------- شعار أو زخرفة بديلة ---------- */
  const emblem = LOGO_URL
    ? `<img src="${esc(LOGO_URL)}" alt="${esc(CONFERENCE.nameAr)}" width="84" style="display:block;margin:0 auto;border:0;outline:none;max-width:84px;height:auto;" />`
    : `<div style="color:${BRAND.gold};font-size:18px;letter-spacing:10px;line-height:1;">&#9670; &#9670; &#9670;</div>`;

  /* ---------- شارة الحالة (بنفس أسلوب شارات الرعاة) ---------- */
  const badge = isApproved
    ? `<span style="display:inline-block;padding:9px 28px;border-radius:999px;background:${BRAND.navy};color:${BRAND.gold};font-size:14px;font-weight:700;letter-spacing:.3px;">&#10003;&nbsp; تم قبول طلبك</span>`
    : `<span style="display:inline-block;padding:9px 28px;border-radius:999px;background:${BRAND.border};color:${BRAND.slate};font-size:14px;font-weight:700;">لم يتم قبول الطلب حالياً</span>`;

  /* ---------- الملاحظة الشخصية ---------- */
  const personalNote = adminNote
    ? `
      <tr><td style="padding:6px 36px 0;">
        <div style="background:${BRAND.bg};border-right:4px solid ${BRAND.gold};border-radius:10px;padding:14px 18px;color:${BRAND.slate};font-size:14px;line-height:1.9;">
          <div style="color:${BRAND.gold};font-size:12px;font-weight:700;margin-bottom:4px;">ملاحظة من اللجنة</div>
          ${nl2br(adminNote)}
        </div>
      </td></tr>`
    : '';

  /* ---------- بطاقة رقم التسجيل + تفاصيل الحدث (للقبول فقط) ---------- */
  const approvedCard = isApproved
    ? `
      <tr><td style="padding:22px 36px 6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.gold};border-radius:14px;background:#FFFFFF;">
          <tr>
            <td align="center" style="padding:18px 16px 8px;">
              <div style="color:${BRAND.slate};font-size:12px;letter-spacing:.5px;">رقم التسجيل</div>
              <div style="color:${BRAND.navy};font-size:26px;font-weight:800;letter-spacing:2px;margin-top:4px;direction:ltr;">${esc(regNumber)}</div>
            </td>
          </tr>
          <tr><td style="padding:0 24px;"><div style="height:1px;background:${BRAND.border};"></div></td></tr>
          <tr>
            <td style="padding:14px 24px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" width="50%" style="border-left:1px solid ${BRAND.border};padding:4px 8px;">
                    <div style="color:${BRAND.slate};font-size:12px;">التاريخ</div>
                    <div style="color:${BRAND.navy};font-size:14px;font-weight:700;margin-top:2px;">${CONFERENCE.date}</div>
                  </td>
                  <td align="center" width="50%" style="padding:4px 8px;">
                    <div style="color:${BRAND.slate};font-size:12px;">المكان</div>
                    <div style="color:${BRAND.navy};font-size:14px;font-weight:700;margin-top:2px;">${CONFERENCE.venue}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>`
    : '';

  /* ---------- نص الرسالة ---------- */
  const bodyText = isApproved
    ? `يسر اللجنة التحضيرية للمؤتمر، إبلاغكم بأنه <strong style="color:${BRAND.navy};">تمت الموافقة على طلب تسجيلكم</strong> للحضور الوجاهي. نرجو الاحتفاظ برقم التسجيل وإبرازه عند الحضور.`
    : `نشكركم على اهتمامكم بالمشاركة في المؤتمر. نأسف لإبلاغكم بأنه <strong style="color:${BRAND.navy};">لم تتم الموافقة على طلب التسجيل</strong> في الوقت الحالي، ونتمنى لكم التوفيق.`;

  const closing = isApproved
    ? 'نتطلع إلى حضوركم ومشاركتكم.'
    : 'نشكركم على اهتمامكم وتفهمكم.';

  /* ---------- شريط القيم (من دليل الهوية) ---------- */
  const values = ['خبرة علمية', 'معايير عالية', 'شراكة طبية', 'خبرة عالمية']
    .map(
      (v) =>
        `<td align="center" style="padding:0 4px;color:${BRAND.slate};font-size:11px;"><span style="color:${BRAND.gold};">&#9670;</span>&nbsp;${v}</td>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light only"/>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 12px;">
    <tr><td align="center">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #EADFB8;border-radius:20px;overflow:hidden;box-shadow:0 6px 24px rgba(13,27,42,0.08);">

        <!-- خط ذهبي علوي -->
        <tr><td style="height:5px;background:${BRAND.gold};font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- الشعار + اسم المؤتمر -->
        <tr>
          <td align="center" style="padding:30px 36px 8px;">
            ${emblem}
            <div style="margin-top:14px;color:${BRAND.navy};font-size:20px;font-weight:800;line-height:1.5;">${CONFERENCE.nameAr}</div>
            <div style="margin-top:2px;color:${BRAND.gold};font-size:12px;letter-spacing:1.2px;direction:ltr;">${CONFERENCE.nameEn}</div>
          </td>
        </tr>

        <!-- فاصل -->
        <tr><td style="padding:14px 36px 0;"><div style="height:1px;background:linear-gradient(90deg,transparent,${BRAND.goldLight},transparent);"></div></td></tr>

        <!-- شارة الحالة -->
        <tr><td align="center" style="padding:22px 36px 4px;">${badge}</td></tr>

        <!-- التحية والنص -->
        <tr>
          <td style="padding:18px 36px 4px;color:${BRAND.slate};font-size:15px;line-height:2;text-align:right;">
            <p style="margin:0 0 6px;">عزيزي/عزيزتي <strong style="color:${BRAND.navy};">${esc(fullName)}</strong>،</p>
            <p style="margin:0;">${bodyText}</p>
          </td>
        </tr>

        ${approvedCard}
        ${personalNote}

        <!-- الخاتمة -->
        <tr>
          <td style="padding:18px 36px 26px;color:${BRAND.slate};font-size:14px;text-align:right;">${closing}</td>
        </tr>

        <!-- شريط القيم -->
        <tr>
          <td style="background:${BRAND.bg};border-top:1px solid ${BRAND.border};padding:12px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${values}</tr></table>
          </td>
        </tr>

        <!-- الفوتر -->
        <tr>
          <td align="center" style="background:${BRAND.navy};padding:22px 24px;border-top:3px solid ${BRAND.gold};">
            <div style="color:${BRAND.gold};font-size:14px;font-weight:700;">اللجنة التحضيرية للمؤتمر الثاني عشر لأمراض الباطنة</div>
            <div style="margin-top:4px;color:#A9B7C6;font-size:12px;">${CONFERENCE.org}</div>
            <div style="margin-top:8px;color:#6F8196;font-size:11px;direction:ltr;">${CONFERENCE.nameEn}</div>
          </td>
        </tr>

      </table>

      <p style="margin:14px 0 0;color:#8A97A6;font-size:11px;">هذه رسالة تلقائية، يرجى عدم الرد عليها مباشرة.</p>

    </td></tr>
  </table>
</body>
</html>`;

  await deliver({ to, subject, html });
}