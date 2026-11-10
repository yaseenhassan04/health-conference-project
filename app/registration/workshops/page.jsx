// المسار: app/registration/workshops/page.jsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const SPECIALTIES = [
  "طب باطني", "أمراض صدرية", "عناية مركزة",
  "طوارئ", "أمراض قلب", "طب عام", "أخرى",
];

const WORKSHOPS = {
  bronchoscopy: {
    key: "bronchoscopy",
    icon: "🫁",
    day: "الأحد",
    date: "8 نوفمبر 2026",
    short: "8 نوفمبر",
    title: "تنظير القصبات الهوائية",
    image: "/workshops-announcement.png",
    capacity: 10,
  },
  pocus: {
    key: "pocus",
    icon: "📡",
    day: "الإثنين",
    date: "9 نوفمبر 2026",
    short: "9 نوفمبر",
    title: "الموجات فوق الصوتية عند نقطة الرعاية للمبتدئين (POCUS)",
    image: "/pocus-announcement.png",
    capacity: 10,
  },
};

const KEYS = ["bronchoscopy", "pocus"];
const PLACE = "القاعة التعليمية · المبنى الإداري · مجمع ناصر الطبي";
const B = "#1B365D", G = "#C9A227", R = "#C8102E";
const EMPTY = { fullNameAr: "", fullNameEn: "", email: "", whatsapp: "", specialty: "", workplace: "" };

// ─── المكوّن الداخلي الذي يستخدم useSearchParams ───
function WorkshopsContent() {
  const searchParams = useSearchParams();
  const initialW = searchParams.get("w") === "pocus" ? "pocus" : "bronchoscopy";

  const [selected, setSelected] = useState(initialW);
  const [form, setForm] = useState(EMPTY);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const formRef = useRef(null);

  const loadStats = () =>
    fetch("/api/registration/workshops")
      .then(r => r.json())
      .then(d => setStats(d.stats || {}))
      .catch(() => {});

  useEffect(() => { loadStats(); }, []);

  const ws = WORKSHOPS[selected];
  const st = stats[selected] || { remaining: ws.capacity, capacity: ws.capacity, isFull: false };

  const choose = (key, scroll = false) => {
    setSelected(key);
    setError("");
    if (scroll) setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/registration/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, workshop: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(selected);
      loadStats();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const canSubmit = form.fullNameAr && form.email && form.whatsapp && form.specialty && form.workplace;

  // ─── شاشة النجاح ───
  if (success) {
    const w = WORKSHOPS[success];
    const otherKey = KEYS.find(k => k !== success);
    const other = WORKSHOPS[otherKey];
    const otherFull = stats[otherKey]?.isFull;

    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#0D1B2A,#1B365D)",
        fontFamily: "'Cairo',sans-serif", direction: "rtl", padding: 20,
      }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "44px 36px",
          textAlign: "center", maxWidth: 460, width: "100%",
          boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
        }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: B, marginBottom: 8 }}>
            تم التسجيل بنجاح!
          </div>
          <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.9, marginBottom: 20 }}>
            شكراً لتسجيلك في ورشة <b>{w.title}</b><br />
            سيتم التواصل معك قريباً على رقم الواتساب المسجل
          </div>
          <div style={{
            background: "#fefce8", border: `1px solid ${G}`,
            borderRadius: 12, padding: "14px 18px", marginBottom: 20,
            fontSize: 13, color: "#854d0e", fontWeight: 600, lineHeight: 1.9,
          }}>
            📅 {w.day} {w.date} · 9:00 صباحاً<br />📍 {PLACE}
          </div>

          {!otherFull && (
            <button
              onClick={() => {
                setSuccess(null);
                setForm(EMPTY);
                setSelected(otherKey);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{
                width: "100%", padding: 13,
                background: "#fff", color: B,
                border: `1.5px solid ${B}`,
                borderRadius: 12, fontFamily: "'Cairo',sans-serif",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
              }}
            >
              {other.icon} سجّل أيضاً في ورشة {other.short}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── الصفحة الرئيسية ───
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0D1B2A 0%,#1B365D 50%,#0D1B2A 100%)",
      fontFamily: "'Cairo',sans-serif", direction: "rtl",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus { outline: none; border-color: ${G} !important; box-shadow: 0 0 0 3px ${G}30 !important; }
        .fi { width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; font-family:'Cairo',sans-serif; color:#1e293b; background:#F8FAFC; transition:all .2s; }
        .fi::placeholder { color:#94a3b8; }
        .two { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media(max-width:640px){ .two{ grid-template-columns:1fr; } }
        .sbtn { width:100%; padding:15px; background:linear-gradient(135deg,${G},#a87d10); color:#fff; border:none; border-radius:14px; font-size:16px; font-weight:900; font-family:'Cairo',sans-serif; cursor:pointer; transition:all .2s; }
        .sbtn:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 8px 24px ${G}50; }
        .sbtn:disabled{ opacity:.6; cursor:not-allowed; }
        .wcard { transition:transform .25s, box-shadow .25s; cursor:pointer; }
        .wcard:hover { transform:translateY(-4px); }
      `}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* ═══ بطاقتا الإعلان جنب بعض ═══ */}
        <div className="two" style={{ marginBottom: 28, alignItems: "start" }}>
          {KEYS.map(k => {
            const w = WORKSHOPS[k];
            const s = stats[k] || { remaining: w.capacity, isFull: false };
            const active = selected === k;
            return (
              <div
                key={k}
                className="wcard"
                onClick={() => !s.isFull && choose(k, true)}
                style={{
                  background: "#fff", borderRadius: 20, overflow: "hidden",
                  border: `2px solid ${active ? G : G + "40"}`,
                  boxShadow: active
                    ? `0 20px 50px rgba(0,0,0,.45), 0 0 0 3px ${G}40`
                    : "0 12px 36px rgba(0,0,0,.35)",
                }}
              >
                <img
                  src={w.image}
                  alt={`ورشة ${w.title}`}
                  style={{ width: "100%", display: "block" }}
                  onError={e => { e.currentTarget.style.display = "none"; }}
                />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 10, gap: 8,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: s.isFull ? R : "#854d0e" }}>
                      {s.isFull ? "🔴 امتلأت المقاعد" : `🟡 ${s.remaining} مقعد متبقي من ${w.capacity}`}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: "#fff",
                      background: s.isFull ? R : G,
                      padding: "3px 12px", borderRadius: 20,
                    }}>{w.short}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); !s.isFull && choose(k, true); }}
                    disabled={s.isFull}
                    style={{
                      width: "100%", padding: 11, borderRadius: 12, border: "none",
                      cursor: s.isFull ? "not-allowed" : "pointer",
                      background: s.isFull ? "#e2e8f0" : `linear-gradient(135deg,${B},#2a4a7a)`,
                      color: s.isFull ? "#94a3b8" : "#fff",
                      fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 14,
                    }}
                  >
                    {s.isFull ? "مكتملة" : `${w.icon} سجّل في ورشة ${w.short}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ تبويبات الاختيار ═══ */}
        <div ref={formRef} style={{ scrollMarginTop: 20 }}>
          <div style={{
            display: "flex", background: "rgba(255,255,255,.08)",
            borderRadius: 16, padding: 5, gap: 5, marginBottom: 16,
            border: `1px solid ${G}30`,
          }}>
            {KEYS.map(k => {
              const w = WORKSHOPS[k];
              const active = selected === k;
              return (
                <button
                  key={k}
                  onClick={() => choose(k)}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 12,
                    border: "none", cursor: "pointer",
                    fontFamily: "'Cairo',sans-serif", fontWeight: 900, fontSize: 14,
                    background: active ? `linear-gradient(135deg,${G},#a87d10)` : "transparent",
                    color: active ? "#fff" : "#cbd5e1",
                    transition: "all .2s",
                  }}
                >
                  {w.icon} تسجيل {w.short}
                </button>
              );
            })}
          </div>

          {/* ═══ النموذج / مكتمل ═══ */}
          {st.isFull ? (
            <div style={{
              background: "#fff", borderRadius: 20, padding: "44px 28px",
              textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,.2)",
            }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>😔</div>
              <div style={{ fontSize: 21, fontWeight: 900, color: B, marginBottom: 6 }}>
                عذراً، امتلأت مقاعد ورشة {ws.short}
              </div>
              <div style={{ fontSize: 14, color: "#64748b" }}>
                تم الوصول للحد الأقصى ({ws.capacity} مشاركين)
              </div>
            </div>
          ) : (
            <div style={{
              background: "#fff", borderRadius: 20, padding: "30px 26px",
              boxShadow: "0 8px 40px rgba(0,0,0,.2)",
              border: `1px solid ${G}30`,
            }}>
              {/* رأس النموذج */}
              <div style={{ marginBottom: 26, textAlign: "center" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: `${G}15`, border: `1px solid ${G}40`,
                  borderRadius: 40, padding: "8px 20px", marginBottom: 14,
                }}>
                  <span style={{ fontSize: 18 }}>{ws.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#854d0e" }}>ورشة ما قبل المؤتمر</span>
                </div>
                <div style={{ fontSize: 21, fontWeight: 900, color: B, marginBottom: 4 }}>
                  تسجيل ورشة {ws.title}
                </div>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  د. عبدالرحمن حسين · {ws.day} {ws.date} · مجمع ناصر الطبي
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* الاسم */}
                <div className="two">
                  <div>
                    <label style={lbl}>الاسم الكامل بالعربي *</label>
                    <input className="fi" value={form.fullNameAr} onChange={setField("fullNameAr")} placeholder="مثال: أحمد محمد عبدالله" />
                  </div>
                  <div>
                    <label style={{ ...lbl, direction: "ltr", textAlign: "right" }}>Full Name in English</label>
                    <input className="fi" style={{ direction: "ltr" }} value={form.fullNameEn} onChange={setField("fullNameEn")} placeholder="Ahmed Mohammed Abdullah" />
                  </div>
                </div>

                {/* الإيميل والواتساب */}
                <div className="two">
                  <div>
                    <label style={lbl}>البريد الإلكتروني *</label>
                    <input className="fi" style={{ direction: "ltr" }} type="email" value={form.email} onChange={setField("email")} placeholder="example@email.com" />
                  </div>
                  <div>
                    <label style={lbl}>رقم الواتساب *</label>
                    <input className="fi" style={{ direction: "ltr" }} type="tel" value={form.whatsapp} onChange={setField("whatsapp")} placeholder="+970 59 000 0000" />
                  </div>
                </div>

                {/* التخصص وجهة العمل */}
                <div className="two">
                  <div>
                    <label style={lbl}>التخصص *</label>
                    <select className="fi" value={form.specialty} onChange={setField("specialty")}>
                      <option value="">اختر التخصص</option>
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>جهة العمل *</label>
                    <input className="fi" value={form.workplace} onChange={setField("workplace")} placeholder="مثال: مستشفى ناصر" />
                  </div>
                </div>

                {/* رسالة الخطأ */}
                {error && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fca5a5",
                    borderRadius: 10, padding: "12px 16px",
                    fontSize: 13, color: R, fontWeight: 600,
                  }}>❌ {error}</div>
                )}

                {/* ملاحظة */}
                <div style={{
                  background: "#f0fdf4", border: "1px solid #86efac",
                  borderRadius: 10, padding: "12px 16px",
                  fontSize: 12, color: "#065f46", lineHeight: 1.9,
                }}>
                  ✅ التسجيل مجاني للأوائل ({ws.capacity}) في هذه الورشة<br />
                  📅 {ws.day} {ws.date} · 9:00 صباحاً<br />
                  📍 {PLACE}<br />
                  📞 سيتم التواصل معك للتأكيد عبر الواتساب
                </div>

                {/* زر التسجيل */}
                <button className="sbtn" onClick={handleSubmit} disabled={loading || !canSubmit}>
                  {loading ? "⏳ جاري التسجيل..." : `${ws.icon} سجّل الآن في ورشة ${ws.short}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const lbl = { fontSize: 12, fontWeight: 700, color: "#1B365D", display: "block", marginBottom: 6 };

// ─── Loading fallback ───
function LoadingFallback() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#0D1B2A,#1B365D)",
      fontFamily: "'Cairo',sans-serif", direction: "rtl",
    }}>
      <div style={{ color: "#C9A227", fontSize: 18, fontWeight: 700 }}>
        ⏳ جاري التحميل...
      </div>
    </div>
  );
}

// ─── المكوّن الرئيسي المُصدَّر ───
export default function WorkshopsRegistration() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WorkshopsContent />
    </Suspense>
  );
}