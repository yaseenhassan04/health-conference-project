"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* ─── البيانات ─── */
const SPECIALTIES = [
  "أمراض الباطنة العامة",
  "أمراض القلب والأوعية الدموية",
  "أمراض الجهاز الهضمي",
  "أمراض الكلى",
  "أمراض الغدد الصماء والسكري",
  "أمراض الجهاز التنفسي",
  "أمراض الدم والأورام",
  "الأمراض المعدية",
  "أمراض المناعة والروماتيزم",
  "الطوارئ والعناية المركزة",
  "طب الأسرة والمجتمع",
  "الأشعة التشخيصية",
  "طب المختبرات",
  "الجراحة العامة",
  "أخرى",
];

const SUB_SPECIALTIES = {
  "أمراض القلب والأوعية الدموية": ["قسطرة قلبية", "قصور القلب", "اضطرابات النظم", "أخرى"],
  "أمراض الجهاز الهضمي": ["أمراض الكبد", "أمراض القولون", "تنظير هضمي", "أخرى"],
  "أمراض الجهاز التنفسي": ["التنفس الصناعي", "تنظير قصبي", "أمراض الرئة المزمنة", "أخرى"],
  "أمراض الغدد الصماء والسكري": ["السكري", "الغدة الدرقية", "أخرى"],
};

const INVITED_CATEGORIES = [
  "طبيب استشاري",
  "طبيب أخصائي",
  "طبيب مقيم",
  "طبيب عام",
  "طالب طب",
  "ممرض / ممرضة",
  "صيدلاني",
  "أخصائي مختبر",
  "أخرى",
];

/* ─── مكونات مساعدة ─── */
const Req = () => <span className="cf-required" aria-hidden="true">*</span>;

const Spinner = () => (
  <svg className="cf-spinner" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const SectionHeading = ({ number, icon, title, description }) => (
  <div className="cf-section-heading">
    <div className="cf-section-icon" aria-hidden="true">{icon}</div>
    <div className="cf-section-copy">
      <span className="cf-section-number">SECTION {number}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

const Field = ({ label, name, required = false, hint, icon, children }) => (
  <div className="cf-field">
    <label className="cf-label" htmlFor={name}>
      {label} {required && <Req />}
    </label>
    <div className={`cf-control${icon ? " has-icon" : ""}`}>
      {icon && <span className="cf-field-icon" aria-hidden="true">{icon}</span>}
      {children}
    </div>
    {hint && <small className="cf-hint">{hint}</small>}
  </div>
);

/* ══════════════════════════════════════════
   الصفحة الرئيسية
══════════════════════════════════════════ */
export default function ConferenceRegistrationPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    workplace: "",
    specialty: "",
    subSpecialty: "",
    invitedCategory: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const subOpts = SUB_SPECIALTIES[form.specialty] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "specialty" ? { subSpecialty: "" } : {}),
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.nationalId && !/^\d{9}$/.test(form.nationalId)) {
      setError("يرجى إدخال رقم هوية صحيح مكوّن من 9 أرقام.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/conference/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ، يرجى المحاولة مرة أخرى.");
        return;
      }
      setSuccess(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("تعذّر الاتصال بالخادم، يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  /* ── شاشة النجاح ── */
  if (success) {
    return (
      <main className="cf-success-page" dir="rtl">
        <style jsx global>{styles}</style>
        <div className="cf-success-card">
          <div className="cf-success-emblem"><span>✓</span></div>
          <div className="cf-success-kicker">REGISTRATION RECEIVED</div>
          <h1>تم استلام طلبك بنجاح</h1>
          <p className="cf-success-lead">
            شكراً لاهتمامك بالمشاركة في المؤتمر الثاني عشر لأمراض الباطنة.
          </p>
          <div className="cf-success-status">
            <span className="cf-status-dot" />
            طلبك قيد المراجعة من قِبل اللجنة التحضيرية
          </div>
          {success.regNumber && (
            <div className="cf-registration-number">
              <span>رقم التسجيل</span>
              <strong dir="ltr">{success.regNumber}</strong>
            </div>
          )}
          <div className="cf-success-info">
            <p>سيصلك بريد إلكتروني بنتيجة الطلب على عنوانك المسجّل.</p>
            <p>إرسال النموذج لا يُعدّ قبولاً نهائياً للمشاركة.</p>
            <p>يصدر القبول بعد مراجعة اللجنة التحضيرية.</p>
          </div>
          <button type="button" className="cf-home-button" onClick={() => router.push("/")}>
            العودة إلى الصفحة الرئيسية
            <span aria-hidden="true">←</span>
          </button>
        </div>
      </main>
    );
  }

  /* ── الصفحة الرئيسية ── */
  return (
    <main className="cf-page" dir="rtl">
      <style jsx global>{styles}</style>

      {/* ══ HERO ══ */}
      <section className="cf-hero">
        <div className="cf-hero-overlay" />
        <div className="cf-hero-decoration cf-decoration-one" />
        <div className="cf-hero-decoration cf-decoration-two" />
        <div className="cf-hero-content">
          <div className="cf-hero-badge">
            <span className="cf-badge-dot" />
            مجمع ناصر الطبي — غزة
          </div>
          <p className="cf-hero-overline">THE 12TH CONFERENCE OF INTERNAL MEDICINE</p>
          <h1>المؤتمر الثاني عشر لأمراض الباطنة</h1>
          <div className="cf-hero-rule" />
          <p className="cf-hero-date">
            السبت والأحد 5 – 6 ديسمبر 2026
          </p>
          <div className="cf-benefits" aria-label="مزايا الحضور">
            {[["🎓","حضور الجلسات"],["📸","معرض الصور"],["☕","الضيافة"],["🍽️","وجبات الغداء"]].map(([icon, title]) => (
              <div className="cf-benefit" key={title}>
                <span aria-hidden="true">{icon}</span>
                <span>{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GLASS CARD WRAPPER ══ */}
      {/*
        الفكرة:
        - .cf-card-wrapper : يحتوي الصورة كـ background-image
        - .cf-glass-panel  : طبقة glassmorphism شفافة فوق الصورة
        - النموذج يظهر داخل الـ glass panel
      */}
      <section className="cf-card-wrapper" aria-labelledby="registration-title">

        {/* الكارد الزجاجي */}
        <div className="cf-card">
          {/* الخط الذهبي العلوي */}
          <div className="cf-card-topline" />

          {/* طبقة الصورة داخل الكارد */}
          <div className="cf-card-bg-image" aria-hidden="true" />

          {/* الـ glass overlay */}
          <div className="cf-glass-overlay" aria-hidden="true" />

          {/* محتوى النموذج */}
          <div className="cf-card-content">

            <header className="cf-form-header">
              <div className="cf-form-mark" aria-hidden="true">✦</div>
              <span className="cf-form-eyebrow">CONFERENCE REGISTRATION</span>
              <h2 id="registration-title">نموذج التسجيل للحضور الوجاهي</h2>
              <p>يرجى تعبئة البيانات التالية لإتمام طلب المشاركة</p>
              <div className="cf-required-note">
                جميع الحقول المشار إليها بـ <Req /> إلزامية
              </div>
            </header>

            {/* شريط الأقسام */}
            <div className="cf-progress" aria-label="أقسام نموذج التسجيل">
              <div className="cf-progress-step"><span>01</span><small>شخصية</small></div>
              <i />
              <div className="cf-progress-step"><span>02</span><small>مهنية</small></div>
              <i />
              <div className="cf-progress-step"><span>03</span><small>ملاحظات</small></div>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="cf-error" role="alert" aria-live="polite">
                <span className="cf-error-symbol" aria-hidden="true">!</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="cf-form">

              {/* ── SECTION 01: شخصية ── */}
              <SectionHeading number="01" icon="👤" title="المعلومات الشخصية" description="البيانات الأساسية ووسائل التواصل" />

              <div className="cf-grid cf-grid-one">
                <Field label="الاسم الكامل" name="fullName" required icon="👤">
                  <input id="fullName" className="cf-input" name="fullName" type="text"
                    value={form.fullName} onChange={handleChange} required
                    autoComplete="name" placeholder="أدخل اسمك الثلاثي" />
                </Field>
              </div>

              <div className="cf-grid cf-grid-two">
                <Field label="رقم الهوية الوطنية" name="nationalId" required icon="🪪"
                  hint="رقم الهوية المكوّن من 9 أرقام">
                  <input id="nationalId" className="cf-input cf-ltr" name="nationalId"
                    type="text" inputMode="numeric" dir="ltr"
                    value={form.nationalId} onChange={handleChange} required
                    maxLength={9} pattern="[0-9]{9}" placeholder="000000000" autoComplete="off" />
                </Field>

                <Field label="رقم الهاتف" name="phone" required icon="📱"
                  hint="رقم هاتف فعال للتواصل">
                  <input id="phone" className="cf-input cf-ltr" name="phone"
                    type="tel" inputMode="tel" dir="ltr"
                    value={form.phone} onChange={handleChange} required
                    autoComplete="tel" placeholder="059XXXXXXXX" />
                </Field>
              </div>

              <div className="cf-grid cf-grid-one">
                <Field label="البريد الإلكتروني" name="email" required icon="✉️">
                  <input id="email" className="cf-input cf-ltr" name="email"
                    type="email" dir="ltr"
                    value={form.email} onChange={handleChange} required
                    autoComplete="email" placeholder="example@email.com" />
                </Field>
              </div>

              <div className="cf-divider" />

              {/* ── SECTION 02: مهنية ── */}
              <SectionHeading number="02" icon="🏥" title="المعلومات المهنية" description="معلومات العمل والتخصص الطبي" />

              <div className="cf-grid cf-grid-one">
                <Field label="مكان العمل / المؤسسة" name="workplace" required icon="🏢">
                  <input id="workplace" className="cf-input" name="workplace" type="text"
                    value={form.workplace} onChange={handleChange} required
                    autoComplete="organization" placeholder="اسم المستشفى أو المؤسسة الصحية" />
                </Field>
              </div>

              <div className={`cf-grid ${subOpts.length > 0 ? "cf-grid-two" : "cf-grid-one"}`}>
                <Field label="التخصص الطبي" name="specialty" required icon="⚕">
                  <select id="specialty" className="cf-input cf-select" name="specialty"
                    value={form.specialty} onChange={handleChange} required>
                    <option value="">— اختر التخصص —</option>
                    {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                {subOpts.length > 0 && (
                  <Field label="التخصص الفرعي" name="subSpecialty" icon="🔬">
                    <select id="subSpecialty" className="cf-input cf-select" name="subSpecialty"
                      value={form.subSpecialty} onChange={handleChange}>
                      <option value="">— اختر التخصص الفرعي —</option>
                      {subOpts.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                )}
              </div>

              <div className="cf-grid cf-grid-one">
                <Field label="الفئة المهنية" name="invitedCategory" required icon="🎓">
                  <select id="invitedCategory" className="cf-input cf-select" name="invitedCategory"
                    value={form.invitedCategory} onChange={handleChange} required>
                    <option value="">— اختر الفئة المهنية —</option>
                    {INVITED_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div className="cf-divider" />

              {/* ── SECTION 03: ملاحظات ── */}
              <SectionHeading number="03" icon="📝" title="ملاحظات إضافية" description="مساحة لإضافة أي معلومات أخرى" />

              <Field label="الملاحظات" name="notes" hint="هذا الحقل اختياري">
                <textarea id="notes" className="cf-input cf-textarea" name="notes"
                  value={form.notes} onChange={handleChange}
                  rows={4} placeholder="اكتب أي معلومات أو ملاحظات إضافية هنا..." />
              </Field>

              {/* تنبيه */}
              <div className="cf-notice">
                <div className="cf-notice-icon" aria-hidden="true">i</div>
                <div>
                  <strong>تنبيه هام</strong>
                  <p>
                    إرسال هذا النموذج <b>لا يُعدّ قبولاً نهائياً</b> للمشاركة في المؤتمر.
                    القبول يصدر بعد مراجعة اللجنة التحضيرية ويُبلَّغ به عبر البريد الإلكتروني.
                  </p>
                </div>
              </div>

              {/* زر الإرسال */}
              <button type="submit" disabled={loading} aria-busy={loading} className="cf-submit">
                {loading ? (
                  <><Spinner /><span>جارٍ إرسال طلب التسجيل...</span></>
                ) : (
                  <><span>إرسال طلب التسجيل</span><span className="cf-submit-arrow" aria-hidden="true">←</span></>
                )}
              </button>

              <p className="cf-privacy-note">
                <span aria-hidden="true">🔒</span>
                يتم التعامل مع بيانات التسجيل وفق إجراءات الخصوصية المعتمدة.
              </p>

            </form>
          </div>
          {/* /cf-card-content */}
        </div>
        {/* /cf-card */}

        <p className="cf-contact-note">
          للاستفسار تواصل مع اللجنة التحضيرية عبر البريد الرسمي للمؤتمر
        </p>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════
   STYLES
══════════════════════════════════════════ */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

:root {
  --cf-navy:     #0D1B2A;
  --cf-navy-2:   #142B43;
  --cf-gold:     #D4AF37;
  --cf-gold-lt:  #F4D79B;
  --cf-muted:    #6B7A8D;
  --cf-border:   #DDE3EC;
  --cf-white:    #FFFFFF;
  --cf-font:     'Cairo', 'Tajawal', sans-serif;
}

/* ── Reset ── */
.cf-page *, .cf-success-page * { box-sizing: border-box; }
.cf-page, .cf-success-page {
  min-height: 100vh;
  font-family: var(--cf-font);
  direction: rtl;
  color: var(--cf-navy);
  background: #F0F4F8;
}

/* ════ HERO ════ */
.cf-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 300px;
  padding: 42px 22px 76px;
  text-align: center;
  color: #fff;
  background-color: #10243A;
  background-image:
    linear-gradient(180deg, rgba(13,27,42,.55) 0%, rgba(13,27,42,.78) 55%, rgba(13,27,42,.95) 100%),
    url('/gaza-hope-banner.png');
  background-size: cover;
  background-position: center 30%;
}
.cf-hero-overlay {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(ellipse at 50% 0%, rgba(212,175,55,.13), transparent 60%);
}
.cf-hero-decoration {
  position: absolute;
  border: 1px solid rgba(212,175,55,.18);
  border-radius: 50%;
  pointer-events: none;
}
.cf-decoration-one { width: 240px; height: 240px; top: -110px; left: -80px; }
.cf-decoration-two { width: 180px; height: 180px; bottom: -100px; right: -60px; }
.cf-hero-content { position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; }

.cf-hero-badge {
  display: inline-flex; align-items: center; gap: 9px;
  margin-bottom: 17px; padding: 7px 17px;
  border: 1px solid rgba(212,175,55,.4); border-radius: 30px;
  background: rgba(212,175,55,.10);
  color: var(--cf-gold-lt); font-size: 11px; font-weight: 800;
}
.cf-badge-dot, .cf-status-dot {
  width: 7px; height: 7px; flex: 0 0 7px;
  border-radius: 50%; background: var(--cf-gold);
  box-shadow: 0 0 0 4px rgba(212,175,55,.14);
}
.cf-hero-overline {
  margin: 0 0 7px; color: rgba(244,215,155,.86);
  font-size: 10px; font-weight: 800; letter-spacing: 2px;
}
.cf-hero h1 {
  margin: 0; color: #fff;
  font-size: clamp(22px, 4vw, 31px); font-weight: 900; line-height: 1.55;
}
.cf-hero-rule {
  width: 48px; height: 3px; margin: 13px auto 15px;
  border-radius: 5px; background: var(--cf-gold);
}
.cf-hero-date { margin: 0 0 22px; color: var(--cf-gold-lt); font-size: 13px; font-weight: 600; }
.cf-date-separator { margin: 0 9px; opacity: .6; }
.cf-benefits { display: flex; justify-content: center; flex-wrap: wrap; gap: 9px; }
.cf-benefit {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 13px;
  border: 1px solid rgba(255,255,255,.12); border-radius: 30px;
  background: rgba(255,255,255,.07);
  color: rgba(255,255,255,.88); font-size: 11px; font-weight: 700;
  backdrop-filter: blur(8px);
}

/* ════ CARD WRAPPER ════ */
.cf-card-wrapper {
  position: relative; z-index: 2;
  width: min(100% - 32px, 760px);
  margin: -34px auto 0;
  padding-bottom: 48px;
}

/* ════ THE GLASS CARD ════
   الصورة تظهر كـ ::before خلف الكارد
   والـ glass overlay يغطيها بشفافية
   المحتوى يظهر فوق الكل
*/
.cf-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(212,175,55,.3);
  box-shadow:
    0 24px 70px rgba(13,27,42,.18),
    0 4px 14px rgba(13,27,42,.07);
}

/* صورة الإعلان كخلفية للكارد */
.cf-card-bg-image {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: url('/form-medical-bg.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}

/* طبقة الـ glassmorphism فوق الصورة */
.cf-glass-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  /* اللون الأبيض الشفاف = يُخفف الصورة ويظهر المحتوى */
  background: rgba(255, 255, 255, 0.50);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
}

/* الخط الذهبي العلوي */
.cf-card-topline {
  position: relative;
  z-index: 10;
  height: 5px;
  background: linear-gradient(90deg, var(--cf-navy), var(--cf-gold), #F4DFA0, var(--cf-gold), var(--cf-navy));
}

/* محتوى الكارد فوق كل الطبقات */
.cf-card-content {
  position: relative;
  z-index: 2;
  padding: 34px 34px 38px;
}

/* ════ FORM HEADER ════ */
.cf-form-header { margin-bottom: 25px; text-align: center; }
.cf-form-mark {
  display: grid; width: 43px; height: 43px; margin: 0 auto 11px;
  place-items: center; border-radius: 13px;
  color: var(--cf-gold-lt); background: var(--cf-navy);
  font-size: 22px; box-shadow: 0 5px 15px rgba(13,27,42,.18);
}
.cf-form-eyebrow {
  display: block; margin-bottom: 5px;
  color: #A98526; font-size: 9px; font-weight: 900; letter-spacing: 2px;
}
.cf-form-header h2 {
  margin: 0 0 6px; color: var(--cf-navy);
  font-size: 21px; font-weight: 900; line-height: 1.7;
}
.cf-form-header > p { margin: 0 0 11px; color: #3D4E5E; font-size: 12px; }
.cf-required-note { color: #4A5568; font-size: 11px; }
.cf-required { color: #D64045; font-size: 15px; font-weight: 900; }

/* ════ PROGRESS ════ */
.cf-progress {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; margin-bottom: 29px; padding: 13px 9px;
  border: 1px solid rgba(13,27,42,.06); border-radius: 13px;
  background: rgba(13,27,42,.04);
}
.cf-progress-step { display: flex; align-items: center; gap: 7px; color: var(--cf-navy); }
.cf-progress-step span {
  display: grid; width: 28px; height: 28px; place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cf-gold), #F0D98D);
  font-size: 10px; font-weight: 900; color: var(--cf-navy);
}
.cf-progress-step small { font-size: 10px; font-weight: 800; }
.cf-progress > i { width: 25px; height: 1px; background: rgba(180,143,39,.6); }

/* ════ ERROR ════ */
.cf-error {
  display: flex; align-items: flex-start; gap: 10px;
  margin-bottom: 20px; padding: 12px 14px;
  border: 1px solid #F2C8C4; border-right: 4px solid #C0392B;
  border-radius: 10px;
  background: #FDF3F2; color: #A93226; font-size: 12px; line-height: 1.8;
}
.cf-error-symbol {
  display: grid; width: 21px; height: 21px; flex: 0 0 21px;
  place-items: center; border-radius: 50%;
  background: #C0392B; color: #fff; font-weight: 900;
}

/* ════ FORM GRID ════ */
.cf-form { display: flex; flex-direction: column; gap: 19px; }
.cf-grid { display: grid; width: 100%; gap: 17px; }
.cf-grid-one  { grid-template-columns: minmax(0, 1fr); }
.cf-grid-two  { grid-template-columns: repeat(2, minmax(0, 1fr)); }

/* ════ SECTION HEADING ════ */
.cf-section-heading { display: flex; align-items: center; gap: 12px; margin: 2px 0 1px; }
.cf-section-icon {
  display: grid; width: 44px; height: 44px; flex: 0 0 44px;
  place-items: center; border-radius: 12px;
  color: var(--cf-gold-lt); background: var(--cf-navy);
  font-size: 19px; box-shadow: 0 4px 12px rgba(13,27,42,.14);
}
.cf-section-copy { min-width: 0; }
.cf-section-number {
  display: block; margin-bottom: 1px;
  color: #A98526; font-size: 9px; font-weight: 900; letter-spacing: 1.5px;
}
.cf-section-heading h3 { margin: 0; color: var(--cf-navy); font-size: 14px; font-weight: 900; }
.cf-section-heading p  { margin: 2px 0 0; color: #3D4E5E; font-size: 10px; }

/* ════ FIELD ════ */
.cf-field { display: flex; min-width: 0; flex-direction: column; gap: 7px; }
.cf-label { display: block; color: #0D1B2A; font-size: 12px; font-weight: 800; line-height: 1.7; }
.cf-control { position: relative; min-width: 0; }
.cf-field-icon {
  position: absolute; top: 50%; right: 14px; z-index: 1;
  transform: translateY(-50%); opacity: .72; font-size: 14px; pointer-events: none;
}
.cf-hint { color: #4A5568; font-size: 10px; line-height: 1.6; }

/* ════ INPUT ════ */
.cf-input {
  display: block; width: 100%; min-height: 52px;
  padding: 12px 43px 12px 14px;
  border: 1.5px solid var(--cf-border); border-radius: 11px;
  outline: none;
  /* شفافية خفيفة عشان الصورة تظهر من الخلف بشكل ناعم */
  background: rgba(255, 255, 255, 0.45);
  color: #0D1B2A;
  font-family: var(--cf-font); font-size: 12px; font-weight: 500; line-height: 1.7;
  transition: border-color .2s, box-shadow .2s, background .2s;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}
.cf-input::placeholder { color: #6B7A8D; opacity: 1; }
.cf-input:hover { border-color: #C9B36E; }
.cf-input:focus {
  border-color: var(--cf-gold);
  background: rgba(255,255,255,0.88);
  box-shadow: 0 0 0 4px rgba(212,175,55,.14);
  outline: none;
}
.cf-input.cf-ltr {
  direction: ltr; text-align: left;
  padding-right: 14px; padding-left: 14px;
  font-family: Arial, sans-serif; letter-spacing: .25px;
}
.cf-select { appearance: none; cursor: pointer; padding-left: 37px; }
.cf-control:has(.cf-select)::after {
  content: "⌄";
  position: absolute; top: 50%; left: 14px;
  transform: translateY(-60%);
  color: #A98526; font-size: 19px; pointer-events: none;
}
.cf-textarea { min-height: 112px; padding: 12px 14px; resize: vertical; line-height: 1.9; }

/* ════ DIVIDER ════ */
.cf-divider {
  width: 100%; height: 1px; margin: 4px 0;
  background: linear-gradient(90deg,
    transparent,
    rgba(212,175,55,.55),
    rgba(220,220,220,.5),
    rgba(212,175,55,.55),
    transparent
  );
}

/* ════ NOTICE ════ */
.cf-notice {
  display: flex; align-items: flex-start; gap: 11px;
  padding: 15px;
  border: 1px solid rgba(212,175,55,.35);
  border-right: 4px solid var(--cf-gold);
  border-radius: 11px;
  background: rgba(248,245,235,.88);
  backdrop-filter: blur(4px);
}
.cf-notice-icon {
  display: grid; width: 23px; height: 23px; flex: 0 0 23px;
  place-items: center; border-radius: 50%;
  background: var(--cf-gold); color: var(--cf-navy);
  font-family: Arial, sans-serif; font-size: 13px; font-weight: 900;
}
.cf-notice strong { display: block; margin-bottom: 4px; color: var(--cf-navy); font-size: 12px; }
.cf-notice p { margin: 0; color: #697587; font-size: 11px; line-height: 1.9; }

/* ════ SUBMIT BUTTON ════ */
.cf-submit {
  display: flex; width: 100%; min-height: 55px;
  align-items: center; justify-content: center; gap: 11px;
  padding: 13px 22px;
  border: 0; border-radius: 12px;
  color: var(--cf-navy);
  background: linear-gradient(135deg, #D4AF37, #EBD17D);
  box-shadow: 0 7px 18px rgba(212,175,55,.24);
  font-family: var(--cf-font); font-size: 14px; font-weight: 900;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s, filter .2s;
}
.cf-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: saturate(1.1);
  box-shadow: 0 12px 26px rgba(212,175,55,.34);
}
.cf-submit:active:not(:disabled) { transform: scale(.99); }
.cf-submit:disabled { opacity: .68; cursor: not-allowed; box-shadow: none; }
.cf-submit-arrow { font-size: 20px; transition: transform .2s; }
.cf-submit:hover .cf-submit-arrow { transform: translateX(-4px); }
.cf-spinner { animation: cf-spin .8s linear infinite; }
@keyframes cf-spin { to { transform: rotate(360deg); } }

.cf-privacy-note, .cf-contact-note {
  margin: -5px 0 0; color: #4A5568; text-align: center; font-size: 10px; line-height: 1.8;
}
.cf-privacy-note span { margin-left: 5px; }
.cf-contact-note { margin: 17px 0 0; font-size: 11px; }

/* ════ SUCCESS ════ */
.cf-success-page {
  display: grid; min-height: 100vh; place-items: center; padding: 28px 16px;
  background:
    radial-gradient(circle at 15% 15%, rgba(212,175,55,.12), transparent 28%),
    linear-gradient(145deg, #0D1B2A, #17334F);
}
.cf-success-card {
  width: min(100%, 500px); padding: 43px 35px 35px;
  border: 1px solid rgba(212,175,55,.35); border-radius: 22px;
  background: #fff; text-align: center;
  box-shadow: 0 30px 85px rgba(0,0,0,.28);
}
.cf-success-emblem {
  display: grid; width: 76px; height: 76px; margin: 0 auto 17px;
  place-items: center; border: 2px solid #36A269; border-radius: 50%;
  background: #EFFAF3; color: #258653; font-size: 36px; font-weight: 800;
}
.cf-success-kicker { margin-bottom: 7px; color: #A98526; font-size: 9px; font-weight: 900; letter-spacing: 2px; }
.cf-success-card h1 { margin: 0 0 8px; color: var(--cf-navy); font-size: 22px; font-weight: 900; }
.cf-success-lead { margin: 0 0 20px; color: #778394; font-size: 12px; line-height: 1.9; }
.cf-success-status {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-bottom: 20px; padding: 12px; border-radius: 10px;
  background: #F0F8F3; color: #315D49; font-size: 12px; font-weight: 700;
}
.cf-status-dot { background: #36A269; box-shadow: 0 0 0 4px rgba(54,162,105,.12); }
.cf-registration-number {
  display: inline-flex; align-items: center; gap: 14px;
  margin-bottom: 20px; padding: 12px 24px;
  border: 1.5px solid var(--cf-gold); border-radius: 11px; background: #FBFAF5;
}
.cf-registration-number span { color: #778394; font-size: 11px; font-weight: 700; }
.cf-registration-number strong { color: var(--cf-navy); font-family: Arial, sans-serif; font-size: 19px; letter-spacing: 1px; }
.cf-success-info { margin-bottom: 23px; padding: 13px 17px; border-radius: 10px; background: #F6F8FA; text-align: right; }
.cf-success-info p {
  position: relative; margin: 4px 0; padding-right: 14px;
  color: #687587; font-size: 11px; line-height: 1.9;
}
.cf-success-info p::before { content: "•"; position: absolute; right: 0; color: var(--cf-gold); font-weight: 900; }
.cf-home-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  min-height: 48px; padding: 11px 25px;
  border: 0; border-radius: 10px;
  background: var(--cf-navy); color: var(--cf-gold-lt);
  font-family: var(--cf-font); font-size: 12px; font-weight: 800;
  cursor: pointer; transition: transform .2s, background .2s;
}
.cf-home-button:hover { transform: translateY(-2px); background: var(--cf-navy-2); }
.cf-submit:focus-visible, .cf-home-button:focus-visible {
  outline: 3px solid rgba(212,175,55,.45); outline-offset: 3px;
}

/* ════ RESPONSIVE ════ */
@media (max-width: 640px) {
  .cf-hero { min-height: 290px; padding: 34px 15px 67px; }
  .cf-hero h1 { font-size: clamp(20px, 5.2vw, 25px); }
  .cf-hero-date { font-size: 11px; }
  .cf-benefits { gap: 7px; }
  .cf-benefit { padding: 6px 10px; font-size: 10px; }
  .cf-card-wrapper { width: calc(100% - 22px); margin-top: -27px; padding-bottom: 32px; }
  .cf-card { border-radius: 17px; }
  .cf-card-content { padding: 25px 17px 27px; }
  .cf-form-header h2 { font-size: 18px; }
  .cf-grid-two { grid-template-columns: minmax(0, 1fr); gap: 15px; }
  .cf-progress { gap: 7px; padding: 11px 5px; }
  .cf-progress-step { gap: 5px; }
  .cf-progress-step small { font-size: 9px; }
  .cf-progress > i { width: 15px; }
  .cf-section-icon { width: 40px; height: 40px; flex-basis: 40px; }
  .cf-success-card { padding: 34px 20px 25px; }
  .cf-success-card h1 { font-size: 19px; }
}
@media (max-width: 360px) {
  .cf-card-content { padding: 22px 13px; }
  .cf-hero-date { font-size: 10px; }
  .cf-benefit { padding: 6px 8px; font-size: 9px; }
  .cf-form-header h2 { font-size: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .cf-page *, .cf-success-page * {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
`;