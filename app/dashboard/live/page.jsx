"use client";
import { useState, useEffect } from "react";
const B = "#1B365D";
const R = "#C8102E";
const G = "#D4AF37";

function Toast({ msg, ok }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: ok ? "#10b981" : R,
        color: "#fff",
        padding: "12px 24px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 700,
        zIndex: 9999,
        fontFamily: "'Cairo', sans-serif",
        animation: "fadeUp 0.25s ease",
      }}
    >
      {ok ? "✅" : "❌"} {msg}
    </div>
  );
}

export default function LiveDashboard() {
  const [settings, setSettings] = useState({ meetLink: "", isLive: false });
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchAttendees();
  }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/live/settings");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch {
      showToast("فشل تحميل إعدادات البث", false);
    }
  };

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/live/attendees", {
        headers: { "x-admin-token": "samoud2025" },
      });
      const data = await res.json();
      setAttendees(data.attendees || []);
    } catch {
      showToast("فشل تحميل قائمة المشاهدين", false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/live/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "samoud2025",
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSettings(data.settings);
      showToast("تم حفظ إعدادات البث");
    } catch (e) {
      showToast(e.message || "فشل حفظ الإعدادات", false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLive = async () => {
    const nextIsLive = !settings.isLive;
    try {
      const res = await fetch("/api/live/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "samoud2025",
        },
        body: JSON.stringify({ isLive: nextIsLive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSettings(data.settings);
      showToast(nextIsLive ? "تم تفعيل البث المباشر" : "تم إيقاف البث المباشر");
    } catch (e) {
      showToast(e.message || "فشلت العملية", false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف بيانات هذا المشاهد؟")) return;
    try {
      const res = await fetch(`/api/live/attendees?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": "samoud2025" },
      });
      if (!res.ok) throw new Error();
      setAttendees((prev) => prev.filter((a) => a.id !== id));
      showToast("تم الحذف");
    } catch {
      showToast("فشل الحذف", false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 13,
    fontFamily: "'Cairo', sans-serif",
    color: B,
    background: "#F8FAFC",
    outline: "none",
    direction: "ltr",
    textAlign: "left",
  };

  return (
    <div
      style={{
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
        padding: "28px 24px",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: B }}>📡 إدارة البث المباشر</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
          اربط رابط Google Meet وتحكم بتفعيل البث، وتابع بيانات المشاهدين المسجلين
        </div>
      </div>

      {/* إعدادات البث */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: `1.5px solid ${G}40`,
          padding: 24,
          marginBottom: 28,
          boxShadow: `0 4px 20px ${G}18`,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 900, color: B, marginBottom: 20 }}>
          ⚙️ إعدادات البث
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 5 }}>
              رابط Google Meet
            </label>
            <input
              style={inputStyle}
              value={settings.meetLink}
              onChange={(e) => setSettings((prev) => ({ ...prev, meetLink: e.target.value }))}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: 12,
              background: settings.isLive ? "rgba(16,185,129,0.08)" : "#F8FAFC",
              border: `1px solid ${settings.isLive ? "#10b981" : "#e2e8f0"}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: B }}>
                {settings.isLive ? "🔴 البث مفعّل الآن" : "⏸️ البث متوقف"}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                عند التفعيل، ستظهر بطاقة تسجيل البيانات للزوار قبل مشاهدة البث
              </div>
            </div>
            <button
              onClick={handleToggleLive}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                background: settings.isLive ? "rgba(200,16,46,0.1)" : "#10b981",
                color: settings.isLive ? R : "#fff",
              }}
            >
              {settings.isLive ? "إيقاف البث" : "تفعيل البث"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                background: B,
                color: "#fff",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "جاري الحفظ..." : "💾 حفظ الرابط"}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة المشاهدين */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 900, color: B }}>
          👁️ المشاهدون المسجلون
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            background: "#fff",
            padding: "4px 12px",
            borderRadius: 20,
            border: "1px solid #e8edf2",
          }}
        >
          {attendees.length} مشاهد
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          ⏳ جاري التحميل...
        </div>
      ) : attendees.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            background: "#fff",
            borderRadius: 14,
            border: "1.5px dashed #e2e8f0",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>👁️</div>
          <div style={{ fontWeight: 700, color: "#64748b" }}>لا يوجد مشاهدون مسجلون بعد</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto", background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", textAlign: "right", color: B, fontWeight: 800 }}>الاسم</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: B, fontWeight: 800 }}>الجوال</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: B, fontWeight: 800 }}>البريد الإلكتروني</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: B, fontWeight: 800 }}>التخصص</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: B, fontWeight: 800 }}>وقت الانضمام</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: B, fontWeight: 800 }}></th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: B }}>{a.fullName}</td>
                  <td style={{ padding: "12px 16px", color: "#334155", direction: "ltr", textAlign: "right" }}>{a.phone}</td>
                  <td style={{ padding: "12px 16px", color: "#334155", direction: "ltr", textAlign: "right" }}>{a.email}</td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>{a.specialty}</td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 12 }}>
                    {new Date(a.joinedAt).toLocaleString("ar-EG")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => handleDelete(a.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: `1px solid ${R}`,
                        background: "#fff",
                        color: R,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      🗑️ حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
