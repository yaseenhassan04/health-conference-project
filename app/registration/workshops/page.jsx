"use client";

import { useState } from "react";

const WORKSHOPS = [
  {
    id: "w1",
    day: "Workshop Day 1",
    date: "Wednesday, 2nd December 2026",
    title: "Safe ED Skills",
    subtitle: "Practical Skills for Safer, Faster, Better Care",
    lead: "Dr. Fahad Alhadad",
    time: "08:00 – 10:00",
    slots: 15,
  },
  {
    id: "w2",
    day: "Workshop Day 1",
    date: "Wednesday, 2nd December 2026",
    title: "Challenge Cases in DM",
    subtitle: "From Complexity to Confidence",
    lead: "Dr. Ahmed Abu Taha",
    time: "10:00 – 12:00",
    slots: 15,
  },
  {
    id: "w3",
    day: "Workshop Day 1",
    date: "Wednesday, 2nd December 2026",
    title: "Electrolytes Is Not Just a Number",
    subtitle: "Read the Clues, Treat the Cause",
    lead: "Dr. Abedesalam Alashgar",
    time: "12:00 – 14:00",
    slots: 15,
  },
  {
    id: "w4",
    day: "Workshop Day 2",
    date: "Thursday, 3rd December 2026",
    title: "Gastroenterology Knowledge & Skills",
    subtitle: "From Symptoms to Solutions",
    lead: "Dr. Mahmoud Sheikh Ali",
    time: "08:00 – 10:00",
    slots: 15,
  },
  {
    id: "w5",
    day: "Workshop Day 2",
    date: "Thursday, 3rd December 2026",
    title: "POCUS",
    subtitle: "Point of Care Ultrasound · See More · Do More · Improve Care",
    lead: "Dr. Mohammed Qandil",
    time: "10:00 – 13:00",
    slots: 15,
  },
];

const SPECIALTIES = [
  "Internal Medicine", "Cardiology", "Gastroenterology", "Endocrinology",
  "Nephrology", "Pulmonology", "Rheumatology", "Hematology",
  "Neurology", "Emergency Medicine", "General Practice", "Other",
];

export default function WorkshopRegistrationPage() {
  const [form, setForm] = useState({
    fullNameAr: "",
    fullNameEn: "",
    phone: "",
    whatsapp: "",
    email: "",
    specialty: "",
    workplace: "",
    yearsExp: "",
    workshops: [],
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleWorkshop = (id) => {
    setForm((prev) => {
      const selected = prev.workshops.includes(id)
        ? prev.workshops.filter((w) => w !== id)
        : prev.workshops.length < 2
        ? [...prev.workshops, id]
        : prev.workshops;
      return { ...prev, workshops: selected };
    });
    setErrors((prev) => ({ ...prev, workshops: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullNameAr.trim()) e.fullNameAr = "الاسم الكامل بالعربية مطلوب";
    if (!form.fullNameEn.trim()) e.fullNameEn = "Full name in English is required";
    if (!form.phone.trim()) e.phone = "رقم الهاتف مطلوب";
    if (!form.whatsapp.trim()) e.whatsapp = "رقم واتساب مطلوب";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "بريد إلكتروني صالح مطلوب";
    if (!form.specialty) e.specialty = "التخصص مطلوب";
    if (!form.workplace.trim()) e.workplace = "جهة العمل مطلوبة";
    if (form.workshops.length === 0) e.workshops = "اختر ورشة عمل واحدة على الأقل";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = document.querySelector("[data-error='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/registration/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error });
        setLoading(false);
        return;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({ general: "تعذر الاتصال بالخادم، حاول مجدداً" });
    }

    setLoading(false);
  };

  const selectedWorkshops = WORKSHOPS.filter((w) => form.workshops.includes(w.id));

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.successWrap}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>تم التسجيل بنجاح</h2>
            <p style={styles.successSub}>
              شكراً {form.fullNameAr}، لقد استلمنا طلب تسجيلك في ورشات العمل.
            </p>
            <div style={styles.successDivider} />
            <p style={{ ...styles.successSub, fontSize: "13px", color: "#8B6914", marginBottom: 0 }}>
              سيتم التواصل معك على رقم الواتساب: <strong dir="ltr">{form.whatsapp}</strong>
            </p>
            <div style={styles.workshopConfirmList}>
              {selectedWorkshops.map((w) => (
                <div key={w.id} style={styles.workshopConfirmItem}>
                  <span style={styles.confirmDot} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#1A1A1A" }}>{w.title}</div>
                    <div style={{ fontSize: "12px", color: "#5B4A2A" }}>{w.time} · {w.lead}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "#888", marginTop: "20px", textAlign: "center" }}>
              ملاحظة: التسجيل مجاني للـ 10 أوائل في كل ورشة — الأماكن محدودة.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <form onSubmit={handleSubmit} noValidate style={styles.form}>

          {/* Section: Personal Info */}
          <Section number="01" title="المعلومات الشخصية" titleEn="Personal Information">
            <div style={styles.grid2}>
              <Field
                label="الاسم الكامل بالعربية"
                labelEn="Full Name (Arabic)"
                name="fullNameAr"
                value={form.fullNameAr}
                onChange={handleChange}
                error={errors.fullNameAr}
                placeholder="محمد أحمد الغزاوي"
                dir="rtl"
              />
              <Field
                label="الاسم الكامل بالإنجليزية"
                labelEn="Full Name (English)"
                name="fullNameEn"
                value={form.fullNameEn}
                onChange={handleChange}
                error={errors.fullNameEn}
                placeholder="Mohammed Ahmad Al-Ghazawi"
                dir="ltr"
              />
            </div>
            <div style={styles.grid2}>
              <Field
                label="رقم الهاتف"
                labelEn="Phone Number"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+970 5X XXX XXXX"
                dir="ltr"
              />
              <Field
                label="رقم واتساب"
                labelEn="WhatsApp Number"
                name="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={handleChange}
                error={errors.whatsapp}
                placeholder="+970 5X XXX XXXX"
                dir="ltr"
                icon="💬"
              />
            </div>
            <Field
              label="البريد الإلكتروني"
              labelEn="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="doctor@example.com"
              dir="ltr"
            />
          </Section>

          {/* Section: Professional Info */}
          <Section number="02" title="المعلومات المهنية" titleEn="Professional Details">
            <div style={styles.grid2}>
              <div style={styles.fieldWrap} data-error={!!errors.specialty}>
                <label style={styles.label}>
                  التخصص <span style={styles.labelEn}>Specialty</span>
                </label>
                <select
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  style={{ ...styles.input, color: form.specialty ? "#1A1A1A" : "#999" }}
                >
                  <option value="">اختر التخصص...</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.specialty && <span style={styles.error}>{errors.specialty}</span>}
              </div>
              <Field
                label="سنوات الخبرة"
                labelEn="Years of Experience"
                name="yearsExp"
                type="number"
                value={form.yearsExp}
                onChange={handleChange}
                placeholder="e.g. 5"
                dir="ltr"
                min="0"
              />
            </div>
            <Field
              label="جهة العمل / المستشفى"
              labelEn="Workplace / Hospital"
              name="workplace"
              value={form.workplace}
              onChange={handleChange}
              error={errors.workplace}
              placeholder="مجمع ناصر الطبي — غزة"
              dir="rtl"
            />
          </Section>

          {/* Section: Workshop Selection */}
          <Section number="03" title="اختيار ورشات العمل" titleEn="Workshop Selection">
            <div style={styles.workshopNote}>
              <span style={styles.noteDot} />
              يُسمح لكل مشترك بالتسجيل في <strong>ورشتين كحد أقصى</strong> — الأماكن محدودة (15 مشتركاً لكل ورشة).
              {form.workshops.length > 0 && (
                <span style={styles.selectedCount}>
                  {form.workshops.length}/2 مختار
                </span>
              )}
            </div>

            <DayGroup label="Workshop Day 1" date="Wednesday, 2 December 2026" />
            {WORKSHOPS.filter((w) => w.day === "Workshop Day 1").map((w) => (
              <WorkshopCard
                key={w.id}
                workshop={w}
                selected={form.workshops.includes(w.id)}
                disabled={!form.workshops.includes(w.id) && form.workshops.length >= 2}
                onToggle={() => toggleWorkshop(w.id)}
              />
            ))}

            <DayGroup label="Workshop Day 2" date="Thursday, 3 December 2026" />
            {WORKSHOPS.filter((w) => w.day === "Workshop Day 2").map((w) => (
              <WorkshopCard
                key={w.id}
                workshop={w}
                selected={form.workshops.includes(w.id)}
                disabled={!form.workshops.includes(w.id) && form.workshops.length >= 2}
                onToggle={() => toggleWorkshop(w.id)}
              />
            ))}

            {errors.workshops && (
              <span style={{ ...styles.error, display: "block", marginTop: "8px" }}>
                {errors.workshops}
              </span>
            )}
          </Section>

          {/* Submit */}
          <div style={styles.submitRow}>
            {errors.general && (
              <div style={{
                backgroundColor: "#FEE2E2",
                border: "1px solid #FCA5A5",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "#C0392B",
                fontSize: "14px",
                fontWeight: 600,
                width: "100%",
                textAlign: "center",
              }}>
                ⚠️ {errors.general}
              </div>
            )}
            <p style={styles.submitNote}>
              بتقديم هذا الطلب تؤكد صحة المعلومات المدخلة وموافقتك على شروط المشاركة.
            </p>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span style={styles.spinner} />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "8px" }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                  </svg>
                  إرسال طلب التسجيل
                </>
              )}
            </button>
          </div>

        </form>
      </main>

      <footer style={styles.footer}>
        <span>The 12<sup>th</sup> Conference of Internal Medicine</span>
        <span style={styles.footerDot} />
        <span>5–6 December 2026 · Miran Hotel, Gaza</span>
        <span style={styles.footerDot} />
        <span>Nasser Medical Complex</span>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ number, title, titleEn, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHead}>
        <span style={styles.sectionNum}>{number}</span>
        <div>
          <div style={styles.sectionTitle}>{title}</div>
          <div style={styles.sectionTitleEn}>{titleEn}</div>
        </div>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, labelEn, name, value, onChange, error, placeholder, type = "text", dir = "rtl", icon, min }) {
  return (
    <div style={styles.fieldWrap} data-error={!!error}>
      <label style={styles.label}>
        {label} <span style={styles.labelEn}>{labelEn}</span>
      </label>
      <div style={{ position: "relative" }}>
        {icon && <span style={styles.inputIcon}>{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          dir={dir}
          min={min}
          style={{
            ...styles.input,
            ...(error ? styles.inputError : {}),
            ...(icon ? { paddingRight: "36px" } : {}),
          }}
        />
      </div>
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}

function DayGroup({ label, date }) {
  return (
    <div style={styles.dayGroup}>
      <div style={styles.dayLabel}>{label}</div>
      <div style={styles.dayDate}>{date}</div>
    </div>
  );
}

function WorkshopCard({ workshop, selected, disabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      style={{
        ...styles.workshopCard,
        ...(selected ? styles.workshopCardSelected : {}),
        ...(disabled ? styles.workshopCardDisabled : {}),
      }}
    >
      <div style={styles.wsCheck}>
        <div style={{
          ...styles.wsCheckBox,
          ...(selected ? styles.wsCheckBoxSelected : {}),
        }}>
          {selected && <span style={{ color: "#fff", fontSize: "12px", lineHeight: 1 }}>✓</span>}
        </div>
      </div>
      <div style={styles.wsContent}>
        <div style={styles.wsTitle}>{workshop.title}</div>
        <div style={styles.wsSub}>{workshop.subtitle}</div>
        <div style={styles.wsMeta}>
          <span style={styles.wsMetaItem}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {workshop.time}
          </span>
          <span style={styles.wsMetaItem}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {workshop.lead}
          </span>
          <span style={{ ...styles.wsMetaItem, marginRight: "auto" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {workshop.slots} أماكن
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── Styles ── */

const GOLD = "#8B6F14";
const GOLD_LIGHT = "#C9A227";
const DARK_BROWN = "#5B4A2A";
const BEIGE = "#E8E4D9";
const CHARCOAL = "#1A1A1A";
const OFF_WHITE = "#FAFAF8";

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: OFF_WHITE,
    fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
    color: CHARCOAL,
    direction: "rtl",
  },
  main: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "32px 16px 64px",
  },
  form: { display: "flex", flexDirection: "column", gap: "0" },
  section: {
    marginBottom: "32px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: `1px solid ${BEIGE}`,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(139,111,20,0.06)",
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px 22px",
    borderBottom: `1px solid ${BEIGE}`,
    backgroundColor: "#FDFCF8",
  },
  sectionNum: {
    fontSize: "11px",
    fontWeight: 700,
    color: GOLD,
    border: `1.5px solid ${GOLD}`,
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: CHARCOAL,
    lineHeight: 1.2,
  },
  sectionTitleEn: {
    fontSize: "11px",
    color: "#999",
    marginTop: "2px",
  },
  sectionBody: {
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: DARK_BROWN,
  },
  labelEn: {
    fontSize: "11px",
    color: "#aaa",
    fontWeight: 400,
    marginRight: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: `1.5px solid ${BEIGE}`,
    borderRadius: "8px",
    backgroundColor: OFF_WHITE,
    color: CHARCOAL,
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
    appearance: "none",
  },
  inputError: {
    borderColor: "#C0392B",
  },
  inputIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "14px",
    pointerEvents: "none",
  },
  error: {
    fontSize: "12px",
    color: "#C0392B",
    fontWeight: 500,
  },
  workshopNote: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: DARK_BROWN,
    backgroundColor: "#FBF7EE",
    border: `1px solid #E8D9A0`,
    borderRadius: "8px",
    padding: "12px 14px",
    flexWrap: "wrap",
  },
  noteDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: GOLD,
    flexShrink: 0,
  },
  selectedCount: {
    marginRight: "auto",
    backgroundColor: GOLD,
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "20px",
  },
  dayGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0 4px",
  },
  dayLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: GOLD,
    backgroundColor: "#FBF7EE",
    padding: "4px 12px",
    borderRadius: "20px",
    border: `1px solid #E8D9A0`,
  },
  dayDate: {
    fontSize: "11px",
    color: "#aaa",
  },
  workshopCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "14px 16px",
    border: `1.5px solid ${BEIGE}`,
    borderRadius: "10px",
    backgroundColor: "#fff",
    cursor: "pointer",
    textAlign: "right",
    transition: "all 0.15s",
    width: "100%",
    marginBottom: "8px",
  },
  workshopCardSelected: {
    border: `1.5px solid ${GOLD}`,
    backgroundColor: "#FBF7EE",
    boxShadow: `0 0 0 3px rgba(139,111,20,0.08)`,
  },
  workshopCardDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  wsCheck: { paddingTop: "2px", flexShrink: 0 },
  wsCheckBox: {
    width: "20px",
    height: "20px",
    borderRadius: "5px",
    border: `2px solid ${BEIGE}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    backgroundColor: "#fff",
  },
  wsCheckBoxSelected: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  wsContent: { flex: 1 },
  wsTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: CHARCOAL,
    marginBottom: "3px",
  },
  wsSub: {
    fontSize: "12px",
    color: "#888",
    marginBottom: "8px",
  },
  wsMeta: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },
  wsMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: DARK_BROWN,
  },
  submitRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
    paddingTop: "8px",
  },
  submitNote: {
    fontSize: "12px",
    color: "#aaa",
    textAlign: "center",
    margin: 0,
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 40px",
    backgroundColor: GOLD,
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    minWidth: "240px",
    transition: "background-color 0.15s",
    fontFamily: "inherit",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  successWrap: {
    display: "flex",
    justifyContent: "center",
    padding: "48px 16px",
  },
  successCard: {
    backgroundColor: "#fff",
    border: `1px solid ${BEIGE}`,
    borderRadius: "16px",
    padding: "40px 32px",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(139,111,20,0.1)",
  },
  successIcon: {
    width: "60px",
    height: "60px",
    backgroundColor: GOLD,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    color: "#fff",
    margin: "0 auto 20px",
  },
  successTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: CHARCOAL,
    margin: "0 0 8px",
  },
  successSub: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 20px",
  },
  successDivider: {
    height: "1px",
    backgroundColor: BEIGE,
    margin: "20px 0",
  },
  workshopConfirmList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "right",
  },
  workshopConfirmItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    backgroundColor: "#FBF7EE",
    borderRadius: "8px",
    border: `1px solid #E8D9A0`,
  },
  confirmDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: GOLD,
    flexShrink: 0,
  },
  footer: {
    backgroundColor: "#1A1100",
    color: "rgba(255,255,255,0.45)",
    fontSize: "11px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    flexWrap: "wrap",
  },
  footerDot: {
    width: "3px",
    height: "3px",
    borderRadius: "50%",
    backgroundColor: GOLD,
  },
};