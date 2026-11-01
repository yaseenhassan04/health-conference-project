"use client";
// app/dashboard/videos/page.jsx

import { useState, useEffect, useRef } from "react";

const B = "#1B365D";
const R = "#C8102E";
const G = "#D4AF37";

function Toast({ msg, ok }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%",
      transform: "translateX(-50%)",
      background: ok ? "#10b981" : R,
      color: "#fff", padding: "12px 24px",
      borderRadius: 12, fontSize: 14, fontWeight: 700,
      zIndex: 9999, fontFamily: "'Cairo', sans-serif",
      animation: "fadeUp 0.25s ease",
      whiteSpace: "nowrap",
    }}>
      {ok ? "✅" : "❌"} {msg}
    </div>
  );
}

const ICON_OPTIONS = ["🎬", "🎤", "🏥", "🎓", "📽️", "🔬", "🌍", "🏆"];

const EMPTY = {
  titleAr: "",
  titleEn: "",
  src: "",
  poster: "",
  duration: "",
  icon: "🎬",
  published: true,
};

// ─── مكوّن رفع الفيديو ───
function VideoUploader({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      alert("نوع الملف غير مدعوم. يُسمح فقط بـ mp4, webm, ogg");
      return;
    }

    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("حجم الفيديو يتجاوز 200MB");
      return;
    }

    setUploading(true);
    setProgress(0);

    // محاكاة progress أثناء الرفع
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 85));
    }, 400);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/videos/upload", {
        method: "POST",
        headers: { "x-admin-token": "samoud2025" },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        onUploaded(data.url);
      }, 600);

    } catch (err) {
      clearInterval(progressInterval);
      setUploading(false);
      setProgress(0);
      alert("فشل الرفع: " + err.message);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        style={{ display: "none" }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {/* منطقة السحب والإفلات */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? G : uploading ? "#10b981" : "#cbd5e1"}`,
          borderRadius: 14,
          padding: "28px 20px",
          textAlign: "center",
          cursor: uploading ? "default" : "pointer",
          background: dragging ? `${G}08` : uploading ? "#f0fdf4" : "#F8FAFC",
          transition: "all 0.2s",
        }}
      >
        {uploading ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 12 }}>
              جاري الرفع...
            </div>
            {/* Progress Bar */}
            <div style={{
              width: "100%", height: 8, background: "#e2e8f0",
              borderRadius: 10, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 10,
                background: "linear-gradient(90deg, #10b981, #059669)",
                width: `${progress}%`,
                transition: "width 0.3s ease",
              }} />
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
              {Math.round(progress)}%
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎬</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: B, marginBottom: 6 }}>
              اسحب الفيديو هنا أو اضغط للاختيار
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              MP4, WebM, OGG — حجم أقصى 200MB
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideosDashboard() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [srcMode, setSrcMode] = useState("upload"); // "upload" | "url"

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos", {
        headers: { "x-admin-token": "samoud2025" },
      });
      const data = await res.json();
      setVideos(data.items || []);
    } catch {
      showToast("فشل تحميل الفيديوهات", false);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!editItem.titleAr.trim()) { alert("العنوان العربي مطلوب"); return; }
    if (!editItem.src.trim()) { alert("رابط الفيديو مطلوب — ارفع فيديو أو أدخل رابطاً"); return; }

    const isEdit = !!editItem.id;
    try {
      const res = await fetch("/api/videos", {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "samoud2025",
        },
        body: JSON.stringify(editItem),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVideos(prev =>
        isEdit
          ? prev.map(i => i.id === editItem.id ? data.item : i)
          : [data.item, ...prev]
      );
      setShowForm(false);
      setEditItem(null);
      showToast(isEdit ? "تم التحديث ✨" : "تمت الإضافة ✨");
    } catch (e) {
      showToast(e.message || "حدث خطأ", false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفيديو؟")) return;
    try {
      const res = await fetch(`/api/videos?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": "samoud2025" },
      });
      if (!res.ok) throw new Error();
      setVideos(prev => prev.filter(i => i.id !== id));
      showToast("تم الحذف");
    } catch {
      showToast("فشل الحذف", false);
    }
  };

  const handleToggle = async (item) => {
    try {
      const res = await fetch("/api/videos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "samoud2025",
        },
        body: JSON.stringify({ id: item.id, published: !item.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setVideos(prev => prev.map(i => i.id === item.id ? data.item : i));
      showToast(data.item.published ? "تم النشر" : "تم الإخفاء");
    } catch {
      showToast("فشلت العملية", false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    borderRadius: 10, border: "1.5px solid #e2e8f0",
    fontSize: 13, fontFamily: "'Cairo', sans-serif",
    color: B, background: "#F8FAFC",
    outline: "none", direction: "rtl",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 700, color: B,
    display: "block", marginBottom: 5,
  };

  return (
    <div style={{
      direction: "rtl", fontFamily: "'Cairo', sans-serif",
      padding: "28px 24px", maxWidth: 1000, margin: "0 auto",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24, flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: B }}>🎬 إدارة الفيديوهات الترويجية</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            تحكم بالفيديوهات التي تظهر في الصفحة الرئيسية
          </div>
        </div>
        <button
          onClick={() => { setEditItem({ ...EMPTY }); setSrcMode("upload"); setShowForm(true); }}
          style={{
            padding: "10px 20px", borderRadius: 10,
            background: B, color: "#fff", border: "none",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          ➕ إضافة فيديو جديد
        </button>
      </div>

      {/* Form */}
      {showForm && editItem && (
        <div style={{
          background: "#fff", borderRadius: 16,
          border: `1.5px solid ${G}40`, padding: 24,
          marginBottom: 24, boxShadow: `0 4px 20px ${G}18`,
        }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: B, marginBottom: 20 }}>
            {editItem.id ? "✏️ تعديل الفيديو" : "➕ إضافة فيديو جديد"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* العناوين */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>العنوان بالعربي *</label>
                <input style={inputStyle} value={editItem.titleAr}
                  onChange={e => setEditItem(p => ({ ...p, titleAr: e.target.value }))}
                  placeholder="مثال: الفيلم التعريفي بالمؤتمر" />
              </div>
              <div>
                <label style={{ ...labelStyle, direction: "ltr", textAlign: "right" }}>
                  العنوان بالإنجليزي
                </label>
                <input style={{ ...inputStyle, direction: "ltr" }}
                  value={editItem.titleEn}
                  onChange={e => setEditItem(p => ({ ...p, titleEn: e.target.value }))}
                  placeholder="Conference Introduction" />
              </div>
            </div>

            {/* مصدر الفيديو — Toggle */}
            <div>
              <label style={labelStyle}>مصدر الفيديو *</label>

              {/* Tabs */}
              <div style={{
                display: "flex", gap: 0, marginBottom: 12,
                border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden",
              }}>
                <button
                  type="button"
                  onClick={() => setSrcMode("upload")}
                  style={{
                    flex: 1, padding: "9px 0",
                    background: srcMode === "upload" ? B : "#fff",
                    color: srcMode === "upload" ? "#fff" : "#64748b",
                    border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    fontFamily: "'Cairo', sans-serif",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 6,
                  }}
                >
                  📁 رفع من الجهاز
                </button>
                <button
                  type="button"
                  onClick={() => setSrcMode("url")}
                  style={{
                    flex: 1, padding: "9px 0",
                    background: srcMode === "url" ? B : "#fff",
                    color: srcMode === "url" ? "#fff" : "#64748b",
                    border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    fontFamily: "'Cairo', sans-serif",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 6,
                  }}
                >
                  🔗 إدخال رابط
                </button>
              </div>

              {/* رفع من الجهاز */}
              {srcMode === "upload" && (
                <div>
                  <VideoUploader
                    onUploaded={(url) => {
                      setEditItem(p => ({ ...p, src: url }));
                      showToast("تم رفع الفيديو بنجاح 🎬");
                    }}
                  />
                  {/* عرض الرابط بعد الرفع */}
                  {editItem.src && editItem.src.startsWith("http") && (
                    <div style={{
                      marginTop: 10, padding: "10px 14px",
                      background: "#f0fdf4", borderRadius: 10,
                      border: "1px solid #86efac",
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", gap: 10,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#10b981", fontSize: 16 }}>✅</span>
                        <span style={{
                          fontSize: 11, color: "#065f46", fontWeight: 600,
                          direction: "ltr", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                          maxWidth: 400,
                        }}>
                          {editItem.src}
                        </span>
                      </div>
                      <button
                        onClick={() => setPreviewSrc(editItem.src)}
                        style={{
                          padding: "4px 12px", borderRadius: 8,
                          background: `${R}15`, border: `1px solid ${R}40`,
                          color: R, cursor: "pointer", fontSize: 11,
                          fontWeight: 700, whiteSpace: "nowrap",
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >▶ معاينة</button>
                    </div>
                  )}
                </div>
              )}

              {/* إدخال رابط */}
              {srcMode === "url" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    style={{ ...inputStyle, direction: "ltr", flex: 1 }}
                    value={editItem.src}
                    onChange={e => setEditItem(p => ({ ...p, src: e.target.value }))}
                    placeholder="https://... أو /videos/promo.mp4"
                  />
                  {editItem.src && (
                    <button
                      onClick={() => setPreviewSrc(editItem.src)}
                      style={{
                        padding: "0 16px", borderRadius: 10,
                        background: `${R}15`, border: `1px solid ${R}40`,
                        color: R, cursor: "pointer", fontSize: 12, fontWeight: 700,
                        whiteSpace: "nowrap", fontFamily: "'Cairo', sans-serif",
                      }}
                    >▶ معاينة</button>
                  )}
                </div>
              )}
            </div>

            {/* صورة الغلاف */}
            <div>
              <label style={labelStyle}>صورة الغلاف (Thumbnail) — مسار أو رابط</label>
              <input style={{ ...inputStyle, direction: "ltr" }}
                value={editItem.poster}
                onChange={e => setEditItem(p => ({ ...p, poster: e.target.value }))}
                placeholder="/images/thumb.jpg أو https://..." />
            </div>

            {/* المدة والأيقونة */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14 }}>
              <div>
                <label style={labelStyle}>مدة الفيديو</label>
                <input style={{ ...inputStyle, direction: "ltr", maxWidth: 140 }}
                  value={editItem.duration}
                  onChange={e => setEditItem(p => ({ ...p, duration: e.target.value }))}
                  placeholder="2:30" />
              </div>
              <div>
                <label style={labelStyle}>الأيقونة</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ICON_OPTIONS.map(ico => (
                    <button key={ico} type="button"
                      onClick={() => setEditItem(p => ({ ...p, icon: ico }))}
                      style={{
                        width: 42, height: 42, borderRadius: 10,
                        fontSize: 22, cursor: "pointer",
                        background: editItem.icon === ico ? `${G}20` : "#F1F5F9",
                        border: editItem.icon === ico ? `2px solid ${G}` : "1px solid transparent",
                      }}
                    >{ico}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* حالة النشر */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" id="pub-check"
                checked={editItem.published}
                onChange={e => setEditItem(p => ({ ...p, published: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: "pointer" }} />
              <label htmlFor="pub-check"
                style={{ fontSize: 13, fontWeight: 700, color: B, cursor: "pointer" }}>
                نشر الفيديو (يظهر في الصفحة الرئيسية)
              </label>
            </div>

            {/* أزرار */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button
                onClick={() => { setShowForm(false); setEditItem(null); }}
                style={{
                  padding: "10px 20px", borderRadius: 10,
                  border: "1px solid #e2e8f0", background: "#fff",
                  fontSize: 13, cursor: "pointer", color: "#64748b",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >إلغاء</button>
              <button onClick={handleSave} style={{
                padding: "10px 24px", borderRadius: 10,
                background: B, color: "#fff", border: "none",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
              }}>
                {editItem.id ? "💾 حفظ التعديلات" : "➕ إضافة الفيديو"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* معاينة الفيديو */}
      {previewSrc && (
        <div onClick={() => setPreviewSrc(null)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9000, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: "relative", width: "100%", maxWidth: 800,
            borderRadius: 16, overflow: "hidden",
          }}>
            <button onClick={() => setPreviewSrc(null)} style={{
              position: "absolute", top: 10, right: 10,
              background: R, border: "none", borderRadius: "50%",
              width: 36, height: 36, color: "#fff", fontSize: 15,
              cursor: "pointer", zIndex: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
            <video src={previewSrc} controls autoPlay style={{
              width: "100%", display: "block",
              background: "#000", maxHeight: "70vh",
            }} />
          </div>
        </div>
      )}

      {/* قائمة الفيديوهات */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          ⏳ جاري التحميل...
        </div>
      ) : videos.length === 0 ? (
        <div style={{
          textAlign: "center", padding: 60,
          background: "#fff", borderRadius: 14,
          border: "1.5px dashed #e2e8f0",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <div style={{ fontWeight: 700, color: "#64748b" }}>لا توجد فيديوهات بعد</div>
          <button
            onClick={() => { setEditItem({ ...EMPTY }); setSrcMode("upload"); setShowForm(true); }}
            style={{
              marginTop: 16, padding: "8px 20px",
              background: B, color: "#fff",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
            }}
          >➕ أضف أول فيديو</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {videos.map((item) => (
            <div key={item.id} style={{
              background: "#fff", borderRadius: 14,
              border: `1px solid ${item.published === false ? "#e2e8f0" : `${G}40`}`,
              padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 16,
              opacity: item.published === false ? 0.65 : 1,
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              {/* Thumbnail */}
              <div style={{
                position: "relative", width: 90, height: 60,
                borderRadius: 10, overflow: "hidden",
                flexShrink: 0, background: "#0D1B2A",
                border: `1.5px solid ${G}30`,
              }}>
                {item.poster && (
                  <img src={item.poster} alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }}
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                )}
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div
                    onClick={() => setPreviewSrc(item.src)}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "rgba(200,16,46,0.85)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ color: "#fff", fontSize: 11, marginInlineStart: 2 }}>▶</span>
                  </div>
                </div>
                {item.duration && (
                  <div style={{
                    position: "absolute", bottom: 3, right: 4,
                    background: "rgba(0,0,0,0.75)",
                    color: "#fff", fontSize: 9, fontWeight: 700,
                    padding: "1px 5px", borderRadius: 4, direction: "ltr",
                  }}>{item.duration}</div>
                )}
              </div>

              {/* المحتوى */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: B }}>{item.titleAr}</span>
                  {item.titleEn && (
                    <span style={{
                      fontSize: 11, color: "#94a3b8",
                      background: "#F1F5F9", padding: "2px 10px", borderRadius: 20,
                      direction: "ltr",
                    }}>{item.titleEn}</span>
                  )}
                </div>
                <div style={{
                  fontSize: 11, color: "#64748b", direction: "ltr",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  🔗 {item.src}
                </div>
                {/* Badge: Blob أو محلي */}
                <div style={{ marginTop: 4 }}>
                  {item.src?.includes("vercel-storage") || item.src?.includes("blob.vercel") ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#0369a1",
                      background: "#e0f2fe", padding: "2px 8px", borderRadius: 20,
                    }}>☁️ Vercel Blob</span>
                  ) : (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#065f46",
                      background: "#dcfce7", padding: "2px 8px", borderRadius: 20,
                    }}>📁 محلي</span>
                  )}
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button onClick={() => handleToggle(item)} style={{
                  padding: "6px 12px", borderRadius: 8, border: "none",
                  cursor: "pointer",
                  background: item.published !== false ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.1)",
                  color: item.published !== false ? "#10b981" : "#94a3b8",
                  fontSize: 12, fontWeight: 700,
                  fontFamily: "'Cairo', sans-serif",
                }}>
                  {item.published !== false ? "✅ منشور" : "🔒 مخفي"}
                </button>
                <button onClick={() => {
                  setEditItem({ ...item });
                  setSrcMode(item.src?.startsWith("http") ? "url" : "upload");
                  setShowForm(true);
                }} style={{
                  padding: "6px 12px", borderRadius: 8,
                  border: `1px solid ${B}`, background: "#fff",
                  color: B, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  fontFamily: "'Cairo', sans-serif",
                }}>
                  ✏️ تعديل
                </button>
                <button onClick={() => handleDelete(item.id)} style={{
                  padding: "6px 12px", borderRadius: 8,
                  border: `1px solid ${R}`, background: "#fff",
                  color: R, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  fontFamily: "'Cairo', sans-serif",
                }}>
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