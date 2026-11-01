"use client";

import { useState, useEffect } from "react";

const B = "#1B365D", R = "#C8102E", G = "#D4AF37";
const CAPACITY = 10;

function Toast({ msg, ok }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%",
      transform: "translateX(-50%)",
      background: ok ? "#10b981" : R,
      color: "#fff", padding: "12px 24px",
      borderRadius: 12, fontSize: 14, fontWeight: 700,
      zIndex: 9999, fontFamily: "'Cairo',sans-serif",
      animation: "fadeUp 0.25s ease", whiteSpace: "nowrap",
    }}>
      {ok ? "✅" : "❌"} {msg}
    </div>
  );
}

export default function BronchoscopyDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/registration/bronchoscopy", {
        headers: { "x-admin-token": "samoud2025" },
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      showToast("فشل التحميل", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("حذف هذا التسجيل؟")) return;
    try {
      const res = await fetch(`/api/registration/bronchoscopy?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": "samoud2025" },
      });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(i => i.id !== id));
      showToast("تم الحذف");
    } catch {
      showToast("فشل الحذف", false);
    }
  };

  const handleExport = () => {
    const headers = ["#", "الاسم بالعربي", "الاسم بالإنجليزي", "الإيميل", "الواتساب", "التخصص", "جهة العمل", "تاريخ التسجيل"];
    const rows = items.map((r, i) => [
      i + 1, r.fullNameAr, r.fullNameEn, r.email,
      r.whatsapp, r.specialty, r.workplace,
      new Date(r.createdAt).toLocaleDateString("ar-EG"),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bronchoscopy-registrations.csv";
    a.click();
  };

  const filtered = items.filter(r =>
    !search ||
    r.fullNameAr?.includes(search) ||
    r.fullNameEn?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.specialty?.includes(search) ||
    r.workplace?.includes(search)
  );

  const total = items.length;
  const remaining = Math.max(0, CAPACITY - total);
  const fillPct = Math.round((total / CAPACITY) * 100);

  return (
    <div style={{
      direction: "rtl", fontFamily: "'Cairo',sans-serif",
      padding: "28px 24px", maxWidth: 1100, margin: "0 auto",
      minHeight: "100vh", background: "#F5F7FB",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateX(-50%) translateY(10px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        .reg-row:hover { background: #f8fafc !important; }
        input:focus, select:focus { outline: none; border-color: ${G} !important; }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg,${B},#2a4a7f)`,
        borderRadius: 20, padding: "28px 32px",
        marginBottom: 28, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg,${R},${G},${R})`,
        }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
              🫁 ورشة تنظير القصبات الهوائية
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
              Bronchoscopy Workshop · 8 نوفمبر 2026 · د. عبدالرحمن حسين
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchData} style={{
              padding: "8px 16px", borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff", fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Cairo',sans-serif",
            }}>↺ تحديث</button>
            <button onClick={handleExport} style={{
              padding: "8px 16px", borderRadius: 10,
              background: G, border: "none",
              color: "#fff", fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Cairo',sans-serif",
            }}>📥 تصدير CSV</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 16, marginBottom: 24,
      }}>
        {[
          { label: "إجمالي المسجلين", value: total, icon: "👥", color: B },
          { label: "المقاعد المتبقية", value: remaining, icon: "🎯", color: remaining === 0 ? R : "#10b981" },
          { label: "نسبة الامتلاء", value: `${fillPct}%`, icon: "📊", color: G },
          { label: "الطاقة الكلية", value: CAPACITY, icon: "🏛️", color: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 16, padding: "20px 18px",
            border: `1px solid ${s.color}20`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${s.color}12`, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "20px 24px",
        marginBottom: 24, border: "1px solid #f1f5f9",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: B }}>نسبة الامتلاء</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: fillPct >= 100 ? R : G }}>{fillPct}%</span>
        </div>
        <div style={{ height: 10, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${Math.min(fillPct, 100)}%`,
            background: fillPct >= 100
              ? `linear-gradient(90deg,${R},#dc2626)`
              : fillPct >= 70
              ? "linear-gradient(90deg,#f59e0b,#d97706)"
              : `linear-gradient(90deg,${B},${G})`,
            transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, textAlign: "left" }}>
          {total} من {CAPACITY} مشارك
        </div>
      </div>

      {/* جدول المسجلين */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1px solid #f1f5f9",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        {/* رأس الجدول */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, background: "#FAFBFD",
        }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: B }}>
            📋 قائمة المسجلين ({filtered.length})
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث..."
              style={{
                padding: "8px 36px 8px 14px",
                border: "1.5px solid #e2e8f0", borderRadius: 10,
                fontSize: 13, fontFamily: "'Cairo',sans-serif",
                background: "#F8FAFC", color: "#1e293b",
                minWidth: 200, direction: "rtl",
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            ⏳ جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🫁</div>
            <div style={{ fontWeight: 700, color: "#64748b" }}>
              {search ? "لا توجد نتائج" : "لا يوجد مسجلون بعد"}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #f1f5f9" }}>
                  {["#", "المشارك", "الإيميل", "الواتساب", "التخصص", "جهة العمل", "تاريخ التسجيل", ""].map((h, i) => (
                    <th key={i} style={{
                      padding: "12px 16px", textAlign: "right",
                      fontWeight: 700, color: "#64748b",
                      fontSize: 11, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="reg-row" style={{
                    borderBottom: "1px solid #f8fafc",
                    transition: "background 0.1s",
                  }}>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 600 }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: `hsl(${(r.id * 47) % 360},60%,50%)`,
                          display: "flex", alignItems: "center",
                          justifyContent: "center", color: "#fff",
                          fontSize: 14, fontWeight: 800, flexShrink: 0,
                        }}>
                          {r.fullNameAr?.[0] || "؟"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#1e293b" }}>{r.fullNameAr}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", direction: "ltr" }}>{r.fullNameEn}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", direction: "ltr", fontSize: 12, color: "#475569" }}>
                      {r.email}
                    </td>
                    <td style={{ padding: "12px 16px", direction: "ltr", fontSize: 12, color: "#059669", fontWeight: 600 }}>
                      {r.whatsapp}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: "#854d0e",
                        background: "#fefce8", border: "1px solid #fde68a",
                        padding: "2px 8px", borderRadius: 20,
                      }}>{r.specialty}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#475569", maxWidth: 140 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.workplace}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {new Date(r.createdAt).toLocaleDateString("ar-EG", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{
                          padding: "5px 12px", borderRadius: 8,
                          border: `1px solid ${R}`, background: "#fff",
                          color: R, cursor: "pointer", fontSize: 11,
                          fontWeight: 700, fontFamily: "'Cairo',sans-serif",
                        }}
                      >🗑️ حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}