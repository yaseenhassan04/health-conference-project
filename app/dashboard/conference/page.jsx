"use client";
/**
 * app/dashboard/conference/page.jsx
 */

import { useState, useEffect, useCallback, useRef } from "react";

const B  = "#1B365D";
const R  = "#C8102E";
const G  = "#D4AF37";
const BG = "#F5F7FB";

const STATUS_META = {
  PENDING:  { label: "قيد المراجعة", color: "#b45309", bg: "#fef3c7", dot: "#f59e0b" },
  APPROVED: { label: "مقبول",         color: "#065f46", bg: "#d1fae5", dot: "#10b981" },
  REJECTED: { label: "مرفوض",         color: "#9f1239", bg: "#fee2e2", dot: "#ef4444" },
};

function Spinner({ size = 20, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "spin .75s linear infinite", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 20,
      background: m.bg, color: m.color,
      fontSize: 11, fontWeight: 800, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function StatCard({ label, value, icon, color, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: active ? color : "#fff",
        borderRadius: 18, padding: "18px 16px",
        border: `2px solid ${active ? color : (hov ? G : "#e8edf2")}`,
        display: "flex", alignItems: "center", gap: 14,
        boxShadow: active ? `0 8px 24px -6px ${color}55` : hov ? `0 6px 20px -6px ${color}30` : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all .22s ease",
        transform: hov && !active ? "translateY(-2px)" : "translateY(0)",
        cursor: "pointer", textAlign: "right", fontFamily: "'Cairo', sans-serif",
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: active ? "rgba(255,255,255,0.18)" : `${color}12`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, transition: "transform .22s",
        transform: hov ? "scale(1.08) rotate(-4deg)" : "scale(1)",
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", color: active ? "#fff" : color }}>{value}</div>
        <div style={{ fontSize: 12, marginTop: 3, fontWeight: 600, color: active ? "rgba(255,255,255,0.8)" : "#64748b" }}>{label}</div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════
   Modal — نافذة وسط الشاشة
═══════════════════════════════════════════ */
function DetailModal({ reg, onClose, onDecision, onResend }) {
  const [adminNote, setAdminNote] = useState(reg?.adminNote || "");
  const [approveMsg, setApproveMsg] = useState("يسعدنا إبلاغكم بأن طلب تسجيلكم في المؤتمر العلمي الثاني عشر لأمراض الباطنة قد تمت الموافقة عليه. نتطلع إلى لقائكم.");
  const [rejectMsg, setRejectMsg] = useState("نأسف لإبلاغكم بأنه لم يتمكن من قبول طلب تسجيلكم في هذه الدورة. نشكر اهتمامكم ونتمنى لكم التوفيق.");
  const [deciding, setDeciding] = useState(null);
  const [resending, setResending] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // "info" | "decision"

  useEffect(() => {
    setAdminNote(reg?.adminNote || "");
    setDeciding(null);
  }, [reg?.id]);

  if (!reg) return null;

  const isPending = reg.status === "PENDING";

  const handleDecision = async (decision) => {
    setDeciding(decision);
    const msgToSend = decision === "APPROVED" ? approveMsg : rejectMsg;
    await onDecision(reg.id, decision, adminNote || msgToSend);
    setDeciding(null);
  };

  const handleResend = async () => {
    setResending(true);
    await onResend(reg.id);
    setResending(false);
  };

  const InfoRow = ({ label, value, ltr = false }) => (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      padding: "10px 0", borderBottom: "1px solid #f1f5f9",
    }}>
      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, minWidth: 120, flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: 13, color: "#0f172a", fontWeight: 600,
        direction: ltr ? "ltr" : "rtl", flex: 1, wordBreak: "break-all",
      }}>{value || "—"}</span>
    </div>
  );

  const SectionTitle = ({ icon, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, marginTop: 18 }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8, background: `${G}18`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
      }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 900, color: B }}>{label}</span>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(4px)",
      }} />

      {/* Modal Box */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 500,
        width: "min(820px, 95vw)",
        maxHeight: "90vh",
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column",
        fontFamily: "'Cairo', sans-serif", direction: "rtl",
        animation: "popIn .22s cubic-bezier(.34,1.56,.64,1)",
        overflow: "hidden",
      }}>
        <style>{`
          @keyframes popIn { from { opacity:0; transform:translate(-50%,-50%) scale(.92); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
          @keyframes spin { to { transform:rotate(360deg); } }
        `}</style>

        {/* ─── Header ─── */}
        <div style={{
          background: `linear-gradient(135deg, ${B}, #2a4a7f)`,
          padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: "50%",
            background: "rgba(212,175,55,0.2)", border: `2px solid ${G}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: G, fontWeight: 900, flexShrink: 0,
          }}>{reg.fullName?.[0] || "؟"}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>{reg.fullName}</div>
            <div style={{ fontSize: 11, color: G, fontFamily: "monospace", marginTop: 2 }}>{reg.regNumber}</div>
          </div>

          <StatusBadge status={reg.status} />

          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%", border: "none",
            background: "rgba(255,255,255,0.12)", color: "#fff",
            fontSize: 20, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>×</button>
        </div>

        {/* ─── Tabs ─── */}
        <div style={{
          display: "flex", borderBottom: "2px solid #e8edf2",
          background: "#fafbfc", flexShrink: 0,
        }}>
          {[
            { key: "info", label: "معلومات المتقدم", icon: "👤" },
            { key: "decision", label: isPending ? "اتخاذ القرار" : "نتيجة المراجعة", icon: isPending ? "⚖️" : "✅" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: "13px 16px",
              background: "transparent", border: "none",
              borderBottom: activeTab === tab.key ? `3px solid ${G}` : "3px solid transparent",
              color: activeTab === tab.key ? B : "#94a3b8",
              fontSize: 13, fontWeight: activeTab === tab.key ? 900 : 600,
              cursor: "pointer", fontFamily: "'Cairo', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all .15s",
            }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Content ─── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>

          {/* TAB: معلومات */}
          {activeTab === "info" && (
            <div style={{ padding: "8px 24px 24px" }}>
              <SectionTitle icon="👤" label="المعلومات الشخصية" />
              <InfoRow label="الاسم الكامل" value={reg.fullName} />
              <InfoRow label="البريد الإلكتروني" value={reg.email} ltr />
              <InfoRow label="رقم الهاتف" value={reg.phone} ltr />
              <InfoRow label="مكان العمل" value={reg.workplace} />
              <InfoRow label="التخصص" value={reg.specialty} />
              {reg.subSpecialty && <InfoRow label="التخصص الفرعي" value={reg.subSpecialty} />}
              <InfoRow label="الفئة" value={reg.invitedCategory} />

              {reg.notes && (
                <>
                  <SectionTitle icon="📝" label="ملاحظات المتقدم" />
                  <div style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: "#f8fafc", border: "1px solid #e8edf2",
                    fontSize: 13, color: "#334155", lineHeight: 1.8,
                  }}>{reg.notes}</div>
                </>
              )}

              <SectionTitle icon="📧" label="حالة الإيميل" />
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", borderRadius: 10,
                background: reg.emailSent ? "#d1fae5" : "#fef3c7",
                border: `1px solid ${reg.emailSent ? "#6ee7b7" : "#fcd34d"}`,
                gap: 10,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: reg.emailSent ? "#065f46" : "#92400e" }}>
                  {reg.emailSent
                    ? `✓ أُرسل في ${new Date(reg.emailSentAt).toLocaleString("ar-EG")}`
                    : "⚠️ لم يُرسل الإيميل بعد"}
                </span>
                {!isPending && (
                  <button onClick={handleResend} disabled={resending} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 8, border: "none",
                    background: B, color: G, fontSize: 11, fontWeight: 800,
                    cursor: resending ? "not-allowed" : "pointer", opacity: resending ? 0.6 : 1,
                  }}>
                    {resending ? <Spinner size={12} color={G} /> : "↩"} إعادة إرسال
                  </button>
                )}
              </div>

              <SectionTitle icon="🕐" label="التواريخ" />
              <InfoRow label="تسجيل في" value={new Date(reg.createdAt).toLocaleString("ar-EG")} />
              {reg.reviewedAt && <InfoRow label="تاريخ المراجعة" value={new Date(reg.reviewedAt).toLocaleString("ar-EG")} />}
            </div>
          )}

          {/* TAB: القرار */}
          {activeTab === "decision" && (
            <div style={{ padding: "16px 24px 24px" }}>

              {/* حالة مراجعة سابقة */}
              {!isPending && (
                <div style={{
                  padding: "16px 18px", borderRadius: 14, marginBottom: 20,
                  background: reg.status === "APPROVED" ? "#d1fae5" : "#fee2e2",
                  border: `2px solid ${reg.status === "APPROVED" ? "#6ee7b7" : "#fca5a5"}`,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 28 }}>{reg.status === "APPROVED" ? "✅" : "❌"}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: reg.status === "APPROVED" ? "#065f46" : "#9f1239" }}>
                      {STATUS_META[reg.status]?.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
                      راجع بواسطة: {reg.reviewedBy || "—"} {reg.reviewedAt ? `• ${new Date(reg.reviewedAt).toLocaleDateString("ar-EG")}` : ""}
                    </div>
                    {reg.adminNote && <div style={{ fontSize: 12, color: "#334155", marginTop: 6 }}>{reg.adminNote}</div>}
                  </div>
                </div>
              )}

              {isPending && (
                <>
                  {/* صندوقا القبول والرفض جنب بعض */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

                    {/* ─── صندوق القبول ─── */}
                    <div style={{
                      borderRadius: 16, border: "2px solid #10b981",
                      background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                      padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          width: 38, height: 38, borderRadius: 12,
                          background: "#10b98118",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                        }}>✅</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: "#065f46" }}>نص رسالة القبول</span>
                      </div>
                      <textarea
                        value={approveMsg}
                        onChange={e => setApproveMsg(e.target.value)}
                        rows={4}
                        style={{
                          width: "100%", padding: "10px 12px", borderRadius: 10,
                          border: "1.5px solid #6ee7b7", resize: "vertical",
                          fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#065f46",
                          outline: "none", boxSizing: "border-box",
                          background: "#fff", lineHeight: 1.7,
                          transition: "border-color .15s",
                        }}
                        onFocus={e => e.target.style.borderColor = "#10b981"}
                        onBlur={e => e.target.style.borderColor = "#6ee7b7"}
                      />
                      <button
                        onClick={() => handleDecision("APPROVED")}
                        disabled={deciding !== null}
                        style={{
                          width: "100%", minHeight: 44, borderRadius: 11, border: "none",
                          background: deciding === "APPROVED"
                            ? "#10b981"
                            : "linear-gradient(135deg,#10b981,#059669)",
                          color: "#fff", fontFamily: "'Cairo', sans-serif",
                          fontSize: 14, fontWeight: 900,
                          cursor: deciding ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          opacity: deciding && deciding !== "APPROVED" ? 0.4 : 1,
                          transition: "all .2s", boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                        }}
                        onMouseEnter={e => { if (!deciding) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {deciding === "APPROVED" ? <Spinner size={16} color="#fff" /> : "✓"}
                        {deciding === "APPROVED" ? "جاري الحفظ…" : "قبول وإرسال"}
                      </button>
                    </div>

                    {/* ─── صندوق الرفض ─── */}
                    <div style={{
                      borderRadius: 16, border: `2px solid ${R}`,
                      background: "linear-gradient(135deg,#fff5f5,#fee2e2)",
                      padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          width: 38, height: 38, borderRadius: 12,
                          background: `${R}18`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                        }}>❌</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: "#9f1239" }}>نص رسالة الرفض</span>
                      </div>
                      <textarea
                        value={rejectMsg}
                        onChange={e => setRejectMsg(e.target.value)}
                        rows={4}
                        style={{
                          width: "100%", padding: "10px 12px", borderRadius: 10,
                          border: `1.5px solid #fca5a5`, resize: "vertical",
                          fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#9f1239",
                          outline: "none", boxSizing: "border-box",
                          background: "#fff", lineHeight: 1.7,
                          transition: "border-color .15s",
                        }}
                        onFocus={e => e.target.style.borderColor = R}
                        onBlur={e => e.target.style.borderColor = "#fca5a5"}
                      />
                      <button
                        onClick={() => handleDecision("REJECTED")}
                        disabled={deciding !== null}
                        style={{
                          width: "100%", minHeight: 44, borderRadius: 11, border: "none",
                          background: deciding === "REJECTED"
                            ? R
                            : `linear-gradient(135deg,${R},#9f0d23)`,
                          color: "#fff", fontFamily: "'Cairo', sans-serif",
                          fontSize: 14, fontWeight: 900,
                          cursor: deciding ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          opacity: deciding && deciding !== "REJECTED" ? 0.4 : 1,
                          transition: "all .2s", boxShadow: `0 4px 14px ${R}40`,
                        }}
                        onMouseEnter={e => { if (!deciding) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {deciding === "REJECTED" ? <Spinner size={16} color="#fff" /> : "✗"}
                        {deciding === "REJECTED" ? "جاري الحفظ…" : "رفض وإرسال"}
                      </button>
                    </div>
                  </div>

                  {/* ملاحظة إضافية */}
                  <div style={{
                    borderRadius: 14, border: "1.5px solid #e2e8f0",
                    background: "#f8fafc", padding: "14px 16px",
                  }}>
                    <label style={{
                      fontSize: 11, fontWeight: 800, color: "#475569",
                      display: "block", marginBottom: 8,
                    }}>
                      📎 ملاحظة إضافية خاصة (تُضاف للإيميل — اختياري)
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="مثال: يرجى مراجعة مكتب التسجيل قبل الحضور…"
                      rows={2}
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 10,
                        border: "1.5px solid #e2e8f0", resize: "vertical",
                        fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#0f172a",
                        outline: "none", boxSizing: "border-box",
                        background: "#fff", transition: "border-color .15s",
                      }}
                      onFocus={e => e.target.style.borderColor = G}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SectionTitle({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 20 }}>
      <span style={{
        width: 30, height: 30, borderRadius: 9, background: `${G}18`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
      }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 900, color: B }}>{label}</span>
    </div>
  );
}

function TableRow({ reg, onSelect, selected }) {
  const [hov, setHov] = useState(false);
  const emailIcon = reg.emailSent ? "✅" : "⚠️";
  return (
    <tr
      onClick={() => onSelect(reg)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? `${B}08` : hov ? "#f8fafc" : "#fff",
        cursor: "pointer", transition: "background .12s",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <td style={TD}>{reg.regNumber}</td>
      <td style={{ ...TD, fontWeight: 700, color: B }}>{reg.fullName}</td>
      <td style={{ ...TD, direction: "ltr", textAlign: "left", color: "#64748b", fontSize: 12 }}>{reg.email}</td>
      <td style={TD}>{reg.specialty}</td>
      <td style={TD}>{reg.workplace}</td>
      <td style={{ ...TD, textAlign: "center" }}><StatusBadge status={reg.status} /></td>
      <td style={{ ...TD, fontSize: 11, color: "#94a3b8" }}>
        {new Date(reg.createdAt).toLocaleDateString("ar-EG")}
      </td>
      {/* عمود الإيميل — قابل للنقر منفرداً */}
      <td
        style={{ ...TD, textAlign: "center", fontSize: 18 }}
        title={reg.emailSent ? "تم الإرسال" : "لم يُرسل — انقر للتفاصيل"}
      >
        {emailIcon}
      </td>
    </tr>
  );
}

const TD = {
  padding: "13px 14px", fontSize: 13,
  fontFamily: "'Cairo', sans-serif", color: "#334155",
  verticalAlign: "middle", whiteSpace: "nowrap",
  maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis",
};
const TH = {
  ...TD, fontSize: 11, fontWeight: 900, color: "#64748b",
  background: "#f8fafc", borderBottom: "2px solid #e8edf2",
  textAlign: "right", position: "sticky", top: 0, zIndex: 1,
};

export default function ConferenceDashboardPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("ALL");
  const [selected, setSelected]           = useState(null);
  const [toast, setToast]                 = useState(null);
  const toastTimer = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/conference/register");
      // معالجة أفضل للخطأ — لو رجع HTML بدل JSON
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("الخادم لم يرجع JSON — تأكد من تشغيل الـ API");
      }
      if (!res.ok) throw new Error("فشل جلب البيانات");
      const data = await res.json();
      setRegistrations(Array.isArray(data) ? data : data.registrations ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const handleDecision = async (id, decision, adminNote) => {
    try {
      const res = await fetch(`/api/conference/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, adminNote, reviewedBy: "Admin" }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) throw new Error("خطأ في الخادم — تأكد من الـ API");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setRegistrations(prev => prev.map(r => r.id === id ? data.registration : r));
      setSelected(data.registration);
      showToast(data.emailSent ? "✓ تم حفظ القرار وإرسال الإيميل" : "⚠️ تم الحفظ لكن فشل الإيميل", data.emailSent ? "success" : "warn");
    } catch (e) {
      showToast(`✗ ${e.message}`, "error");
    }
  };

  const handleResend = async (id) => {
    try {
      const res = await fetch(`/api/conference/${id}/resend`, { method: "POST" });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) throw new Error("خطأ في الخادم");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الإرسال");
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, emailSent: true, emailSentAt: new Date().toISOString() } : r));
      setSelected(prev => prev?.id === id ? { ...prev, emailSent: true, emailSentAt: new Date().toISOString() } : prev);
      showToast("✓ تم إعادة الإرسال بنجاح");
    } catch (e) {
      showToast(`✗ ${e.message}`, "error");
    }
  };

  const handleExport = () => window.open("/api/conference/export", "_blank");

  const counts = {
    ALL:      registrations.length,
    PENDING:  registrations.filter(r => r.status === "PENDING").length,
    APPROVED: registrations.filter(r => r.status === "APPROVED").length,
    REJECTED: registrations.filter(r => r.status === "REJECTED").length,
  };

  const filtered = registrations.filter(r => {
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || [r.fullName, r.email, r.phone, r.workplace, r.regNumber, r.specialty]
      .some(v => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <div style={{
      direction: "rtl", fontFamily: "'Cairo', sans-serif",
      padding: "28px 32px", maxWidth: 1300, margin: "0 auto",
      minHeight: "100vh", background: BG,
    }}>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:#f1f5f9;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
      `}</style>

      {/* HEADER */}
      <div style={{
        background: `linear-gradient(135deg,${B} 0%,#2a4a7f 50%,#1a3a6a 100%)`,
        borderRadius: 24, padding: "28px 32px", marginBottom: 28,
        position: "relative", overflow: "hidden",
        boxShadow: "0 15px 35px -10px rgba(27,54,93,0.3)",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg,${R},${G},${R})`,
          backgroundSize: "200% 100%", animation: "shimmer 2.5s linear infinite",
        }} />
        {["🏥","⚕️","📋","🩺"].map((ic, i) => (
          <div key={i} style={{
            position: "absolute", top: `${[20,60,30,70][i]}%`, left: `${[10,25,70,88][i]}%`,
            fontSize: 48, opacity: 0.04, pointerEvents: "none",
          }}>{ic}</div>
        ))}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16,
            background: "rgba(212,175,55,0.2)", border: `2px solid ${G}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          }}>📋</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1.5, color: G, marginBottom: 5 }}>CONFERENCE MANAGEMENT</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>تسجيلات المؤتمر الثاني عشر</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>مجمع ناصر الطبي — 5–6 ديسمبر 2026</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchData} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 11, border: "none",
              background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)",
              color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
            }}>
              {loading ? <Spinner size={14} color="#fff" /> : "↻"} تحديث
            </button>
            <button onClick={handleExport} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 11, border: "none",
              background: G, color: B, fontSize: 12, fontWeight: 900, cursor: "pointer",
              fontFamily: "'Cairo', sans-serif", boxShadow: "0 4px 14px rgba(212,175,55,0.3)",
            }}>⬇ تصدير CSV</button>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="إجمالي الطلبات" value={counts.ALL}      icon="📋" color={B}       active={filterStatus==="ALL"}      onClick={()=>setFilterStatus("ALL")} />
        <StatCard label="قيد المراجعة"   value={counts.PENDING}  icon="⏳" color="#b45309" active={filterStatus==="PENDING"}   onClick={()=>setFilterStatus("PENDING")} />
        <StatCard label="مقبول"          value={counts.APPROVED} icon="✅" color="#059669" active={filterStatus==="APPROVED"}  onClick={()=>setFilterStatus("APPROVED")} />
        <StatCard label="مرفوض"          value={counts.REJECTED} icon="❌" color={R}       active={filterStatus==="REJECTED"}  onClick={()=>setFilterStatus("REJECTED")} />
      </div>

      {/* TOOLBAR */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{
            position: "absolute", top: "50%", right: 14,
            transform: "translateY(-50%)", fontSize: 15, opacity: 0.4, pointerEvents: "none",
          }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="ابحث بالاسم، البريد، الهاتف، رقم التسجيل…"
            style={{
              width: "100%", padding: "10px 42px 10px 14px",
              borderRadius: 11, border: "1.5px solid #e2e8f0",
              fontFamily: "'Cairo',sans-serif", fontSize: 13,
              background: "#fff", color: "#0f172a", outline: "none",
              boxSizing: "border-box", transition: "border-color .15s",
            }}
            onFocus={e=>e.target.style.borderColor=G}
            onBlur={e=>e.target.style.borderColor="#e2e8f0"}
          />
        </div>
        <div style={{
          fontSize: 11, color: "#94a3b8", background: "#fff",
          padding: "7px 14px", borderRadius: 20, border: "1px solid #e8edf2", whiteSpace: "nowrap",
        }}>{filtered.length} نتيجة</div>
      </div>

      {/* TABLE */}
      {loading && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, padding:"60px 0", color:"#64748b", fontSize:14, fontWeight:600 }}>
          <Spinner size={28} color={G} /> جاري تحميل البيانات…
        </div>
      )}

      {!loading && error && (
        <div style={{
          padding: "24px 20px", borderRadius: 16, background: "#fee2e2",
          border: "1px solid #fca5a5", color: R, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          {error}
          <button onClick={fetchData} style={{
            marginRight: "auto", padding: "6px 14px", borderRadius: 8,
            border: "none", background: R, color: "#fff",
            fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif",
          }}>إعادة المحاولة</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{
          background: "#fff", borderRadius: 20, border: "1px solid #e8edf2",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden",
        }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: B, marginBottom: 6 }}>لا توجد نتائج</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>جرّب تغيير الفلتر أو مصطلح البحث</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr>
                    {["رقم التسجيل","الاسم الكامل","البريد الإلكتروني","التخصص","مكان العمل","الحالة","التاريخ","الإيميل"].map(h=>(
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(reg=>(
                    <TableRow key={reg.id} reg={reg} selected={selected?.id===reg.id} onSelect={setSelected} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {selected && (
        <DetailModal
          reg={selected}
          onClose={() => setSelected(null)}
          onDecision={handleDecision}
          onResend={handleResend}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, padding: "13px 22px", borderRadius: 14,
          background: toast.type==="error" ? R : toast.type==="warn" ? "#b45309" : "#059669",
          color: "#fff", fontSize: 13, fontWeight: 800,
          fontFamily: "'Cairo',sans-serif",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          animation: "fadeUp .25s ease", whiteSpace: "nowrap",
        }}>{toast.msg}</div>
      )}

      <footer style={{
        marginTop: 48, textAlign: "center", fontSize: 12, color: "#94a3b8",
        borderTop: "1px solid #e2e8f0", paddingTop: 24,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 16, flexWrap: "wrap",
      }}>
        <span>© 2026 المؤتمر العلمي الثاني عشر لأمراض الباطنة — مجمع ناصر الطبي</span>
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#cbd5e1" }} />
        <span style={{ direction: "ltr" }}>v2.0.0</span>
      </footer>
    </div>
  );
}
