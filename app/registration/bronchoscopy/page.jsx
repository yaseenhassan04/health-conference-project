"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SPECIALTIES = [
  "طب باطني", "أمراض صدرية", "عناية مركزة",
  "طوارئ", "أمراض قلب", "طب عام", "أخرى",
];

export default function BronchoscopyRegistration() {
  const [form, setForm] = useState({
    fullNameAr: "", fullNameEn: "",
    email: "", whatsapp: "",
    specialty: "", workplace: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(10);
  const [isFull, setIsFull] = useState(false);

  // جلب عدد المقاعد المتبقية
  useEffect(() => {
    fetch("/api/registration/bronchoscopy", {
      headers: { "x-admin-token": "samoud2025" },
    })
      .then(r => r.json())
      .then(d => {
        setRemaining(d.remaining ?? 10);
        setIsFull(d.isFull ?? false);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/registration/bronchoscopy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const B = "#1B365D", G = "#C9A227", R = "#C8102E";

  if (success) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "linear-gradient(135deg,#0D1B2A,#1B365D)",
      fontFamily: "'Cairo',sans-serif", direction: "rtl", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "48px 40px",
        textAlign: "center", maxWidth: 440, width: "100%",
        boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: B, marginBottom: 8 }}>
          تم التسجيل بنجاح!
        </div>
        <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8, marginBottom: 24 }}>
          شكراً لتسجيلك في ورشة تنظير القصبات الهوائية<br />
          سيتم التواصل معك قريباً على رقم الواتساب المسجل
        </div>
        <div style={{
          background: "#fefce8", border: `1px solid ${G}`,
          borderRadius: 12, padding: "14px 20px", marginBottom: 24,
          fontSize: 13, color: "#854d0e", fontWeight: 600,
        }}>
          📅  8 نوفمبر 2026 · مستشفى ناصر · خانيونس
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          المقاعد محدودة — 10 أماكن فقط
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0D1B2A 0%,#1B365D 50%,#0D1B2A 100%)",
      fontFamily: "'Cairo',sans-serif", direction: "rtl",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus {
          outline: none;
          border-color: ${G} !important;
          box-shadow: 0 0 0 3px ${G}30 !important;
        }
        .field-input {
          width: 100%; padding: 12px 16px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 14px; font-family: 'Cairo',sans-serif;
          color: #1e293b; background: #F8FAFC;
          transition: all 0.2s;
        }
        .field-input::placeholder { color: #94a3b8; }
        .submit-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg,${G},#a87d10);
          color: #fff; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 900;
          font-family: 'Cairo',sans-serif; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.3px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px ${G}50;
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div style={{
        maxWidth: 900, margin: "0 auto",
        padding: "32px 20px 60px",
      }}>

        {/* الإعلان */}
        <div style={{
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          marginBottom: 32, border: `2px solid ${G}40`,
        }}>
          <img
            src="/workshops-announcement.png"
            alt="ورشة تنظير القصبات الهوائية"
            style={{ width: "100%", display: "block" }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        </div>

        {/* شريط المقاعد */}
        <div style={{
          background: isFull ? "#fef2f2" : "#fefce8",
          border: `1px solid ${isFull ? "#fca5a5" : G}`,
          borderRadius: 14, padding: "14px 20px",
          marginBottom: 24, display: "flex",
          alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{isFull ? "🔴" : "🟡"}</span>
            <div>
              <div style={{
                fontSize: 14, fontWeight: 900,
                color: isFull ? R : "#854d0e",
              }}>
                {isFull ? "امتلأت المقاعد" : `${remaining} مقعد متبقي من أصل 10`}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                المقاعد محدودة — سجّل الآن لضمان مكانك
              </div>
            </div>
          </div>
          <div style={{
            background: isFull ? R : G,
            color: "#fff", fontSize: 13, fontWeight: 900,
            padding: "6px 16px", borderRadius: 20,
          }}>
            {isFull ? "مكتمل" : `${10 - remaining}/10`}
          </div>
        </div>

        {isFull ? (
          <div style={{
            background: "#fff", borderRadius: 20, padding: "48px 32px",
            textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>😔</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: B, marginBottom: 8 }}>
              عذراً، امتلأت المقاعد
            </div>
            <div style={{ fontSize: 14, color: "#64748b" }}>
              تم الوصول للحد الأقصى (10 مشاركين)
            </div>
          </div>
        ) : (
          /* نموذج التسجيل */
          <div style={{
            background: "#fff", borderRadius: 20, padding: "32px 28px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            border: `1px solid ${G}30`,
          }}>
            {/* Header النموذج */}
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: `${G}15`, border: `1px solid ${G}40`,
                borderRadius: 40, padding: "8px 20px", marginBottom: 16,
              }}>
                <span style={{ fontSize: 18 }}>🫁</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#854d0e" }}>
                  ورشة ما قبل المؤتمر
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: B, marginBottom: 4 }}>
                تسجيل ورشة تنظير القصبات الهوائية
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                د. عبدالرحمن حسين · 7–8 نوفمبر 2026 · مستشفى ناصر
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* الاسم بالعربي والإنجليزي */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6 }}>
                    الاسم الكامل بالعربي *
                  </label>
                  <input
                    className="field-input"
                    value={form.fullNameAr}
                    onChange={e => setForm(p => ({ ...p, fullNameAr: e.target.value }))}
                    placeholder="مثال: أحمد محمد عبدالله"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6, direction: "ltr", textAlign: "right" }}>
                    Full Name in English
                  </label>
                  <input
                    className="field-input"
                    style={{ direction: "ltr" }}
                    value={form.fullNameEn}
                    onChange={e => setForm(p => ({ ...p, fullNameEn: e.target.value }))}
                    placeholder="Ahmed Mohammed Abdullah"
                  />
                </div>
              </div>

              {/* الإيميل والواتساب */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6 }}>
                    البريد الإلكتروني *
                  </label>
                  <input
                    className="field-input"
                    style={{ direction: "ltr" }}
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6 }}>
                    رقم الواتساب *
                  </label>
                  <input
                    className="field-input"
                    style={{ direction: "ltr" }}
                    type="tel"
                    value={form.whatsapp}
                    onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                    placeholder="+970 59 000 0000"
                  />
                </div>
              </div>

              {/* التخصص وجهة العمل */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6 }}>
                    التخصص *
                  </label>
                  <select
                    className="field-input"
                    value={form.specialty}
                    onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))}
                  >
                    <option value="">اختر التخصص</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6 }}>
                    جهة العمل *
                  </label>
                  <input
                    className="field-input"
                    value={form.workplace}
                    onChange={e => setForm(p => ({ ...p, workplace: e.target.value }))}
                    placeholder="مثال: مستشفى ناصر"
                  />
                </div>
              </div>

              {/* رسالة الخطأ */}
              {error && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fca5a5",
                  borderRadius: 10, padding: "12px 16px",
                  fontSize: 13, color: R, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  ❌ {error}
                </div>
              )}

              {/* ملاحظة */}
              <div style={{
                background: "#f0fdf4", border: "1px solid #86efac",
                borderRadius: 10, padding: "12px 16px",
                fontSize: 12, color: "#065f46", lineHeight: 1.8,
              }}>
                ✅ التسجيل المجاني للأوائل العشرة<br />
                📍 مستشفى ناصر · غزة · 7–8 نوفمبر 2026<br />
                📞 سيتم التواصل معك للتأكيد عبر الواتساب
              </div>

              {/* زر التسجيل */}
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading || !form.fullNameAr || !form.email || !form.whatsapp || !form.specialty || !form.workplace}
              >
                {loading ? "⏳ جاري التسجيل..." : "🫁 سجّل الآن في الورشة"}
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}