"use client";

import { useState, useEffect, useRef, useMemo } from "react";

const B = "#1B365D", R = "#C8102E", G = "#D4AF37";
const TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "samoud2025";

/* نفس التصنيفات الموجودة في الصفحة الرئيسية (1..4) */
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
  if (url.includes("vercel-storage.com") || url.includes("blob.vercel"))
    return `/api/gallery/image?url=${encodeURIComponent(url)}`;
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
async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const d = await api("/api/gallery/upload", { method: "POST", body: fd });
  return d.url;
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

function DropZone({ onFiles, accept = "*/*", multiple = false, label }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const handle = (list) => {
    const files = Array.from(list || []);
    if (files.length) onFiles(files);
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
      style={{ border: `2.5px dashed ${drag ? G : "#cbd5e1"}`, borderRadius: 14, padding: "24px 16px", textAlign: "center", cursor: "pointer", background: drag ? `${G}0a` : "#F8FAFC" }}
    >
      <input ref={ref} type="file" accept={accept} multiple={multiple} hidden
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
      <div style={{ fontSize: 32, opacity: 0.4 }}>🎬</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Thumb({ item }) {
  return (
    <div style={{
      width: "100%",
      background: "#0d1b2a",
      position: "relative",
      overflow: "hidden",
      // aspect-ratio افتراضي 16:9، لكن الصورة نفسها تتحكم بالارتفاع الفعلي
      minHeight: 120,
      maxHeight: 220,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* blurred background */}
      {item.type !== "video" && (
        <img src={proxyImg(item.src)} alt="" aria-hidden style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: "blur(12px) brightness(0.35)",
          transform: "scale(1.05)",
          pointerEvents: "none",
        }} />
      )}
      {item.type === "video" ? (
        item.thumbnail
          ? <img src={proxyImg(item.thumbnail)} alt="" style={{ position: "relative", maxWidth: "100%", maxHeight: 220, objectFit: "contain", zIndex: 1 }} />
          : <video src={item.src} preload="metadata" muted style={{ position: "relative", maxWidth: "100%", maxHeight: 220, objectFit: "contain", zIndex: 1 }} />
      ) : (
        <img
          src={proxyImg(item.src)}
          alt={item.captionAr || ""}
          style={{
            position: "relative",
            maxWidth: "100%",
            maxHeight: 220,
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}

const EMPTY = {
  type: "image", src: "", thumbnail: "", captionAr: "", captionEn: "",
  tag: "فعاليات", tagEn: "Events", category: 1, published: true,
};

export default function MediaManager({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [filterCat, setFilterCat] = useState(0); // 0 = الكل
  const [selected, setSelected] = useState(new Set());
  const [banner, setBanner] = useState(null);

  const notify = (msg, ok = true) => {
    showToast?.(msg, ok);
    setBanner({ msg, ok });
    setTimeout(() => setBanner(null), 4000);
  };

  /* ───── تحميل ───── */
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

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9)),
    [items]
  );
  const visible = useMemo(
    () => (filterCat === 0 ? sorted : sorted.filter((i) => i.category === filterCat)),
    [sorted, filterCat]
  );

  /* ───── رفع ملف داخل النموذج (محدث ومرن جداً لقبول كافة أحجام وصيغ الفيديوهات) ───── */
  const onPickMain = async (incoming) => {
    const file = Array.isArray(incoming) ? incoming[0] : incoming;
    if (!file) return;

    const name = file.name || "";
    const type = file.type || "";
    // فحص شامل يقبل الصور والفيديوهات بمرونة تامة
    const isVideo = type.includes("video") || /\.(mp4|mov|webm|m4v|avi|mkv)(\?|$)/i.test(name);
    const isImage = type.includes("image") || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(name);

    if (!isVideo && !isImage) {
      alert("عذراً، نوع الملف غير مدعوم.");
      return;
    }

    setBusy("⏳ جاري رفع الملف الكبير (21MB)، يرجى الانتظار...");
    try {
      const url = await uploadFile(file);
      setEditItem((e) => ({ ...e, src: url, type: isVideo ? "video" : "image" }));
      notify("تم رفع الملف بنجاح ✨");
    } catch (err) { 
      notify("فشل الرفع: " + err.message, false); 
    } finally { 
      setBusy(""); 
    }
  };

  const onPickThumb = async (incoming) => {
    const file = Array.isArray(incoming) ? incoming[0] : incoming;
    if (!file) return;
    setBusy("⏳ جاري رفع الغلاف...");
    try {
      const url = await uploadFile(file);
      setEditItem((e) => ({ ...e, thumbnail: url }));
    } catch (err) { notify(err.message, false); }
    finally { setBusy(""); }
  };

  /* ───── حفظ (إضافة / تعديل) ───── */
  const save = async () => {
    if (!editItem.src) return notify("⚠️ ارفع صورة أو فيديو، أو الصق رابطًا أولًا", false);
    if (!editItem.captionAr.trim()) return notify("⚠️ اكتب التسمية بالعربي", false);
    const isEdit = !!editItem.id;
    setBusy("⏳ جاري الحفظ...");
    try {
      const d = await api("/api/gallery/media", jsonOpts(isEdit ? "PATCH" : "POST", {
        ...editItem,
        order: isEdit ? editItem.order : items.length,
      }));
      setItems((prev) => isEdit ? prev.map((i) => (String(i.id) === String(editItem.id) ? d.item : i)) : [...prev, d.item]);
      setEditItem(null);
      notify(isEdit ? "تم التحديث" : "تمت الإضافة ✨");
    } catch (e) { notify(e.message, false); }
    finally { setBusy(""); }
  };

  /* ───── رفع متعدد ───── */
  const bulkUpload = async (filesList) => {
    let done = 0;
    const base = items.length;
    for (const file of filesList) {
      setBusy(`⏳ رفع ${done + 1} / ${filesList.length}`);
      try {
        const isVideo = file.type?.includes("video") || /\.(mp4|mov|webm|m4v|avi)(\?|$)/i.test(file.name);
        const url = await uploadFile(file);
        const name = file.name.replace(/\.[^.]+$/, "");
        const d = await api("/api/gallery/media", jsonOpts("POST", {
          ...EMPTY,
          type: isVideo ? "video" : "image",
          src: url,
          captionAr: name,
          captionEn: name,
          category: filterCat || 1,
          order: base + done,
        }));
        setItems((prev) => [...prev, d.item]);
        done++;
      } catch (e) { notify(`فشل رفع ${file.name}: ${e.message}`, false); }
    }
    setBusy("");
    if (done) notify(`تم رفع ${done} ملف — عدّل التسميات من زر تعديل`);
  };

  /* ───── نشر / إخفاء ───── */
  const togglePublish = async (item) => {
    try {
      const d = await api("/api/gallery/media", jsonOpts("PATCH", { id: item.id, published: item.published === false }));
      setItems((prev) => prev.map((i) => (String(i.id) === String(item.id) ? d.item : i)));
      notify(d.item.published === false ? "تم الإخفاء" : "تم النشر");
    } catch (e) { notify(e.message, false); }
  };

  /* ───── ترتيب ───── */
  const move = async (item, dir) => {
    const arr = [...sorted];
    const i = arr.findIndex((x) => String(x.id) === String(item.id));
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];

    const renumbered = arr.map((x, idx) => ({ ...x, order: idx }));
    const oldOrder = new Map(items.map((x) => [String(x.id), x.order]));
    const changed = renumbered.filter((x) => oldOrder.get(String(x.id)) !== x.order);

    setItems(renumbered);
    try {
      for (const x of changed) {
        await api("/api/gallery/media", jsonOpts("PATCH", { id: x.id, order: x.order }));
      }
    } catch (e) {
      notify("فشل حفظ الترتيب: " + e.message, false);
      load();
    }
  };

  /* ───── حذف ───── */
  const remove = async (ids) => {
    if (!ids.length) return;
    if (!confirm(ids.length === 1 ? "حذف هذا العنصر؟" : `حذف ${ids.length} عنصر؟`)) return;
    setBusy("⏳ جاري الحذف...");
    let ok = 0, lastErr = "";
    for (const id of ids) {
      try {
        await api(`/api/gallery/media?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        ok++;
        setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
      } catch (e) { lastErr = e.message; }
    }
    setSelected(new Set());
    await load();
    setBusy("");
    notify(
      ok === ids.length ? "تم الحذف" : `حُذف ${ok} من ${ids.length} — ${lastErr}`,
      ok === ids.length
    );
  };

  /* ───── تنزيل / نسخ رابط ───── */
  const download = (item) => {
    const a = document.createElement("a");
    a.href = item.type === "video" ? item.src : proxyImg(item.src);
    a.download = item.captionEn || item.captionAr || "media";
    a.target = "_blank";
    a.click();
  };
  const copyLink = (item) =>
    navigator.clipboard.writeText(item.src).then(() => notify("تم نسخ الرابط"));

  const toggleSel = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = visible.length > 0 && visible.every((i) => selected.has(i.id));

  /* ══════════ واجهة ══════════ */
  return (
    <div style={{ direction: "rtl" }}>
      {banner && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          background: banner.ok ? "#10b981" : R, color: "#fff",
          padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14,
          zIndex: 99999, boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}>
          {banner.ok ? "✅" : "❌"} {banner.msg}
        </div>
      )}

      {/* رأس */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: B }}>🎞️ معرض الوسائط ({items.length})</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>صور وفيديوهات السلايدر في الصفحة الرئيسية</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={btn(G, B, { display: "inline-block" })}>
            📤 رفع متعدد
            <input type="file" accept="image/*,video/*,.mov,.mp4,.webm,.m4v" multiple hidden
              onChange={(e) => { bulkUpload(Array.from(e.target.files)); e.target.value = ""; }} />
          </label>
          <button style={btn(B)} onClick={() => setEditItem({ ...EMPTY, category: filterCat || 1 })}>➕ إضافة عنصر</button>
        </div>
      </div>

      {busy && <div style={{ background: `${G}20`, color: B, padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{busy}</div>}

      {/* فلتر التصنيف + تحديد */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        {[{ id: 0, ar: "الكل" }, ...CATEGORIES].map((c) => (
          <button key={c.id} onClick={() => setFilterCat(c.id)}
            style={btn(filterCat === c.id ? B : "#fff", filterCat === c.id ? "#fff" : "#64748b", { border: `1px solid ${B}20`, borderRadius: 30, padding: "5px 14px", fontSize: 12 })}>
            {c.ar}
          </button>
        ))}
        <div style={{ marginRight: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#64748b", cursor: "pointer" }}>
            <input type="checkbox" checked={allSelected}
              onChange={() => setSelected(allSelected ? new Set() : new Set(visible.map((i) => i.id)))} /> تحديد الكل
          </label>
          {selected.size > 0 && (
            <button style={btn(R, "#fff", { padding: "5px 14px", fontSize: 12 })} onClick={() => remove([...selected])}>
              🗑️ حذف المحدد ({selected.size})
            </button>
          )}
        </div>
      </div>

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
                  <button style={btn(R, "#fff", { position: "absolute", top: 8, left: 8, padding: "4px 10px", fontSize: 11 })}
                    onClick={() => setEditItem((e) => ({ ...e, src: "" }))}>✕ تغيير</button>
                </div>
              ) : (
                <>
                  <DropZone accept="image/*,video/*,.mov,.mp4,.webm,.m4v" onFiles={onPickMain} label="اسحب فيديو المؤتمر (21MB) أو اضغط للرفع" />
                  <input style={{ ...inputStyle, direction: "ltr", marginTop: 10 }} placeholder="أو الصق رابط مباشر (https://...mp4)"
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v) setEditItem((p) => ({ ...p, src: v, type: /\.(mp4|webm|mov)(\?|$)/i.test(v) ? "video" : p.type }));
                    }} />
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
                ) : <DropZone accept="image/*" onFiles={onPickThumb} label="ارفع صورة غلاف" />}
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
              <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6 }}>القسم (يظهر في فلتر الصفحة الرئيسية)</label>
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
              <label style={{ fontSize: 12, fontWeight: 700, color: B, display: "block", marginBottom: 6 }}>الوسم (الشارة الذهبية)</label>
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
              <input type="checkbox" checked={editItem.published !== false}
                onChange={(e) => setEditItem((p) => ({ ...p, published: e.target.checked }))} /> منشور (يظهر في الموقع)
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
            return (
              <div key={item.id} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: selected.has(item.id) ? `2px solid ${G}` : "1px solid #e8edf2", opacity: item.published === false ? 0.6 : 1, position: "relative" }}>
                <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSel(item.id)}
                  style={{ position: "absolute", top: 10, left: 10, zIndex: 3, width: 18, height: 18 }} />
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
                  <button title="للأمام" style={btn("#F1F5F9", B, { padding: "5px 9px" })} disabled={pos === 0} onClick={() => move(item, -1)}>▲</button>
                  <button title="للخلف" style={btn("#F1F5F9", B, { padding: "5px 9px" })} disabled={pos === sorted.length - 1} onClick={() => move(item, +1)}>▼</button>
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