"use client";

import { useState, useEffect, useRef } from "react";
import MediaManager from "./MediaManager";
const B = "#1B365D", R = "#C8102E", G = "#D4AF37";
// استبدل السطر الخامس بهذا السطر وتأكد أن القيمة الاحتياطية تطابق السيرفر تماماً
const TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "samoud2025";
function proxyImg(url) {
  if (!url) return "";
  // لو الـ URL من Vercel Blob (private)، مرّره عبر الـ proxy
  if (url.includes("vercel-storage.com") || url.includes("blob.vercel")) {
    return `/api/gallery/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}
function Toast({ msg, ok }) {
  return (
    <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:ok?"#10b981":R, color:"#fff", padding:"12px 24px", borderRadius:12, fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(0,0,0,0.15)", zIndex:9999, fontFamily:"'Cairo',sans-serif", whiteSpace:"nowrap", animation:"fadeUp .25s ease" }}>
      {ok?"✅":"❌"} {msg}
    </div>
  );
}

function DropZone({ onFile, label="اسحب صورة أو اضغط للرفع" }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const handle = (file) => { if (!file) return; if (!file.type.startsWith("image/")) { alert("يرجى اختيار ملف صورة فقط"); return; } onFile(file); };
  return (
    <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0])}} onClick={()=>ref.current.click()}
      style={{ border:`2.5px dashed ${drag?G:"#cbd5e1"}`, borderRadius:14, padding:"28px 16px", textAlign:"center", cursor:"pointer", background:drag?`${G}0a`:"#F8FAFC", transition:"all .2s" }}>
      <input ref={ref} type="file" accept="image/*" hidden onChange={e=>handle(e.target.files[0])} />
      <div style={{ fontSize:36, marginBottom:8, opacity:0.4 }}>🖼️</div>
      <div style={{ fontSize:13, fontWeight:700, color:"#64748b" }}>{label}</div>
      <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>JPG, PNG, WEBP</div>
    </div>
  );
}



/* ══════════════════════════════
   تاب 2 — شاشات التفاعل
══════════════════════════════ */
function InteractiveScreensTab({ showToast }) {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const EMPTY = { type:"link", titleAr:"", titleEn:"", descAr:"", descEn:"", icon:"🖥️", href:"/media", mediaUrl:"", embedCode:"", published:true, order:0 };
  const ICON_OPTIONS = ["🖥️","📺","📡","🎞️","📸","🎬","🔴","🌐","📱","🔊","📅","👥","🏆","💬","🎤"];
  const inputStyle = { width:"100%", padding:"9px 12px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, fontFamily:"'Cairo',sans-serif", color:B, background:"#F8FAFC", outline:"none", direction:"rtl" };

  useEffect(()=>{ fetchItems(); },[]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/gallery/screens", { headers:{ "x-admin-token": TOKEN } });
      const data = await res.json();
      setItems(data.items || []);
    } catch { showToast("فشل التحميل", false); }
    finally  { setLoading(false); }
  };

  const uploadMedia = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/gallery/upload", {
        method: "POST",
        body: fd,
        headers: { "x-admin-token": TOKEN },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditItem(prev => ({ ...prev, mediaUrl: data.url }));
      showToast("تم رفع الملف");
    } catch (err) { showToast("فشل الرفع", false); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!editItem.titleAr.trim()) { alert("العنوان العربي مطلوب"); return; }
    const isEdit = !!editItem.id;
    try {
      const res  = await fetch("/api/gallery/screens", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type":"application/json", "x-admin-token": TOKEN },
        body: JSON.stringify(editItem),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(prev => isEdit ? prev.map(i=>i.id===editItem.id?data.item:i) : [...prev, data.item]);
      setShowForm(false); setEditItem(null);
      showToast(isEdit ? "تم التحديث" : "تمت الإضافة ✨");
    } catch (e) { showToast(e.message, false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف هذه الشاشة؟")) return;
    try {
      const res = await fetch(`/api/gallery/screens?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": TOKEN },
      });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(i=>i.id!==id));
      showToast("تم الحذف");
    } catch { showToast("فشل الحذف", false); }
  };

  const handleToggle = async (item) => {
    try {
      const res  = await fetch("/api/gallery/screens", {
        method: "PATCH",
        headers: { "Content-Type":"application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ id:item.id, published:!item.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setItems(prev => prev.map(i=>i.id===item.id?data.item:i));
      showToast(data.item.published ? "تم النشر" : "تم الإخفاء");
    } catch { showToast("فشلت العملية", false); }
  };

  const getPreview = (item) => {
    if (item.type==="image" && item.mediaUrl) return <img src={proxyImg(item.mediaUrl)} alt="" style={{ width:60, height:60, objectFit:"cover", borderRadius:8 }} />;
    if (item.type==="video") return <div style={{ fontSize:30 }}>🎥</div>;
    if (item.type==="link")  return <div style={{ fontSize:30 }}>{item.icon||"🔗"}</div>;
    return <div style={{ fontSize:30 }}>📝</div>;
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:900, color:B }}>🖥️ شاشات التفاعل</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>صور - فيديوهات - روابط - نصوص (تظهر في صفحة /media)</div>
        </div>
        <button onClick={()=>{setEditItem({...EMPTY});setShowForm(true)}}
          style={{ padding:"9px 18px", borderRadius:10, background:B, color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
          ➕ إضافة محتوى
        </button>
      </div>

      {showForm && editItem && (
        <div style={{ background:"#fff", borderRadius:16, border:`1.5px solid ${B}25`, padding:20, marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:900, color:B, marginBottom:16 }}>{editItem.id?"✏️ تعديل المحتوى":"➕ إضافة محتوى جديد"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontSize:12, fontWeight:700, color:B, display:"block", marginBottom:8 }}>نوع المحتوى *</label>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {[{value:"link",icon:"🔗",label:"رابط"},{value:"image",icon:"🖼️",label:"صورة"},{value:"video",icon:"🎥",label:"فيديو"},{value:"text",icon:"📝",label:"نص"}].map(type=>(
                  <button key={type.value} onClick={()=>setEditItem(prev=>({...prev,type:type.value}))}
                    style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer", fontWeight:700, fontFamily:"'Cairo',sans-serif", background:editItem.type===type.value?G:"#f1f5f9", color:editItem.type===type.value?B:"#64748b", border:editItem.type===type.value?`2px solid ${G}`:"1px solid transparent" }}>
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>

            {(editItem.type==="image"||editItem.type==="video") && (
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ fontSize:12, fontWeight:700, color:B, display:"block", marginBottom:5 }}>{editItem.type==="image"?"رفع صورة":"رفع فيديو أو رابط"}</label>
                {editItem.mediaUrl ? (
                  <div>
                    {editItem.type==="image" ? <img src={proxyImg(editItem.mediaUrl)} alt="" style={{ maxHeight:150, borderRadius:8 }} />: <div style={{ padding:10, background:"#f1f5f9", borderRadius:8 }}>🎥 {editItem.mediaUrl}</div>}
                    <button onClick={()=>setEditItem(prev=>({...prev,mediaUrl:""}))} style={{ marginTop:8, padding:"4px 12px", background:R, color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>تغيير</button>
                  </div>
                ) : <DropZone onFile={uploadMedia} label={editItem.type==="image"?"اسحب صورة أو اضغط للرفع":"اسحب ملف فيديو"} />}
                {editItem.type==="video" && (
                  <input type="text" placeholder="أو أدخل رابط فيديو (YouTube, Vimeo)"
                    style={{...inputStyle, marginTop:10, direction:"ltr"}}
                    value={editItem.mediaUrl||""}
                    onChange={e=>setEditItem(prev=>({...prev,mediaUrl:e.target.value}))} />
                )}
              </div>
            )}

            {editItem.type==="link" && (
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ fontSize:12, fontWeight:700, color:B, display:"block", marginBottom:5 }}>الرابط المستهدف</label>
                <input style={{...inputStyle, direction:"ltr"}} value={editItem.href||""} onChange={e=>setEditItem(prev=>({...prev,href:e.target.value}))} placeholder="/schedule أو https://example.com" />
                <label style={{ fontSize:12, fontWeight:700, color:B, display:"block", marginTop:10, marginBottom:5 }}>الأيقونة</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {ICON_OPTIONS.map(ico=>(
                    <button key={ico} onClick={()=>setEditItem(prev=>({...prev,icon:ico}))}
                      style={{ width:42, height:42, borderRadius:10, fontSize:20, cursor:"pointer", background:editItem.icon===ico?`${B}12`:"#F1F5F9", border:editItem.icon===ico?`2px solid ${B}`:"2px solid transparent" }}>
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize:12, fontWeight:700, color:B, display:"block", marginBottom:5 }}>العنوان (عربي) *</label>
              <input style={inputStyle} value={editItem.titleAr} onChange={e=>setEditItem(prev=>({...prev,titleAr:e.target.value}))} placeholder="مثال: البث المباشر" />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:B, display:"block", marginBottom:5 }}>Title (English)</label>
              <input style={{...inputStyle, direction:"ltr"}} value={editItem.titleEn} onChange={e=>setEditItem(prev=>({...prev,titleEn:e.target.value}))} placeholder="e.g. Live Stream" />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:B, display:"block", marginBottom:5 }}>الوصف (عربي)</label>
              <textarea style={{...inputStyle, minHeight:70, resize:"vertical"}} value={editItem.descAr} onChange={e=>setEditItem(prev=>({...prev,descAr:e.target.value}))} placeholder="وصف مختصر..." />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:B, display:"block", marginBottom:5 }}>Description (English)</label>
              <textarea style={{...inputStyle, direction:"ltr", minHeight:70, resize:"vertical"}} value={editItem.descEn} onChange={e=>setEditItem(prev=>({...prev,descEn:e.target.value}))} placeholder="Short description..." />
            </div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:16 }}>
            <button onClick={()=>{setShowForm(false);setEditItem(null)}}
              style={{ padding:"9px 18px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff", fontSize:13, cursor:"pointer", fontFamily:"'Cairo',sans-serif", color:"#64748b" }}>إلغاء</button>
            <button onClick={handleSave} disabled={uploading}
              style={{ padding:"9px 22px", borderRadius:10, background:uploading?"#94a3b8":B, color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:uploading?"not-allowed":"pointer", fontFamily:"'Cairo',sans-serif" }}>
              {editItem.id?"💾 حفظ":"➕ إضافة"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#94a3b8" }}>⏳ جاري التحميل...</div>
      ) : items.length===0 ? (
        <div style={{ textAlign:"center", padding:50, background:"#fff", borderRadius:14, border:"1.5px dashed #e2e8f0", color:"#94a3b8" }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🖥️</div>
          <div style={{ fontWeight:700 }}>لا توجد شاشات تفاعل بعد</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {items.map(item=>(
            <div key={item.id} style={{ background:"#fff", borderRadius:14, border:"1px solid #e8edf2", padding:"14px 18px", display:"flex", alignItems:"center", gap:14, opacity:item.published===false?0.6:1 }}>
              <div style={{ width:60, height:60, borderRadius:12, background:`${B}08`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{getPreview(item)}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:13, fontWeight:900, color:B }}>{item.titleAr}</span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:`${G}15`, color:G }}>
                    {item.type==="image"&&"🖼️ صورة"}{item.type==="video"&&"🎥 فيديو"}{item.type==="link"&&"🔗 رابط"}{item.type==="text"&&"📝 نص"}
                  </span>
                </div>
                {item.descAr && <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>{item.descAr}</div>}
                {item.type==="link" && item.href && <div style={{ fontSize:11, color:B, marginTop:2, direction:"ltr" }}>🔗 {item.href}</div>}
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <button onClick={()=>handleToggle(item)}
                  style={{ padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", background:item.published!==false?"rgba(16,185,129,0.1)":"rgba(148,163,184,0.1)", color:item.published!==false?"#10b981":"#94a3b8", fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif" }}>
                  {item.published!==false?"✅ منشور":"🔒 مخفي"}
                </button>
                <button onClick={()=>{setEditItem({...item});setShowForm(true)}}
                  style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${B}`, background:"#fff", color:B, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>✏️ تعديل</button>
                <button onClick={()=>handleDelete(item.id)}
                  style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${R}`, background:"#fff", color:R, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>🗑️ حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════
   المكوّن الرئيسي
══════════════════════════════ */
export default function GalleryManager() {
  const [activeTab, setActiveTab] = useState("media");
  const [toast, setToast]         = useState(null);
  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };
  const TABS = [
    { key:"media",   icon:"🎞️", label:"معرض الوسائط",   sub:"صور السلايدر الرئيسي" },
    { key:"screens", icon:"🖥️", label:"شاشات التفاعل", sub:"صور - فيديوهات - روابط" },
  ];

  return (
    <div style={{ direction:"rtl", fontFamily:"'Cairo',sans-serif", padding:"28px 32px", maxWidth:1200, margin:"0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateX(-50%) translateY(10px);}to{opacity:1;transform:translateX(-50%) translateY(0);} }
      `}</style>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:20, fontWeight:900, color:B }}>🖼️ إدارة الصور والشاشات</div>
        <div style={{ fontSize:12, color:"#94a3b8" }}>تحكم بمحتوى الصفحة الرئيسية وشاشات التفاعل</div>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:24, background:"#fff", padding:6, borderRadius:14, border:"1px solid #e8edf2" }}>
        {TABS.map(tab=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
            style={{ flex:1, padding:"12px 16px", borderRadius:10, border:"none", cursor:"pointer", background:activeTab===tab.key?`linear-gradient(135deg,${B},#2a4a7f)`:"transparent", color:activeTab===tab.key?"#fff":"#64748b", fontFamily:"'Cairo',sans-serif", textAlign:"center", boxShadow:activeTab===tab.key?`0 4px 14px ${B}30`:"none" }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{tab.icon}</div>
            <div style={{ fontSize:13, fontWeight:900 }}>{tab.label}</div>
            <div style={{ fontSize:10, color:activeTab===tab.key?"rgba(255,255,255,0.65)":"#94a3b8", marginTop:2 }}>{tab.sub}</div>
          </button>
        ))}
      </div>
      <div style={{ background:"#F8FAFC", borderRadius:16, border:"1px solid #e8edf2", padding:20 }}>
{activeTab==="media" ? <MediaManager showToast={showToast}/> : <InteractiveScreensTab showToast={showToast}/>}      </div>
      {toast && <Toast msg={toast.msg} ok={toast.ok}/>}
    </div>
  );
}