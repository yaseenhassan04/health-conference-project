// المسار: app/dashboard/workshops/page.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

// ── ورش نوفمبر (ما قبل المؤتمر) ──
const NOV_WORKSHOPS = {
  bronchoscopy: { label: "🫁 تنظير القصبات", date: "8 نوفمبر", capacity: 10, lead: "د. عبدالرحمن حسين" },
  pocus:        { label: "📡 POCUS",          date: "9 نوفمبر", capacity: 10, lead: "د. عبدالرحمن حسين" },
};

// ── ورش ديسمبر (المؤتمر الرئيسي) ──
const DEC_WORKSHOPS = {
  w1: { name: "Safe ED Skills",                       lead: "Dr. Fahad Alhadad",       time: "08:00–10:00", day: "Day 1", capacity: 20 },
  w2: { name: "Challenge Cases in DM",                lead: "Dr. Ahmed Abu Taha",       time: "10:00–12:00", day: "Day 1", capacity: 20 },
  w3: { name: "Electrolytes Is Not Just a Number",    lead: "Dr. Abedesalam Alashgar",  time: "12:00–14:00", day: "Day 1", capacity: 20 },
  w4: { name: "Gastroenterology Knowledge & Skills",  lead: "Dr. Mahmoud Sheikh Ali",   time: "08:00–10:00", day: "Day 2", capacity: 20 },
  w5: { name: "POCUS",                                lead: "Dr. Mohammed Qandil",      time: "10:00–13:00", day: "Day 2", capacity: 20 },
};

const B = "#1B365D", G = "#C9A227", R = "#C8102E";
const GOLD = "#8B6F14";

export default function UnifiedWorkshopsDashboard() {
  const [tab, setTab]           = useState("nov");   // "nov" | "dec"
  const [token, setToken]       = useState("");
  const [authed, setAuthed]     = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ── بيانات نوفمبر ──
  const [novItems, setNovItems] = useState([]);
  const [novStats, setNovStats] = useState({});
  const [novQ, setNovQ]         = useState("");
  const [novTab, setNovTab]     = useState("bronchoscopy");

  // ── بيانات ديسمبر ──
  const [decData, setDecData]   = useState({ total: 0, workshopCounts: {}, specialtyCounts: {}, recent: [] });
  const [decQ, setDecQ]         = useState("");
  const [decFilter, setDecFilter] = useState("all");

  const [loading, setLoading]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── تحميل بيانات نوفمبر ──
  const loadNov = useCallback(async (tk) => {
    try {
      const res  = await fetch("/api/registration/workshops", { headers: { "x-admin-token": tk } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNovItems(data.items || []);
      setNovStats(data.stats || {});
    } catch (e) {
      showToast("فشل تحميل بيانات نوفمبر", false);
    }
  }, []);

  // ── تحميل بيانات ديسمبر ──
  const loadDec = useCallback(async (tk) => {
  try {
    const res  = await fetch("/api/registration/workshops-old", {
      headers: { "x-admin-token": tk || token }
    });
      const data = await res.json();
      if (data) setDecData(data);
    } catch (e) {
      showToast("فشل تحميل بيانات ديسمبر", false);
    }
  }, []);

  const loadAll = useCallback(async (tk) => {
  setLoading(true);
  await Promise.all([loadNov(tk), loadDec(tk)]);
    setLastUpdated(new Date());
    setLoading(false);
  }, [loadNov, loadDec]);

  // ── تسجيل دخول ──
  const handleLogin = useCallback(async (tk) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res  = await fetch("/api/registration/workshops", { headers: { "x-admin-token": tk } });
      const data = await res.json();
      if (!res.ok) throw new Error(res.status === 401 ? "رمز الدخول غير صحيح" : data.error);
      setNovItems(data.items || []);
      setNovStats(data.stats || {});
      setAuthed(true);
      sessionStorage.setItem("admin-token", tk);
      await loadDec(tk);
      setLastUpdated(new Date());
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  }, [loadDec]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-token");
    if (saved) { setToken(saved); handleLogin(saved); }
  }, [handleLogin]);

  // ── حذف سجل نوفمبر ──
  const removeNov = async (id) => {
    if (!confirm("متأكد من حذف هذا التسجيل؟")) return;
    const res = await fetch(`/api/registration/workshops?id=${id}`, {
      method: "DELETE", headers: { "x-admin-token": token },
    });
    if (res.ok) { loadNov(token); showToast("تم الحذف"); }
    else showToast("فشل الحذف", false);
  };

  // ── إيميلات في الورشتين ──
  const novBoth = useMemo(() => {
    const c = {};
    novItems.forEach(i => { c[i.email] = (c[i.email] || 0) + 1; });
    return new Set(Object.keys(c).filter(e => c[e] > 1));
  }, [novItems]);

  // ── فلترة نوفمبر ──
  const novRows = useMemo(() => {
    const s = novQ.trim().toLowerCase();
    return novItems.filter(i =>
      i.workshop === novTab &&
      (!s || [i.fullNameAr, i.fullNameEn, i.email, i.whatsapp, i.workplace, i.specialty]
        .some(v => v?.toLowerCase().includes(s)))
    );
  }, [novItems, novTab, novQ]);

  // ── فلترة ديسمبر ──
  const decRows = useMemo(() => {
    const s = decQ.trim().toLowerCase();
    return (decData.recent || []).filter(r => {
      const matchSearch = !s ||
        r.fullNameAr?.includes(decQ) ||
        r.fullNameEn?.toLowerCase().includes(s) ||
        r.email?.toLowerCase().includes(s) ||
        r.specialty?.includes(decQ) ||
        r.workplace?.includes(decQ);
      const matchWs = decFilter === "all" || r.workshops?.includes(decFilter);
      return matchSearch && matchWs;
    });
  }, [decData.recent, decQ, decFilter]);

  // ── export CSV ──
  const exportNovCsv = () => {
    const ws = NOV_WORKSHOPS[novTab];
    const head = ["#","الاسم بالعربي","الاسم بالإنجليزي","البريد","واتساب","التخصص","جهة العمل","تاريخ التسجيل"];
    const esc  = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [head, ...novRows.map((r, i) => [
      i+1, r.fullNameAr, r.fullNameEn, r.email,
      r.whatsapp, r.specialty, r.workplace,
      new Date(r.createdAt).toLocaleString("en-GB"),
    ])].map(r => r.map(esc).join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+lines], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `workshop-${novTab}.csv`; a.click();
  };

  const exportDecCsv = () => {
    const head = ["#","الاسم","الإيميل","واتساب","التخصص","جهة العمل","الورشات","التاريخ"];
    const esc  = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [head, ...decRows.map((r, i) => [
      i+1, r.fullNameAr, r.email, r.whatsapp || r.phone,
      r.specialty, r.workplace,
      Array.isArray(r.workshops) ? r.workshops.join("+") : r.workshops,
      new Date(r.createdAt).toLocaleString("en-GB"),
    ])].map(r => r.map(esc).join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+lines], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `dec-workshops-${decFilter}.csv`; a.click();
  };

  // ── شاشة الدخول ──
  if (!authed) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F0F4F9", fontFamily:"'Cairo',sans-serif", direction:"rtl", padding:20 }}>
      <div style={{ background:"#fff", padding:32, borderRadius:18, width:"100%", maxWidth:360, boxShadow:"0 10px 40px rgba(27,54,93,.12)" }}>
        <div style={{ fontSize:20, fontWeight:900, color:B, marginBottom:16, textAlign:"center" }}>🔐 لوحة إدارة الورش</div>
        <input type="password" value={token}
          onChange={e => setToken(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin(token)}
          placeholder="رمز الأدمن"
          style={{ width:"100%", padding:12, border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, marginBottom:12, fontFamily:"inherit" }}
        />
        {authError && <div style={{ color:R, fontSize:13, marginBottom:10 }}>❌ {authError}</div>}
        <button onClick={() => handleLogin(token)} disabled={authLoading || !token}
          style={{ width:"100%", padding:12, background:B, color:"#fff", border:"none", borderRadius:10, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
          {authLoading ? "..." : "دخول"}
        </button>
      </div>
    </div>
  );

  const novCurSt = novStats[novTab] || { total:0, capacity:NOV_WORKSHOPS[novTab].capacity, remaining:NOV_WORKSHOPS[novTab].capacity, isFull:false };

  return (
    <div style={{ minHeight:"100vh", background:"#F0F4F9", fontFamily:"'Cairo',sans-serif", direction:"rtl" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .hrow:hover td { background:#f8fafc; }
        input:focus,select:focus { outline:none; border-color:${G}!important; }
        .wsc:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(139,111,20,.12)!important; }
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:19, fontWeight:900, color:B }}>📋 لوحة إدارة الورش</div>
            {lastUpdated && <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
              آخر تحديث: {lastUpdated.toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"})}
            </div>}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {loading && <div style={{ width:18, height:18, border:"2px solid #e2e8f0", borderTopColor:G, borderRadius:"50%", animation:"spin .7s linear infinite" }} />}
            <button onClick={() => loadAll(token)} style={hBtn("#fff",B,`1px solid ${B}20`)}>↺ تحديث</button>
            <button onClick={tab==="nov" ? exportNovCsv : exportDecCsv} style={hBtn(G,"#fff")}>📥 CSV</button>
          </div>
        </div>

        {/* تبويب رئيسي */}
        <div style={{ display:"flex", padding:"0 24px", gap:4, borderTop:"1px solid #f1f5f9" }}>
          {[
            { key:"nov", label:"🗓 ورش نوفمبر (ما قبل المؤتمر)" },
            { key:"dec", label:"🏛 ورش ديسمبر (المؤتمر الرئيسي)" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding:"10px 18px", border:"none", cursor:"pointer", fontSize:13,
              fontWeight:900, fontFamily:"'Cairo',sans-serif",
              borderBottom: tab===t.key ? `3px solid ${G}` : "3px solid transparent",
              color: tab===t.key ? G : "#64748b",
              background:"transparent", transition:"all .2s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1300, margin:"0 auto", padding:"24px 20px 48px" }}>

        {/* ════════════════════════════════
            تبويب نوفمبر
        ════════════════════════════════ */}
        {tab === "nov" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* بطاقات إحصائيات نوفمبر */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
              {Object.entries(NOV_WORKSHOPS).map(([k, w]) => {
                const s = novStats[k] || { total:0, capacity:w.capacity, remaining:w.capacity, isFull:false };
                const pct = s.capacity ? Math.min(100,(s.total/s.capacity)*100) : 0;
                return (
                  <div key={k} onClick={() => setNovTab(k)} style={{
                    background:"#fff", borderRadius:16, padding:18, cursor:"pointer",
                    border:`2px solid ${novTab===k ? G : G+"30"}`,
                    boxShadow: novTab===k ? `0 6px 20px ${G}30` : "0 2px 8px rgba(0,0,0,.04)",
                    transition:"all .2s",
                  }} className="wsc">
                    <div style={{ fontSize:13, fontWeight:800, color:B, marginBottom:6 }}>{w.label}</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginBottom:8 }}>{w.date} · {w.lead}</div>
                    <div style={{ fontSize:28, fontWeight:900, color:s.isFull?R:B, lineHeight:1 }}>
                      {s.total}<span style={{ fontSize:13, color:"#94a3b8" }}> / {s.capacity}</span>
                    </div>
                    <div style={{ height:6, background:"#e2e8f0", borderRadius:4, margin:"10px 0 6px", overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`, height:"100%", background:s.isFull?R:G, transition:"width .5s" }} />
                    </div>
                    <div style={{ fontSize:12, color:s.isFull?R:"#64748b", fontWeight:700 }}>
                      {s.isFull ? "✅ مكتملة" : `${s.remaining} مقعد متبقي`}
                    </div>
                  </div>
                );
              })}
              <div style={{ background:"#fff", borderRadius:16, padding:18, border:`1px solid ${G}30`, boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
                <div style={{ fontSize:13, fontWeight:800, color:B, marginBottom:6 }}>⭐ في الورشتين</div>
                <div style={{ fontSize:28, fontWeight:900, color:B }}>{novBoth.size}</div>
                <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>مسجل في كلتا الورشتين</div>
              </div>
            </div>

            {/* تبويبات الورشة + بحث */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              {Object.entries(NOV_WORKSHOPS).map(([k,w]) => (
                <button key={k} onClick={() => setNovTab(k)}
                  style={hBtn(novTab===k?B:"#fff", novTab===k?"#fff":"#64748b", `1px solid ${B}20`)}>
                  {w.label} ({novStats[k]?.total ?? 0})
                </button>
              ))}
              <input value={novQ} onChange={e => setNovQ(e.target.value)}
                placeholder="🔎 بحث بالاسم / الإيميل..."
                style={{ flex:1, minWidth:200, padding:"9px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, fontFamily:"inherit" }} />
            </div>

            {/* Progress Bar */}
            <div style={{ background:"#fff", borderRadius:16, padding:"16px 20px", border:`1px solid ${G}30` }}>
              <div style={{ marginBottom:10, fontSize:14, fontWeight:900, color:B }}>
                {NOV_WORKSHOPS[novTab].label} · {NOV_WORKSHOPS[novTab].date}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12 }}>
                <span style={{ fontWeight:700, color:B }}>نسبة الامتلاء</span>
                <span style={{ fontWeight:800, color:novCurSt.isFull?R:G }}>
                  {novCurSt.capacity ? Math.round((novCurSt.total/novCurSt.capacity)*100) : 0}%
                </span>
              </div>
              <div style={{ height:8, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:99, transition:"width .5s",
                  width:`${novCurSt.capacity ? Math.min(100,(novCurSt.total/novCurSt.capacity)*100) : 0}%`,
                  background: novCurSt.isFull ? R : G,
                }} />
              </div>
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>{novCurSt.total} من {novCurSt.capacity} مشارك</div>
            </div>

            {/* جدول نوفمبر */}
            <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", border:`1px solid ${G}25`, boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9", background:"#FAFBFD" }}>
                <div style={{ fontSize:14, fontWeight:900, color:B }}>
                  قائمة المسجلين في {NOV_WORKSHOPS[novTab].label} ({novRows.length})
                </div>
              </div>
              {novRows.length === 0 ? (
                <div style={{ padding:50, textAlign:"center" }}>
                  <div style={{ fontSize:44, marginBottom:10 }}>{NOV_WORKSHOPS[novTab].label.split(" ")[0]}</div>
                  <div style={{ fontWeight:700, color:"#64748b" }}>{novQ ? "لا توجد نتائج" : "لا يوجد مسجلون بعد"}</div>
                </div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:800 }}>
                    <thead>
                      <tr style={{ background:"#F8FAFC" }}>
                        {["#","المشارك","البريد","واتساب","التخصص","جهة العمل","التاريخ",""].map((h,i) => (
                          <th key={i} style={{ padding:"12px 14px", textAlign:"right", fontWeight:700, color:"#64748b", fontSize:11 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {novRows.map((r,i) => (
                        <tr key={r.id} className="hrow" style={{ borderTop:"1px solid #f8fafc" }}>
                          <td style={td}>{i+1}</td>
                          <td style={td}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:34, height:34, borderRadius:"50%", background:`hsl(${(r.id*47)%360},60%,50%)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:800, flexShrink:0 }}>
                                {r.fullNameAr?.[0]||"؟"}
                              </div>
                              <div>
                                <div style={{ fontWeight:800, color:B }}>
                                  {r.fullNameAr}
                                  {novBoth.has(r.email) && <span title="في الورشتين" style={{ marginInlineStart:6, fontSize:12 }}>⭐</span>}
                                </div>
                                {r.fullNameEn && <div style={{ fontSize:11, color:"#94a3b8", direction:"ltr" }}>{r.fullNameEn}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ ...td, direction:"ltr", fontSize:12, color:"#475569" }}>{r.email}</td>
                          <td style={{ ...td, direction:"ltr" }}>
                            <a href={`https://wa.me/${r.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                              style={{ color:"#059669", fontWeight:700, fontSize:12, textDecoration:"none" }}>
                              {r.whatsapp}
                            </a>
                          </td>
                          <td style={td}>
                            <span style={{ fontSize:11, fontWeight:600, color:"#854d0e", background:"#fefce8", border:"1px solid #fde68a", padding:"2px 8px", borderRadius:20 }}>
                              {r.specialty}
                            </span>
                          </td>
                          <td style={{ ...td, fontSize:12, color:"#475569", maxWidth:140 }}>
                            <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.workplace}</div>
                          </td>
                          <td style={{ ...td, fontSize:11, color:"#94a3b8", whiteSpace:"nowrap" }}>
                            {new Date(r.createdAt).toLocaleDateString("ar-EG",{month:"short",day:"numeric",year:"numeric"})}
                          </td>
                          <td style={td}>
                            <button onClick={() => removeNov(r.id)} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${R}`, background:"#fff", color:R, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'Cairo',sans-serif" }}>
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={{ fontSize:12, color:"#94a3b8" }}>⭐ = مسجل في الورشتين</div>
          </div>
        )}

        {/* ════════════════════════════════
            تبويب ديسمبر
        ════════════════════════════════ */}
        {tab === "dec" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* بطاقات Hero ديسمبر */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              {[
                { label:"إجمالي المسجلين", value:decData.total||0, icon:"👥", color:GOLD },
                { label:"سجّلوا ورشتين",   value:decData.twoWorkshops||0, icon:"⭐", color:"#059669" },
                { label:"ورشة واحدة",       value:decData.oneWorkshop||0,  icon:"📌", color:"#2563eb" },
                { label:"أماكن شاغرة",
                  value: Object.values(decData.workshopCounts||{}).reduce((s,w)=>s+(w.available||Math.max(0,(w.capacity||20)-(w.count||0))),0),
                  icon:"🎯", color:"#7c3aed" },
              ].map((s,i) => (
                <div key={i} style={{ background:"#fff", borderRadius:16, padding:"18px 16px", border:`1px solid ${s.color}20`, boxShadow:"0 2px 8px rgba(0,0,0,.04)", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* بطاقات الورش ديسمبر */}
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden" }}>
              <div style={{ padding:"18px 24px", borderBottom:"1px solid #f8fafc", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:15, fontWeight:900, color:B }}>🏛️ سعة ورش ديسمبر</div>
                <div style={{ display:"flex", gap:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"#2563eb", background:"#eff6ff", border:"1px solid #bfdbfe", padding:"4px 10px", borderRadius:20 }}>Day 1 · 3 ورشات</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"#7c3aed", background:"#fdf4ff", border:"1px solid #e9d5ff", padding:"4px 10px", borderRadius:20 }}>Day 2 · 2 ورشات</span>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:16, padding:20 }}>
                {Object.entries(DEC_WORKSHOPS).map(([id, w]) => {
                  const ws   = decData.workshopCounts?.[id] || {};
                  const count    = ws.count || 0;
                  const capacity = ws.capacity || w.capacity;
                  const avail    = ws.available ?? Math.max(0, capacity - count);
                  const pct      = Math.round((count/capacity)*100);
                  const isFull   = count >= capacity;
                  const isAlmost = pct >= 70 && !isFull;
                  const color    = isFull ? "#ef4444" : isAlmost ? "#f59e0b" : "#10b981";
                  const isDay1   = w.day === "Day 1";
                  return (
                    <div key={id} style={{ border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 16px", background:"#fafafa" }} className="wsc">
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:6, background:isDay1?"#eff6ff":"#fdf4ff", color:isDay1?"#2563eb":"#7c3aed" }}>{w.day}</span>
                          <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:6, background:"#fefce8", color:"#854d0e" }}>{id.toUpperCase()}</span>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:isFull?"#fef2f2":isAlmost?"#fffbeb":"#f0fdf4", color, border:`1px solid ${color}30` }}>
                          {isFull?"امتلأت":isAlmost?"تقترب":"متاح"}
                        </span>
                      </div>
                      <div style={{ fontSize:14, fontWeight:800, color:"#1e293b", marginBottom:4, lineHeight:1.3 }}>{w.name}</div>
                      <div style={{ fontSize:11, color:"#64748b", marginBottom:2 }}>👨‍⚕️ {w.lead}</div>
                      <div style={{ fontSize:11, color:"#64748b", marginBottom:14 }}>🕐 {w.time}</div>
                      <div style={{ height:8, background:"#f1f5f9", borderRadius:99, overflow:"hidden", marginBottom:6 }}>
                        <div style={{ height:"100%", borderRadius:99, width:`${pct}%`, background:isFull?"linear-gradient(90deg,#ef4444,#dc2626)":isAlmost?"linear-gradient(90deg,#f59e0b,#d97706)":`linear-gradient(90deg,${GOLD},${G})`, transition:"width .6s" }} />
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12 }}>
                        <span style={{ fontWeight:800, color:"#1e293b", fontSize:15 }}>{count}</span>
                        <span style={{ color:"#94a3b8" }}>/{capacity} مسجل</span>
                        <span style={{ marginRight:"auto", color, fontWeight:700 }}>{avail} متبقي</span>
                        <span style={{ color:"#94a3b8" }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* جدول ديسمبر */}
            <div style={{ background:"#fff", borderRadius:16, border:`1px solid ${G}25`, overflow:"hidden" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9", background:"#FAFBFD", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                <div style={{ fontSize:14, fontWeight:900, color:B }}>📋 قائمة المسجلين ({decRows.length})</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <input value={decQ} onChange={e => setDecQ(e.target.value)}
                    placeholder="🔎 بحث..."
                    style={{ padding:"8px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, fontFamily:"inherit", minWidth:160 }} />
                  <select value={decFilter} onChange={e => setDecFilter(e.target.value)}
                    style={{ padding:"8px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:12, fontFamily:"inherit", cursor:"pointer" }}>
                    <option value="all">كل الورشات</option>
                    {Object.entries(DEC_WORKSHOPS).map(([id,w]) => (
                      <option key={id} value={id}>{id.toUpperCase()} · {w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {decRows.length === 0 ? (
                <div style={{ padding:50, textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
                  <div style={{ fontWeight:700, color:"#64748b" }}>{decQ ? "لا توجد نتائج" : "لا يوجد مسجلون بعد"}</div>
                </div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:820 }}>
                    <thead>
                      <tr style={{ background:"#F8FAFC" }}>
                        {["#","المشارك","التخصص","جهة العمل","واتساب","الورشات","التاريخ"].map((h,i) => (
                          <th key={i} style={{ padding:"12px 14px", textAlign:"right", fontWeight:700, color:"#64748b", fontSize:11 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {decRows.map((r,i) => (
                        <tr key={r.id||i} className="hrow" style={{ borderTop:"1px solid #f8fafc" }}>
                        <td style={{ ...td, color:"#94a3b8", fontWeight:600 }}>{i+1}</td>                          <td style={td}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:32, height:32, borderRadius:"50%", background:`hsl(${((r.id||i)*47)%360},60%,50%)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:800, flexShrink:0 }}>
                                {r.fullNameAr?.[0]||"؟"}
                              </div>
                              <div>
                                <div style={{ fontWeight:800, color:B, fontSize:13 }}>{r.fullNameAr||"غير محدد"}</div>
                                {r.fullNameEn && <div style={{ fontSize:11, color:"#94a3b8", direction:"ltr" }}>{r.fullNameEn}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={td}><span style={{ fontSize:11, fontWeight:600, color:GOLD, background:"#fefce8", border:"1px solid #fde68a", padding:"2px 8px", borderRadius:20 }}>{r.specialty||"عام"}</span></td>
                          <td style={{ ...td, fontSize:12, color:"#475569", maxWidth:130 }}>
                            <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.workplace||"—"}</div>
                          </td>
                          <td style={{ ...td, direction:"ltr", fontSize:12, color:"#059669", fontWeight:600 }}>{r.whatsapp||r.phone||"—"}</td>
                          <td style={td}>
                            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                              {Array.isArray(r.workshops) ? r.workshops.map(wid => {
                                const isD1 = DEC_WORKSHOPS[wid]?.day === "Day 1";
                                return (
                                  <span key={wid} style={{ fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:6, background:isD1?"#eff6ff":"#fdf4ff", color:isD1?"#2563eb":"#7c3aed", border:`1px solid ${isD1?"#bfdbfe":"#e9d5ff"}` }}>
                                    {String(wid).toUpperCase()}
                                  </span>
                                );
                              }) : null}
                            </div>
                          </td>
                          <td style={{ ...td, fontSize:11, color:"#94a3b8", whiteSpace:"nowrap" }}>
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-EG",{month:"short",day:"numeric"}) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:toast.ok?"#10b981":R, color:"#fff", padding:"12px 24px", borderRadius:12, fontSize:14, fontWeight:700, zIndex:9999, fontFamily:"'Cairo',sans-serif", whiteSpace:"nowrap" }}>
          {toast.ok?"✅":"❌"} {toast.msg}
        </div>
      )}
    </div>
  );
}

const td   = { padding:"12px 14px", verticalAlign:"middle" };
const hBtn = (bg, color, border="none") => ({
  background:bg, color, border, borderRadius:10,
  padding:"8px 16px", fontWeight:800, fontSize:13,
  cursor:"pointer", fontFamily:"'Cairo',sans-serif",
});