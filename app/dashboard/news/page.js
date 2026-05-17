"use client";
import { useState, useEffect } from "react";

const B = "#1B365D";
const R = "#C8102E";
const G = "#D4AF37";

// Toast إشعارات
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

// أيقونات متاحة
const ICON_OPTIONS = ["📰", "📋", "📅", "🌍", "🎤", "🔬", "👥", "🏆", "💡", "⚠️"];

export default function NewsDashboard() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);

  // الكائن الافتراضي يبدأ بحقل تاريخ فارغ لتجنب خطأ الـ Hydration المزعج
  const EMPTY = {
    title: "",
    date: "",
    icon: "📰",
    content: "",
    published: true,
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news", {
        headers: {
          "x-admin-token": "samoud2025",
        },
      });
      const data = await res.json();
      setNews(data.items || []);
    } catch {
      showToast("فشل تحميل الأخبار", false);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!editItem.title.trim()) {
      alert("العنوان مطلوب");
      return;
    }
    if (!editItem.content.trim()) {
      alert("المحتوى مطلوب");
      return;
    }

    // إذا ترك المستخدم حقل التاريخ فارغاً، نقوم بصياغته فوراً داخل المتصفح لحظة الإرسال فقط
    const finalItem = {
      ...editItem,
      date: editItem.date.trim() ? editItem.date : new Date().toLocaleDateString("ar-EG")
    };

    const isEdit = !!finalItem.id;
    try {
      const res = await fetch("/api/news", {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "samoud2025",
        },
        body: JSON.stringify(finalItem),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNews((prev) =>
        isEdit
          ? prev.map((i) => (i.id === finalItem.id ? data.item : i))
          : [data.item, ...prev]
      );
      setShowForm(false);
      setEditItem(null);
      showToast(isEdit ? "تم التحديث" : "تمت الإضافة ✨");
    } catch (e) {
      showToast(e.message, false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": "samoud2025",
        },
      });
      if (!res.ok) throw new Error();
      setNews((prev) => prev.filter((i) => i.id !== id));
      showToast("تم الحذف");
    } catch {
      showToast("فشل الحذف", false);
    }
  };

  const handleToggle = async (item) => {
    try {
      const res = await fetch("/api/news", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "samoud2025",
        },
        body: JSON.stringify({ id: item.id, published: !item.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setNews((prev) =>
        prev.map((i) => (i.id === item.id ? data.item : i))
      );
      showToast(data.item.published ? "تم النشر" : "تم الإخفاء");
    } catch {
      showToast("فشلت العملية", false);
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
    direction: "rtl",
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: B }}>📰 إدارة الأخبار</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            تحكم بالأخبار التي تظهر في الصفحة الرئيسية
          </div>
        </div>
        <button
          onClick={() => {
            setEditItem({ ...EMPTY });
            setShowForm(true);
          }}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            background: B,
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ➕ إضافة خبر جديد
        </button>
      </div>

      {/* Form */}
      {showForm && editItem && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `1.5px solid ${G}40`,
            padding: 24,
            marginBottom: 24,
            boxShadow: `0 4px 20px ${G}18`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: B, marginBottom: 20 }}>
            {editItem.id ? "✏️ تعديل الخبر" : "➕ إضافة خبر جديد"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* العنوان */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 5 }}>
                العنوان *
              </label>
              <input
                style={inputStyle}
                value={editItem.title}
                onChange={(e) =>
                  setEditItem((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="مثال: افتتاح التسجيل للمؤتمر"
              />
            </div>

            {/* التاريخ والأيقونة */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 5 }}>
                  التاريخ (اتركه فارغاً ليعتمد تاريخ اليوم تلقائياً)
                </label>
                <input
                  style={inputStyle}
                  value={editItem.date}
                  onChange={(e) =>
                    setEditItem((prev) => ({ ...prev, date: e.target.value }))
                  }
                  placeholder="مثال: ١ مايو ٢٠٢٦"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 5 }}>
                  الأيقونة
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ICON_OPTIONS.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setEditItem((prev) => ({ ...prev, icon: ico }))}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        fontSize: 22,
                        cursor: "pointer",
                        background: editItem.icon === ico ? `${G}20` : "#F1F5F9",
                        border:
                          editItem.icon === ico ? `2px solid ${G}` : "1px solid transparent",
                      }}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* المحتوى */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 5 }}>
                المحتوى *
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                value={editItem.content}
                onChange={(e) =>
                  setEditItem((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="نص الخبر هنا..."
              />
            </div>

            {/* أزرار */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditItem(null);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  fontSize: 13,
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  background: B,
                  color: "#fff",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {editItem.id ? "💾 حفظ التعديلات" : "➕ إضافة الخبر"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* قائمة الأخبار */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          ⏳ جاري التحميل...
        </div>
      ) : news.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            background: "#fff",
            borderRadius: 14,
            border: "1.5px dashed #e2e8f0",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📰</div>
          <div style={{ fontWeight: 700, color: "#64748b" }}>لا توجد أخبار بعد</div>
          <button
            onClick={() => {
              setEditItem({ ...EMPTY });
              setShowForm(true);
            }}
            style={{
              marginTop: 16,
              padding: "8px 20px",
              background: B,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ➕ أضف أول خبر
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {news.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: 14,
                border: `1px solid ${item.published === false ? "#e2e8f0" : `${G}40`}`,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: item.published === false ? 0.65 : 1,
                transition: "all 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {/* الأيقونة */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `${item.icon === "📰" ? B : G}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>

              {/* المحتوى */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: B }}>{item.title}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", background: "#F1F5F9", padding: "2px 10px", borderRadius: 20 }}>
                    {item.date}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.content}
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleToggle(item)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background:
                      item.published !== false ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.1)",
                    color: item.published !== false ? "#10b981" : "#94a3b8",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {item.published !== false ? "✅ منشور" : "🔒 مخفي"}
                </button>
                <button
                  onClick={() => {
                    setEditItem({ ...item });
                    setShowForm(true);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: `1px solid ${B}`,
                    background: "#fff",
                    color: B,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ✏️ تعديل
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}