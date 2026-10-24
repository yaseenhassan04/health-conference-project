"use client";

import { useState, useEffect } from "react";

const WORKSHOP_NAMES = {
  w1: "Safe ED Skills",
  w2: "Challenge Cases in DM",
  w3: "Electrolytes Is Not Just a Number",
  w4: "Gastroenterology Knowledge & Skills",
  w5: "POCUS",
};

const WORKSHOP_LEADS = {
  w1: "Dr. Fahad Alhadad",
  w2: "Dr. Ahmed Abu Taha",
  w3: "Dr. Abedesalam Alashgar",
  w4: "Dr. Mahmoud Sheikh Ali",
  w5: "Dr. Mohammed Qandil",
};

const WORKSHOP_TIMES = {
  w1: "08:00 – 10:00",
  w2: "10:00 – 12:00",
  w3: "12:00 – 14:00",
  w4: "08:00 – 10:00",
  w5: "10:00 – 13:00",
};

const WORKSHOP_DAYS = {
  w1: "Day 1", w2: "Day 1", w3: "Day 1",
  w4: "Day 2", w5: "Day 2",
};

export default function WorkshopsDashboard() {
  const [data, setData] = useState({
    total: 0,
    oneWorkshop: 0,
    twoWorkshops: 0,
    workshopCounts: {
      w1: { name: WORKSHOP_NAMES.w1, count: 0, capacity: 20, available: 20 },
      w2: { name: WORKSHOP_NAMES.w2, count: 0, capacity: 20, available: 20 },
      w3: { name: WORKSHOP_NAMES.w3, count: 0, capacity: 20, available: 20 },
      w4: { name: WORKSHOP_NAMES.w4, count: 0, capacity: 20, available: 20 },
      w5: { name: WORKSHOP_NAMES.w5, count: 0, capacity: 20, available: 20 },
    },
    specialtyCounts: {},
    recent: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterWorkshop, setFilterWorkshop] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // 🔥 تصحيح المسار إلى /api/registration/workshops
      const res = await fetch("/api/registration/workshops");
      if (!res.ok) throw new Error("فشل تحميل البيانات من السيرفر");
      const json = await res.json();
      
      if (json) {
        setData({
          total: json.total || 0,
          oneWorkshop: json.oneWorkshop || 0,
          twoWorkshops: json.twoWorkshops || 0,
          workshopCounts: json.workshopCounts || data.workshopCounts,
          specialtyCounts: json.specialtyCounts || {},
          recent: json.recent || json.items || []
        });
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredRecent = (data?.recent || []).filter((r) => {
    const matchSearch =
      !search ||
      (r.fullNameAr && r.fullNameAr.includes(search)) ||
      (r.fullNameEn && r.fullNameEn.toLowerCase().includes(search.toLowerCase())) ||
      (r.email && r.email.toLowerCase().includes(search.toLowerCase())) ||
      (r.specialty && r.specialty.toLowerCase().includes(search.toLowerCase())) ||
      (r.workplace && r.workplace.includes(search));
    const matchWorkshop =
      filterWorkshop === "all" || (r.workshops && r.workshops.includes(filterWorkshop));
    return matchSearch && matchWorkshop;
  });

  if (loading) return (
    <div style={s.loadingPage}>
      <div style={s.loadingCard}>
        <div style={s.loadingSpinWrap}>
          <div style={s.loadingRing} />
          <span style={s.loadingIcon}>📝</span>
        </div>
        <div style={s.loadingTitle}>جاري تحميل البيانات</div>
        <div style={s.loadingSubtitle}>ورشات العمل — المؤتمر الثاني عشر</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={s.loadingPage}>
      <div style={{ ...s.loadingCard, maxWidth: 360 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{error}</div>
        <button onClick={fetchData} style={s.primaryBtn}>↺ إعادة المحاولة</button>
      </div>
    </div>
  );

  const totalCapacity = 100;
  const fillPct = Math.round(((data?.total || 0) / totalCapacity) * 100);

  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .ws-row:hover { background: #f8fafc !important; }
        .ws-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,111,20,0.12) !important; }
        .action-btn:hover { opacity: 0.85; transform: scale(0.98); }
        input:focus, select:focus { border-color: #8B6F14 !important; box-shadow: 0 0 0 3px rgba(139,111,20,0.1) !important; outline: none; }
      `}</style>

      {/* ── TOP HEADER BAR ── */}
      <div style={s.topBar}>
        <div style={s.topBarInner}>
          <div style={s.topBarLeft}>
            <div style={s.breadcrumb}>
              <span style={s.breadHome}>Dashboard</span>
              <span style={s.breadSep}>/</span>
              <span style={s.breadCurrent}>ورشات العمل</span>
            </div>
            <h1 style={s.pageTitle}>إحصائيات التسجيل في الورشات</h1>
            {lastUpdated && (
              <div style={s.lastUpdated}>
                آخر تحديث: {lastUpdated.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </div>
          <div style={s.topBarRight}>
            <div style={s.eventBadge}>
              <span style={s.eventBadgeDot} />
              <span>5–6 Dec 2026 · Miran Hotel</span>
            </div>
            <button onClick={fetchData} style={s.refreshBtn} className="action-btn">
              <span style={{ fontSize: 16 }}>↺</span>
              تحديث
            </button>
          </div>
        </div>
      </div>

      <div style={s.content}>

        {/* ── HERO STATS ── */}
        <div style={s.heroGrid}>
          <HeroCard
            value={data.total}
            label="إجمالي المسجلين"
            sub={`${fillPct}% من الطاقة الاستيعابية`}
            icon="👥"
            color="#8B6F14"
            gradient="linear-gradient(135deg, #8B6F14, #C9A227)"
            progress={fillPct}
          />
          <HeroCard
            value={data.twoWorkshops}
            label="سجّلوا ورشتين"
            sub={`${Math.round((data.twoWorkshops / (data.total || 1)) * 100)}% من المسجلين`}
            icon="⭐"
            color="#059669"
            gradient="linear-gradient(135deg, #059669, #10b981)"
            progress={Math.round((data.twoWorkshops / (data.total || 1)) * 100)}
          />
          <HeroCard
            value={data.oneWorkshop}
            label="سجّلوا ورشة واحدة"
            sub={`${Math.round((data.oneWorkshop / (data.total || 1)) * 100)}% من المسجلين`}
            icon="📌"
            color="#2563eb"
            gradient="linear-gradient(135deg, #2563eb, #3b82f6)"
            progress={Math.round((data.oneWorkshop / (data.total || 1)) * 100)}
          />
          <HeroCard
            value={Object.values(data.workshopCounts || {}).reduce((s, w) => s + (w.available || 0), 0)}
            label="أماكن شاغرة"
            sub={`من أصل ${totalCapacity} مقعد إجمالاً`}
            icon="🎯"
            color="#7c3aed"
            gradient="linear-gradient(135deg, #7c3aed, #8b5cf6)"
            progress={Math.max(0, 100 - fillPct)}
          />
        </div>

        {/* ── WORKSHOP CAPACITY ── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardTitleWrap}>
              <div style={s.cardIcon}>🏛️</div>
              <div>
                <div style={s.cardTitle}>سعة الورشات</div>
                <div style={s.cardSub}>الأماكن المتبقية لكل ورشة</div>
              </div>
            </div>
            <div style={s.dayTabs}>
              <span style={s.dayTab1}>Day 1 · 3 ورشات</span>
              <span style={s.dayTab2}>Day 2 · 2 ورشات</span>
            </div>
          </div>

          <div style={s.workshopGrid}>
            {Object.entries(data.workshopCounts || {}).map(([id, w]) => {
              const count = w.count || 0;
              const capacity = w.capacity || 20;
              const pct = Math.round((count / capacity) * 100);
              const isFull = count >= capacity;
              const isAlmost = pct >= 70 && !isFull;
              const statusColor = isFull ? "#ef4444" : isAlmost ? "#f59e0b" : "#10b981";
              const statusLabel = isFull ? "امتلأت" : isAlmost ? "تقترب" : "متاح";
              const statusBg = isFull ? "#fef2f2" : isAlmost ? "#fffbeb" : "#f0fdf4";

              return (
                <div key={id} style={s.wsCapCard} className="ws-card">
                  <div style={s.wsCapTop}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ ...s.wsIdBadge, background: WORKSHOP_DAYS[id] === "Day 1" ? "#eff6ff" : "#fdf4ff", color: WORKSHOP_DAYS[id] === "Day 1" ? "#2563eb" : "#7c3aed" }}>
                        {WORKSHOP_DAYS[id]}
                      </div>
                      <div style={{ ...s.wsIdBadge, background: "#fefce8", color: "#854d0e" }}>
                        {id.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ background: statusBg, color: statusColor, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: `1px solid ${statusColor}30` }}>
                      {statusLabel}
                    </div>
                  </div>

                  <div style={s.wsCapName}>{w.name || WORKSHOP_NAMES[id]}</div>
                  <div style={s.wsCapLead}>
                    <span style={{ marginLeft: 4 }}>👨‍⚕️</span>
                    {WORKSHOP_LEADS[id]}
                  </div>
                  <div style={s.wsCapTime}>
                    <span style={{ marginLeft: 4 }}>🕐</span>
                    {WORKSHOP_TIMES[id]}
                  </div>

                  <div style={s.wsProgressSection}>
                    <div style={s.wsProgressBar}>
                      <div style={{
                        ...s.wsProgressFill,
                        width: `${pct}%`,
                        background: isFull
                          ? "linear-gradient(90deg, #ef4444, #dc2626)"
                          : isAlmost
                          ? "linear-gradient(90deg, #f59e0b, #d97706)"
                          : "linear-gradient(90deg, #8B6F14, #C9A227)",
                      }} />
                    </div>
                    <div style={s.wsProgressMeta}>
                      <span style={{ fontWeight: 800, color: "#1e293b", fontSize: 15 }}>{count}</span>
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>/{capacity} مسجل</span>
                      <span style={{ marginRight: "auto", fontSize: 12, color: statusColor, fontWeight: 700 }}>
                        {w.available ?? (capacity - count)} متبقي
                      </span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM GRID ── */}
        <div style={s.bottomGrid}>

          {/* Specialty Distribution */}
          <div style={{ ...s.card, flex: "0 0 300px" }}>
            <div style={s.cardHeader}>
              <div style={s.cardTitleWrap}>
                <div style={s.cardIcon}>🔬</div>
                <div>
                  <div style={s.cardTitle}>التخصصات</div>
                  <div style={s.cardSub}>توزيع المسجلين</div>
                </div>
              </div>
            </div>

            {Object.keys(data.specialtyCounts || {}).length === 0 ? (
              <div style={s.emptyState}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ color: "#94a3b8", fontSize: 13 }}>لا توجد بيانات بعد</div>
              </div>
            ) : (
              <div style={s.specialtyList}>
                {Object.entries(data.specialtyCounts || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([spec, count], i) => {
                    const pct = Math.round((count / (data.total || 1)) * 100);
                    const colors = ["#8B6F14","#2563eb","#059669","#7c3aed","#ef4444","#f59e0b","#0891b2","#db2777"];
                    const c = colors[i % colors.length];
                    return (
                      <div key={spec} style={s.specRow}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{spec}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: c }}>{count}</span>
                        </div>
                        <div style={s.specBar}>
                          <div style={{ ...s.specFill, width: `${pct}%`, background: c }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, textAlign: "left" }}>{pct}%</div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Registrations Table */}
          <div style={{ ...s.card, flex: 1, minWidth: 0 }}>
            <div style={s.cardHeader}>
              <div style={s.cardTitleWrap}>
                <div style={s.cardIcon}>📋</div>
                <div>
                  <div style={s.cardTitle}>قائمة المسجلين</div>
                  <div style={s.cardSub}>{filteredRecent?.length || 0} نتيجة</div>
                </div>
              </div>
              <div style={s.tableControls}>
                <div style={s.searchWrap}>
                  <span style={s.searchIcon}>🔍</span>
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={s.searchInput}
                    dir="rtl"
                  />
                </div>
                <select
                  value={filterWorkshop}
                  onChange={(e) => setFilterWorkshop(e.target.value)}
                  style={s.filterSelect}
                >
                  <option value="all">كل الورشات</option>
                  {Object.entries(WORKSHOP_NAMES).map(([id, name]) => (
                    <option key={id} value={id}>{id.toUpperCase()} · {name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={s.tableWrap}>
              {filteredRecent?.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                  <div style={{ color: "#374151", fontWeight: 600, marginBottom: 4 }}>لا توجد نتائج</div>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>جرّب تغيير كلمة البحث أو الفلتر</div>
                </div>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr style={s.thead}>
                      <th style={s.th}>#</th>
                      <th style={s.th}>المشارك</th>
                      <th style={s.th}>التخصص</th>
                      <th style={s.th}>جهة العمل</th>
                      <th style={s.th}>واتساب</th>
                      <th style={s.th}>الورشات</th>
                      <th style={s.th}>التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecent?.map((r, i) => (
                      <tr key={r.id || i} style={s.trow} className="ws-row">
                        <td style={{ ...s.td, color: "#94a3b8", fontWeight: 600, fontSize: 12 }}>{r.id || (i + 1)}</td>
                        <td style={s.td}>
                          <div style={s.participantCell}>
                            <div style={{ ...s.avatar, background: `hsl(${((r.id || i) * 47) % 360}, 60%, 50%)` }}>
                              {r.fullNameAr ? r.fullNameAr[0] : "👤"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{r.fullNameAr || "غير محدد"}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", direction: "ltr" }}>{r.fullNameEn || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={s.specTag}>{r.specialty || "عام"}</span>
                        </td>
                        <td style={{ ...s.td, fontSize: 12, color: "#475569", maxWidth: 140 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.workplace || "—"}
                          </div>
                        </td>
                        <td style={{ ...s.td, direction: "ltr", fontSize: 12, color: "#059669", fontWeight: 600 }}>
                          {r.whatsapp || r.phone || "—"}
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {Array.isArray(r.workshops) ? r.workshops.map((wid) => (
                              <span key={wid} style={{
                                ...s.wTag,
                                background: WORKSHOP_DAYS[wid] === "Day 1" ? "#eff6ff" : "#fdf4ff",
                                color: WORKSHOP_DAYS[wid] === "Day 1" ? "#2563eb" : "#7c3aed",
                                border: `1px solid ${WORKSHOP_DAYS[wid] === "Day 1" ? "#bfdbfe" : "#e9d5ff"}`,
                              }}>
                                {String(wid).toUpperCase()}
                              </span>
                            )) : null}
                          </div>
                        </td>
                        <td style={{ ...s.td, fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-EG", { month: "short", day: "numeric" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── HeroCard ── */
function HeroCard({ value, label, sub, icon, color, gradient, progress }) {
  return (
    <div style={s.heroCard} className="ws-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ ...s.heroIconWrap, background: gradient }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
        </div>
        <div style={{ ...s.heroPct, color }}>{progress}%</div>
      </div>
      <div style={{ ...s.heroValue, color }}>{value}</div>
      <div style={s.heroLabel}>{label}</div>
      <div style={s.heroSub}>{sub}</div>
      <div style={s.heroBarBg}>
        <div style={{ ...s.heroBarFill, width: `${Math.min(progress, 100)}%`, background: gradient }} />
      </div>
    </div>
  );
}

/* ── Styles ── */
const s = {
  page: {
    background: "#f1f5f9",
    minHeight: "100vh",
    fontFamily: "'Cairo', 'Segoe UI', Arial, sans-serif",
    direction: "rtl",
  },
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
  },
  loadingCard: {
    background: "#fff",
    borderRadius: 24,
    padding: "48px 40px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
    maxWidth: 320,
  },
  loadingSpinWrap: {
    position: "relative",
    width: 80,
    height: 80,
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingRing: {
    position: "absolute",
    inset: 0,
    border: "3px solid #e2e8f0",
    borderTopColor: "#8B6F14",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingIcon: { fontSize: 32, position: "relative", zIndex: 1 },
  loadingTitle: { fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 6 },
  loadingSubtitle: { fontSize: 13, color: "#94a3b8" },

  topBar: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 50,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  topBarInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 28px",
    maxWidth: "100%",
    margin: "0 auto",
    gap: 16,
    flexWrap: "wrap",
  },
  topBarLeft: { flex: 1 },
  topBarRight: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  breadHome: { fontSize: 12, color: "#94a3b8", cursor: "pointer" },
  breadSep: { fontSize: 12, color: "#cbd5e1" },
  breadCurrent: { fontSize: 12, color: "#8B6F14", fontWeight: 600 },
  pageTitle: { fontSize: 22, fontWeight: 900, color: "#1e293b", margin: 0, lineHeight: 1.2 },
  lastUpdated: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  eventBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 12,
    color: "#059669",
    fontWeight: 600,
  },
  eventBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#10b981",
    animation: "pulse 1.5s ease-in-out infinite",
    display: "inline-block",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "linear-gradient(135deg, #8B6F14, #C9A227)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  primaryBtn: {
    padding: "10px 24px",
    background: "linear-gradient(135deg, #8B6F14, #C9A227)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 16,
  },
  content: {
    maxWidth: "100%",
    padding: "28px 24px 48px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  heroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
  heroCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "22px 20px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "all 0.2s ease",
    cursor: "default",
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  heroPct: { fontSize: 13, fontWeight: 700, opacity: 0.7 },
  heroValue: { fontSize: 42, fontWeight: 900, lineHeight: 1, marginBottom: 4 },
  heroLabel: { fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 2 },
  heroSub: { fontSize: 12, color: "#94a3b8", marginBottom: 14 },
  heroBarBg: { height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" },
  heroBarFill: { height: "100%", borderRadius: 99, transition: "width 0.5s ease" },

  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #f1f5f9",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid #f8fafc",
    gap: 12,
    flexWrap: "wrap",
  },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 12 },
  cardIcon: {
    width: 40,
    height: 40,
    background: "#fefce8",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  cardTitle: { fontSize: 16, fontWeight: 800, color: "#1e293b" },
  cardSub: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  dayTabs: { display: "flex", gap: 8 },
  dayTab1: {
    fontSize: 11, fontWeight: 700, color: "#2563eb",
    background: "#eff6ff", border: "1px solid #bfdbfe",
    padding: "4px 10px", borderRadius: 20,
  },
  dayTab2: {
    fontSize: 11, fontWeight: 700, color: "#7c3aed",
    background: "#fdf4ff", border: "1px solid #e9d5ff",
    padding: "4px 10px", borderRadius: 20,
  },

  workshopGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
    padding: 24,
  },
  wsCapCard: {
    border: "1px solid #f1f5f9",
    borderRadius: 14,
    padding: "18px 16px",
    background: "#fafafa",
    transition: "all 0.2s ease",
    cursor: "default",
  },
  wsCapTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  wsIdBadge: {
    fontSize: 10, fontWeight: 700,
    padding: "3px 8px", borderRadius: 6,
    display: "inline-block",
  },
  wsCapName: { fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 6, lineHeight: 1.4 },
  wsCapLead: { fontSize: 11, color: "#64748b", marginBottom: 3, display: "flex", alignItems: "center" },
  wsCapTime: { fontSize: 11, color: "#64748b", marginBottom: 14, display: "flex", alignItems: "center" },
  wsProgressSection: {},
  wsProgressBar: { height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 6 },
  wsProgressFill: { height: "100%", borderRadius: 99, transition: "width 0.6s ease" },
  wsProgressMeta: { display: "flex", alignItems: "center", gap: 4, fontSize: 12 },

  bottomGrid: { display: "flex", gap: 20, alignItems: "flex-start" },

  specialtyList: { padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 14 },
  specRow: {},
  specBar: { height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" },
  specFill: { height: "100%", borderRadius: 99, transition: "width 0.5s ease" },

  tableControls: { display: "flex", gap: 10, flexWrap: "wrap" },
  searchWrap: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", right: 10, fontSize: 14, pointerEvents: "none", zIndex: 1 },
  searchInput: {
    padding: "8px 32px 8px 12px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 13,
    fontFamily: "inherit",
    background: "#f8fafc",
    color: "#1e293b",
    minWidth: 180,
    transition: "all 0.15s",
  },
  filterSelect: {
    padding: "8px 12px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 12,
    fontFamily: "inherit",
    background: "#f8fafc",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  thead: { background: "#f8fafc", borderBottom: "2px solid #f1f5f9" },
  th: {
    padding: "12px 16px",
    textAlign: "right",
    fontWeight: 700,
    color: "#64748b",
    fontSize: 11,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  trow: {
    borderBottom: "1px solid #f8fafc",
    transition: "background 0.1s",
  },
  td: { padding: "12px 16px", verticalAlign: "middle", textAlign: "right" },
  participantCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 14,
    fontWeight: 800,
    flexShrink: 0,
  },
  specTag: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 600,
    color: "#8B6F14",
    background: "#fefce8",
    border: "1px solid #fde68a",
    padding: "2px 8px",
    borderRadius: 20,
  },
  wTag: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 7px",
    borderRadius: 6,
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
  },
};