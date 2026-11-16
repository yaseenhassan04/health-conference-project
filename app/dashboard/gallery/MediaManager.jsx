"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const B = "#1B365D", R = "#C8102E", G = "#D4AF37";
const TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "samoud2025";

export const CATEGORIES = [
  { id: 1, ar: "المؤتمرات السابقة", en: "Past Conferences" },
  { id: 2, ar: "الورش الطبية", en: "Medical Workshops" },
  { id: 3, ar: "الجولات الميدانية", en: "Field Tours" },
  { id: 4, ar: "اللقطات التحضيرية", en: "Prep Shots" },
];
const TAG_OPTIONS = [
  { ar: "فعاليات", en: "Events" }, { ar: "ورش", en: "Workshops" },
  { ar: "متحدثون", en: "Speakers" }, { ar: "جلسات", en: "Sessions" },
  { ar: "مستشفى", en: "Hospital" }, { ar: "أخرى", en: "Other" },
];

function proxyImg(url) {
  if (!url) return "";
  if (url.includes("vercel-storage.com") || url.includes("blob.vercel")) {
    const decoded = decodeURIComponent(url);
    return `/api/gallery/image?url=${encodeURIComponent(decoded)}`;
  }
  return url;
}

async function api(url, opts = {}) {
  const res = await fetch(url, {
    cache: "no-store",
    ...opts,
    headers: { "x-admin-token": TOKEN, ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `خطأ ${res.status}`);
  return data;
}

function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.url) resolve(data.url);
          else reject(new Error(data.error || "فشل الرفع"));
        } catch { reject(new Error("خطأ في قراءة الرد")); }
      } else {
        try { reject(new Error(JSON.parse(xhr.responseText).error || `خطأ ${xhr.status}`)); }
        catch { reject(new Error(`خطأ ${xhr.status}`)); }
      }
    });
    xhr.addEventListener("error", () => reject(new Error("انقطع الاتصال أثناء الرفع")));
    xhr.addEventListener("abort", () => reject(new Error("تم إلغاء الرفع")));
    xhr.addEventListener("timeout", () => reject(new Error("انتهت مهلة الرفع")));
    xhr.open("POST", "/api/gallery/upload");
    xhr.setRequestHeader("x-admin-token", TOKEN);
    xhr.timeout = 5 * 60 * 1000;
    xhr.send(fd);
  });
}

const jsonOpts = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0",
  fontSize: 13, fontFamily: "'Cairo',sans-serif", color: B, background: "#F8FAFC", outline: "none",
};
const btn = (bg, color = "#fff", extra = {}) => ({
  padding: "8px 16px", borderRadius: 10, background: bg, color, border: "none",
  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif", ...extra,
});

function ProgressBar({ pct }) {
  if (pct === null || pct === undefined) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ background: "#e2e8f0", borderRadius: 10, overflow: "hidden", height: 10 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${B}, ${G})`, transition: "width 0.2s ease", borderRadius: 10 }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: B, fontWeight: 700, marginTop: 4 }}>
        {pct < 100 ? `جاري الرفع... ${pct}%` : "✅ اكتمل الرفع"}
      </div>
    </div>
  );
}

function DropZone({ onFiles, accept = "*/*", multiple = false, label }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const handle = (list) => { const files = Array.from(list || []); if (files.length) onFiles(files); };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
      style={{ border: `2.5px dashed ${drag ? G : "#cbd5e1"}`, borderRadius: 14, padding: "24px 16px", textAlign: "center", cursor: "pointer", background: drag ? `${G}0a` : "#F8FAFC" }}
    >
      <input ref={ref} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
      <div style={{ fontSize: 32, opacity: 0.4 }}>🎬</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginTop: 6 }}>{label}</div>
    </div>
  );
}

/* ✅ Thumb — الفيديو لا يشتغل إلا عند الضغط */
function Thumb({ item }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef();

  const handlePlay = (e) => {
    e.stopPropagation();
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  return (
    <div style={{ width: "100%", background: "#0d1b2a", position: "relative", overflow: "hidden", minHeight: 120, maxHeight: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {item.type !== "video" && (
        <img src={proxyImg(item.src)} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(12px) brightness(0.35)", transform: "scale(1.05)", pointerEvents: "none" }} />
      )}

      {item.type === "video" ? (
        playing ? (
          /* ✅ فيديو حقيقي — يشتغل فقط بعد الضغط، بدون autoplay وبدون صوت تلقائي */
          <video
            ref={videoRef}
            src={item.src}
            controls
            autoPlay={false}
            muted={false}
            preload="none"
            style={{ position: "relative", maxWidth: "100%", maxHeight: 220, objectFit: "contain", zIndex: 1 }}
          />
        ) : (
          /* ✅ قبل الضغط — يظهر الغلاف أو أيقونة تشغيل */
          <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handlePlay}>
            {item.thumbnail
              ? <img src={proxyImg(item.thumbnail)} alt="" style={{ maxWidth: "100%", maxHeight: 220, objectFit: "contain", zIndex: 1 }} />
              : <div style={{ width: "100%", minHeight: 120, background: "#0d1b2a", display: "flex", alignItems: "center", justifyContent: "center" }} />
            }
            {/* زر تشغيل */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(0,0,0,0.65)", borderRadius: "50%", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
              <span style={{ fontSize: 22, marginLeft: 4 }}>▶️</span>
            </div>
          </div>
        )
      ) : (
        <img src={proxyImg(item.src)} alt={item.captionAr || ""} style={{ position: "relative", maxWidth: "100%", maxHeight: 220, width: "auto", height: "auto", objectFit: "contain", display: "block", zIndex: 1 }} />
      )}
    </div>
  );
}

const EMPTY = { type: "image", src: "", thumbnail: "", captionAr: "", captionEn: "", tag: "فعاليات", tagEn: "Events", category: 1, published: true };

export default function MediaManager({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [uploadPct, setUploadPct] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [filterCat, setFilterCat] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [banner, setBanner] = useState(null);
  const [orderBusy, setOrderBusy] = useState(false);

  /* ✅ Drag & Drop state */
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const notify = (msg, ok = true) => {
    showToast?.(msg, ok);
    setBanner({ msg, ok });
    setTimeout(() => setBanner(null), 4000);
  };

  const load = async () => {
    try {
      const d = await api("/api/gallery/media?all=1");
      setItems(d.items || []);
    } catch (e) {
      notify("فشل التحميل: " + e.message, false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => [...items].sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9)), [items]);
  const visible = useMemo(() => (filterCat === 0 ? sorted : sorted.filter((i) => i.category === filterCat)), [sorted, filterCat]);

  /* ✅ حفظ الترتيب بـ request واحد */
  const saveOrder = useCallback(async (newSorted) => {
    setOrderBusy(true);
    try {
      const orderMap = newSorted.map((item, idx) => ({ id: item.id, order: idx }));
      await api("/api/gallery/media/reorder", jsonOpts("POST", { order: orderMap }));
      notify("✅ تم حفظ الترتيب");
    } catch (e) {
      notify("فشل حفظ الترتيب: " + e.message, false);
      load();
    } finally {
      setOrderBusy(false);
    }
  }, []);

  /* ✅ Drag & Drop handlers */
  const onDragStart = (e, item) => {
    dragItem.current = item.id;
    setDragId(item.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragEnter = (e, item) => {
    e.preventDefault();
    dragOverItem.current = item.id;
    setDragOverId(item.id);
  };

  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  const onDragEnd = async () => {
    if (!dragItem.current || !dragOverItem.current || dragItem.current === dragOverItem.current) {
      setDragId(null);
      setDragOverId(null);
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const arr = [...sorted];
    const fromIdx = arr.findIndex((x) => String(x.id) === String(dragItem.current));
    const toIdx = arr.findIndex((x) => String(x.id) === String(dragOverItem.current));

    if (fromIdx === -1 || toIdx === -1) return;

    const newArr = [...arr];
    const [moved] = newArr.splice(fromIdx, 1);
    newArr.splice(toIdx, 0, moved);
    const renumbered = newArr.map((x, idx) => ({ ...x, order: idx }));

    setItems(renumbered);
    setDragId(null);
    setDragOverId(null);
    dragItem.current = null;
    dragOverItem.current = null;

    await saveOrder(renumbered);
  };

  /* ✅ ترتيب بالأزرار (▲▼) — request واحد */
  const move = async (item, dir) => {
    const arr = [...sorted];
    const i = arr.findIndex((x) => String(x.id) === String(item.id));
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const renumbered = arr.map((x, idx) => ({ ...x, order: idx }));
    setItems(renumbered);
    await saveOrder(renumbered);
  };

  const onPickMain = async (incoming) => {
    const file = Array.isArray(incoming) ? incoming[0] : incoming;
    if (!file) return;
    const name = file.name || "";
    const type = file.type || "";
    const isVideo = type.includes("video") || /\.(mp4|mov|webm|m4v|avi|mkv)(\?|$)/i.test(name);
    const isImage = type.includes("image") || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(name);
    if (!isVideo && !isImage) { alert("عذراً، نوع الملف غير مدعوم."); return; }
    setBusy("uploading"); setUploadPct(0);
    try {
      const url = await uploadFile(file, (pct) => setUploadPct(pct));
      setEditItem((e) => ({ ...e, src: url, type: isVideo ? "video" : "image" }));
      notify("تم رفع الملف بنجاح ✨");
    } catch (err) { notify("فشل الرفع: " + err.message, false); }
    finally { setBusy(""); setUploadPct(null); }
  };

  const onPickThumb = async (incoming) => {
    const file = Array.isArray(incoming) ? incoming[0] : incoming;
    if (!file) return;
    setBusy("uploading_thumb"); setUploadPct(0);
    try {
      const url = await uploadFile(file, (pct) => setUploadPct(pct));
      setEditItem((e) => ({ ...e, thumbnail: url }));
      notify("تم رفع صورة الغلاف ✨");
    } catch (err) { notify("فشل رفع الغلاف: " + err.message, false); }
    finally { setBusy(""); setUploadPct(null); }
  };

  const save = async () => {
    if (!editItem.src) return notify("⚠️ ارفع صورة أو فيديو، أو الصق رابطًا أولًا", false);
    if (!editItem.captionAr.trim()) return notify("⚠️ اكتب التسمية بالعربي", false);
    const isEdit = !!editItem.id;
    setBusy("saving");
    try {
      const d = await api("/api/gallery/media", jsonOpts(isEdit ? "PATCH" : "POST", { ...editItem, order: isEdit ? editItem.order : items.length }));
      setItems((prev) => isEdit ? prev.map((i) => (String(i.id) === String(editItem.id) ? d.item : i)) : [...prev, d.item]);
      setEditItem(null);
      notify(isEdit ? "تم التحديث" : "تمت الإضافة ✨");
    } catch (e) { notify(e.message, false); }
    finally { setBusy(""); }
  };

  const bulkUpload = async (filesList) => {
    let done = 0;
    const base = items.length;
    for (const file of filesList) {
      setBusy(`bulk_${done + 1}_${filesList.length}`); setUploadPct(0);
      try {
        const isVideo = file.type?.includes("video") || /\.(mp4|mov|webm|m4v|avi)(\?|$)/i.test(file.name);
        const url = await uploadFile(file, (pct) => setUploadPct(pct));
        const name = file.name.replace(/\.[^.]+$/, "");
        const d = await api("/api/gallery/media", jsonOpts("POST", { ...EMPTY, type: isVideo ? "video" : "image", src: url, captionAr: name, captionEn: name, category: filterCat || 1, order: base + done }));
        setItems((prev) => [...prev, d.item]);
        done++;
      } catch (e) { notify(`فشل رفع ${file.name}: ${e.message}`, false); }
    }
    setBusy(""); setUploadPct(null);
    if (done) notify(`تم رفع ${done} ملف — عدّل التسميات من زر تعديل`);
  };

  const togglePublish = async (item) => {
    try {
      const d = await api("/api/gallery/media", jsonOpts("PATCH", { id: item.id, published: item.published === false }));
      setItems((prev) => prev.map((i) => (String(i.id) === String(item.id) ? d.item : i)));
      notify(d.item.published === false ? "تم الإخفاء" : "تم النشر");
    } catch (e) { notify(e.message, false); }
  };

  /* ✅ حذف batch — request واحد */
  const remove = async (ids) => {
    if (!ids.length) return;
    if (!confirm(ids.length === 1 ? "حذف هذا العنصر؟" : `حذف ${ids.length} عنصر؟`)) return;
    setItems((prev) => prev.filter((item) => !ids.map(String).includes(String(item.id))));
    setSelected(new Set());
    setBusy("deleting");
    try {
      await api("/api/gallery/media", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      notify("تم الحذف ✅");
    } catch (e) { notify("فشل الحذف: " + e.message, false); await load(); }
    finally { setBusy(""); }
  };

  const download = (item) => {
    const a = document.createElement("a");
    a.href = item.type === "video" ? item.src : proxyImg(item.src);
    a.download = item.captionEn || item.captionAr || "media";
    a.target = "_blank"; a.click();
  };
  const copyLink = (item) => navigator.clipboard.writeText(item.src).then(() => notify("تم نسخ الرابط"));
  const toggleSel = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = visible.length > 0 && visible.every((i) => selected.has(i.id));

  const busyLabel = (() => {
    if (!busy) return null;
    if (busy === "uploading") return "⏳ جاري رفع الملف...";
    if (busy === "uploading_thumb") return "⏳ جاري رفع صورة الغلاف...";
    if (busy === "saving") return "⏳ جاري الحفظ...";
    if (busy === "deleting") return "⏳ جاري الحذف...";
    if (busy.startsWith("bulk_")) { const [, n, total] = busy.split("_"); return `⏳ رفع متعدد — الملف ${n} من ${total}`; }
    return "⏳ جاري...";
  })();

  return (
    <div style={{ direction: "rtl" }}>
      {banner && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: banner.ok ? "#10b981" : R, color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14, zIndex: 99999, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
          {banner.ok ? "✅" : "❌"} {banner.msg}
        </div>
      )}

      {/* رأس */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: B }}>🎞️ معرض الوسائط ({items.length})</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            صور وفيديوهات السلايدر في الصفحة الرئيسية
            {orderBusy && <span style={{ color: G, marginRight: 8 }}>⏳ جاري حفظ الترتيب...</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={btn(G, B, { display: "inline-block", opacity: busy ? 0.6 : 1, cursor: busy ? "not-allowed" : "pointer" })}>
            📤 رفع متعدد
            <input type="file" accept="image/*,video/*,.mov,.mp4,.webm,.m4v" multiple hidden disabled={!!busy} onChange={(e) => { bulkUpload(Array.from(e.target.files)); e.target.value = ""; }} />
          </label>
          <button style={btn(B, "#fff", { opacity: busy ? 0.6 : 1 })} disabled={!!busy} onClick={() => setEditItem({ ...EMPTY, category: filterCat || 1 })}>➕ إضافة عنصر</button>
        </div>
      </div>

      {busy && (
        <div style={{ background: `${G}20`, color: B, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          {busyLabel}
          {uploadPct !== null && <ProgressBar pct={uploadPct} />}
        </div>
      )}

      {/* فلتر التصنيف + تحديد */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        {[{ id: 0, ar: "الكل" }, ...CATEGORIES].map((c) => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} style={btn(filterCat === c.id ? B : "#fff", filterCat === c.id ? "#fff" : "#64748b", { border: `1px solid ${B}20`, borderRadius: 30, padding: "5px 14px", fontSize: 12 })}>
            {c.ar}
          </button>
        ))}
        <div style={{ marginRight: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#64748b", cursor: "pointer" }}>
            <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(visible.map((i) => i.id)))} /> تحديد الكل
          </label>
          {selected.size > 0 && (
            <button style={btn(R, "#fff", { padding: "5px 14px", fontSize: 12 })} onClick={() => remove([...selected])}>
              🗑️ حذف المحدد ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* ✅ تلميح السحب */}
      {visible.length > 1 && (
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10, padding: "6px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          💡 اسحب البطاقات لإعادة ترتيبها، أو استخدم أزرار ▲▼
        </div>
      )}

      {/* نموذج الإضافة / التعديل */}
      {editItem && (
        <div style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${G}40`, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: B, marginBottom: 14 }}>{editItem.id ? "✏️ تعديل" : "➕ إضافة عنصر"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}>
              {editItem.src ? (
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", maxHeight: 220 }}>
                  {editItem.type === "video"
                    ? <video src={editItem.src} controls style={{ width: "100%", maxHeight: 220, background: "#000" }} />
                    : <img src={proxyImg(editItem.src)} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "cover" }} />}
                  <button style={btn(R, "#fff", { position: "absolute", top: 8, left: 8, padding: "4px 10px", fontSize: 11 })} onClick={() => setEditItem((e) => ({ ...e, src: "" }))}>✕ تغيير</button>
                </div>
              ) : (
                <>
                  <DropZone accept="image/*,video/*,.mov,.mp4,.webm,.m4v" onFiles={onPickMain} label="اسحب صورة أو فيديو أو اضغط للرفع (حتى 500MB)" />
                  {busy === "uploading" && uploadPct !== null && <ProgressBar pct={uploadPct} />}
                  <input style={{ ...inputStyle, direction: "ltr", marginTop: 10 }} placeholder="أو الصق رابط مباشر (https://...mp4)"
                    onBlur={(e) => { const v = e.target.value.trim(); if (v) setEditItem((p) => ({ ...p, src: v, type: /\.(mp4|webm|mov)(\?|$)/i.test(v) ? "video" : p.type })); }} />
                </>
              )}
            </div>

            {editItem.type === "video" && (
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 5 }}>صورة الغلاف للفيديو (اختياري)</label>
                {editItem.thumbnail ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <img src={proxyImg(editItem.thumbnail)} alt="" style={{ height: 70, borderRadius: 8 }} />
                    <button style={btn(R, "#fff", { padding: "4px 10px", fontSize: 11 })} onClick={() => setEditItem((p) => ({ ...p, thumbnail: "" }))}>إزالة</button>
                  </div>
                ) : (
                  <>
                    <DropZone accept="image/*" onFiles={onPickThumb} label="ارفع صورة غلاف" />
                    {busy === "uploading_thumb" && uploadPct !== null && <ProgressBar pct={uploadPct} />}
                  </>
                )}
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 5 }}>التسمية (عربي) *</label>
              <input style={inputStyle} value={editItem.captionAr} onChange={(e) => setEditItem((p) => ({ ...p, captionAr: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 5 }}>Caption (English)</label>
              <input style={{ ...inputStyle, direction: "ltr" }} value={editItem.captionEn} onChange={(e) => setEditItem((p) => ({ ...p, captionEn: e.target.value }))} />
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6 }}>القسم</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CATEGORIES.map((c) => (
                  <button key={c.id} type="button" onClick={() => setEditItem((p) => ({ ...p, category: c.id }))}
                    style={btn(editItem.category === c.id ? B : "#F1F5F9", editItem.category === c.id ? "#fff" : "#64748b", { borderRadius: 20, padding: "5px 14px", fontSize: 12 })}>
                    {c.ar}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6 }}>الوسم</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TAG_OPTIONS.map((t) => (
                  <button key={t.ar} type="button" onClick={() => setEditItem((p) => ({ ...p, tag: t.ar, tagEn: t.en }))}
                    style={btn(editItem.tag === t.ar ? G : "#F1F5F9", editItem.tag === t.ar ? B : "#64748b", { borderRadius: 20, padding: "5px 14px", fontSize: 12 })}>
                    {t.ar}
                  </button>
                ))}
              </div>
            </div>

            <label style={{ gridColumn: "1/-1", fontSize: 13, fontWeight: 700, color: B, cursor: "pointer" }}>
              <input type="checkbox" checked={editItem.published !== false} onChange={(e) => setEditItem((p) => ({ ...p, published: e.target.checked }))} /> منشور (يظهر في الموقع)
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button style={btn("#fff", "#64748b", { border: "1px solid #e2e8f0" })} onClick={() => setEditItem(null)}>إلغاء</button>
            <button style={btn(busy ? "#94a3b8" : B)} disabled={!!busy} onClick={save}>{editItem.id ? "💾 حفظ" : "➕ إضافة"}</button>
          </div>
        </div>
      )}

      {/* القائمة */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>⏳ جاري التحميل...</div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, background: "#fff", borderRadius: 14, border: "1.5px dashed #e2e8f0", color: "#94a3b8" }}>
          <div style={{ fontSize: 40 }}>🖼️</div>
          <div style={{ fontWeight: 700 }}>لا توجد عناصر في هذا القسم</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {visible.map((item) => {
            const pos = sorted.findIndex((x) => String(x.id) === String(item.id));
            const cat = CATEGORIES.find((c) => c.id === item.category);
            const isDragging = String(dragId) === String(item.id);
            const isOver = String(dragOverId) === String(item.id);
            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStart(e, item)}
                onDragEnter={(e) => onDragEnter(e, item)}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  overflow: "hidden",
                  border: isOver ? `2.5px dashed ${G}` : selected.has(item.id) ? `2px solid ${G}` : "1px solid #e8edf2",
                  opacity: isDragging ? 0.4 : item.published === false ? 0.6 : 1,
                  position: "relative",
                  cursor: "grab",
                  transition: "opacity 0.2s, border 0.15s, transform 0.15s",
                  transform: isOver ? "scale(1.02)" : "scale(1)",
                  boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.18)" : "none",
                }}
              >
                {/* ✅ أيقونة السحب */}
                <div style={{ position: "absolute", top: 8, right: 36, background: "rgba(0,0,0,0.4)", color: "#fff", width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, zIndex: 4, cursor: "grab" }} title="اسحب لإعادة الترتيب">⠿</div>

                <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSel(item.id)} style={{ position: "absolute", top: 10, left: 10, zIndex: 3, width: 18, height: 18 }} />
                <div style={{ position: "absolute", top: 8, right: 8, background: B, color: "#fff", minWidth: 24, height: 24, borderRadius: 12, padding: "0 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, zIndex: 2 }}>{pos + 1}</div>
                {item.type === "video" && <div style={{ position: "absolute", top: 40, right: 8, background: R, color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 10, zIndex: 2 }}>🎬 فيديو</div>}

                <Thumb item={item} />

                <div style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#9A7A10", fontWeight: 700, background: `${G}15`, padding: "2px 8px", borderRadius: 10 }}>{item.tag}</span>
                    {cat && <span style={{ fontSize: 11, color: B, background: `${B}0d`, padding: "2px 8px", borderRadius: 10 }}>{cat.ar}</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: B }}>{item.captionAr}</div>
                  {item.captionEn && <div style={{ fontSize: 11, color: "#94a3b8", direction: "ltr", textAlign: "left" }}>{item.captionEn}</div>}
                </div>

                <div style={{ display: "flex", gap: 5, padding: "0 10px 6px", flexWrap: "wrap" }}>
                  <button title="للأمام" style={btn("#F1F5F9", B, { padding: "5px 9px" })} disabled={pos === 0 || orderBusy} onClick={() => move(item, -1)}>▲</button>
                  <button title="للخلف" style={btn("#F1F5F9", B, { padding: "5px 9px" })} disabled={pos === sorted.length - 1 || orderBusy} onClick={() => move(item, +1)}>▼</button>
                  <button style={btn(item.published === false ? "#f1f5f9" : "rgba(16,185,129,0.12)", item.published === false ? "#94a3b8" : "#10b981", { padding: "5px 10px", fontSize: 11 })} onClick={() => togglePublish(item)}>
                    {item.published === false ? "🔒 مخفي" : "✅ منشور"}
                  </button>
                  <button title="تنزيل" style={btn("#F1F5F9", B, { padding: "5px 9px" })} onClick={() => download(item)}>⬇️</button>
                  <button title="نسخ الرابط" style={btn("#F1F5F9", B, { padding: "5px 9px" })} onClick={() => copyLink(item)}>🔗</button>
                </div>
                <div style={{ display: "flex", gap: 6, padding: "0 10px 10px" }}>
                  <button style={btn("#fff", B, { flex: 1, border: `1px solid ${B}`, padding: 6, fontSize: 11 })} onClick={() => setEditItem({ ...item })}>✏️ تعديل</button>
                  <button style={btn("#fff", R, { flex: 1, border: `1px solid ${R}`, padding: 6, fontSize: 11 })} onClick={() => remove([item.id])}>🗑️ حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}