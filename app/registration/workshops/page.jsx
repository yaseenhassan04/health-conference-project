
"use client";

import { useState, useEffect } from "react";

const WORKSHOP_NAMES = {
  w1: "Safe ED Skills",
  w2: "Challenge Cases in DM",
  w3: "Electrolytes Is Not Just a Number",
  w4: "Gastroenterology Knowledge & Skills",
  w5: "POCUS",
};

const GOLD = "#8B6F14";
const GOLD_LIGHT = "#C9A227";
const DARK_BROWN = "#5B4A2A";
const BEIGE = "#E8E4D9";
const CHARCOAL = "#1A1A1A";
const OFF_WHITE = "#FAFAF8";

export default function WorkshopsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterWorkshop, setFilterWorkshop] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/registration/workshops");
      if (!res.ok) throw new Error("فشل تحميل البيانات");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecent = data?.recent?.filter((r) => {
    const matchSearch =
      !search ||
      r.fullNameAr.includes(search) ||
      r.fullNameEn.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.specialty.toLowerCase().includes(search.toLowerCase());

    const matchWorkshop =
      filterWorkshop === "all" || r.workshops.includes(filterWorkshop);

    return matchSearch && matchWorkshop;
  });

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: DARK_BROWN, marginTop: "16px" }}>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingWrap}>
        <p style={{ color: "#C0392B", fontSize: "16px" }}>⚠️ {error}</p>
        <button onClick={fetchData} style={styles.retryBtn}>إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerSub}>Dashboard · ورشات العمل</div>
          <h1 style={styles.headerTitle}>إحصائيات التسجيل</h1>
        </div>
        <button onClick={fetchData} style={styles.refreshBtn}>
          ↻ تحديث
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <StatCard
          label="إجمالي المسجلين"
          value={data.total}
          sub="من أصل 75 مقعد"
          color={GOLD}
        />
        <StatCard
          label="سجّلوا ورشتين"
          value={data.twoWorkshops}
          sub={`${Math.round((data.twoWorkshops / (data.total || 1)) * 100)}% من المسجلين`}
          color="#2E7D32"
        />
        <StatCard
          label="سجّلوا ورشة واحدة"
          value={data.oneWorkshop}
          sub={`${Math.round((data.oneWorkshop / (data.total || 1)) * 100)}% من المسجلين`}
          color="#1565C0"
        />
        <StatCard
          label="الأماكن المتبقية"
          value={Object.values(data.workshopCounts).reduce((s, w) => s + w.available, 0)}
          sub="مجموع الأماكن الشاغرة"
          color="#6A1B9A"
        />
      </div>

      {/* Workshop Capacity */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>سعة الورشات</h2>
        <div style={styles.workshopGrid}>
          {Object.entries(data.workshopCounts).map(([id, w]) => {
            const pct = Math.round((w.count / w.capacity) * 100);
            const isFull = w.count >= w.capacity;
            const isAlmost = pct >= 70 && !isFull;
            return (
              <div key={id} style={styles.workshopCapCard}>
                <div style={styles.workshopCapHeader}>
                  <span style={styles.workshopCapId}>{id.toUpperCase()}</span>
                  <span style={{
                    ...styles.workshopCapBadge,
                    backgroundColor: isFull ? "#C0392B" : isAlmost ? "#E67E22" : "#2E7D32",
                  }}>
                    {isFull ? "امتلأت" : isAlmost ? "تقترب" : "متاح"}
                  </span>
                </div>
                <div style={styles.workshopCapName}>{w.name}</div>
                <div style={styles.progressWrap}>
                  <div style={styles.progressBar}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${pct}%`,
                      backgroundColor: isFull ? "#C0392B" : isAlmost ? "#E67E22" : GOLD,
                    }} />
                  </div>
                  <div style={styles.progressLabel}>
                    <span style={{ fontWeight: 700, color: CHARCOAL }}>{w.count}</span>
                    <span style={{ color: "#999" }}>/{w.capacity}</span>
                    <span style={{ color: "#aaa", fontSize: "11px", marginRight: "auto" }}>
                      {w.available} متبقي
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specialty Distribution */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>توزيع التخصصات</h2>
        <div style={styles.specialtyList}>
          {Object.entries(data.specialtyCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([spec, count]) => {
              const pct = Math.round((count / data.total) * 100);
              return (
                <div key={spec} style={styles.specialtyRow}>
                  <span style={styles.specialtyName}>{spec}</span>
                  <div style={styles.specialtyBarWrap}>
                    <div style={{ ...styles.specialtyBarFill, width: `${pct}%` }} />
                  </div>
                  <span style={styles.specialtyCount}>{count}</span>
                  <span style={styles.specialtyPct}>{pct}%</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Registrations Table */}
      <div style={styles.section}>
        <div style={styles.tableHeader}>
          <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
            المسجلون ({filteredRecent?.length || 0})
          </h2>
          <div style={styles.tableControls}>
            <input
              type="text"
              placeholder="بحث بالاسم أو الإيميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              dir="rtl"
            />
            <select
              value={filterWorkshop}
              onChange={(e) => setFilterWorkshop(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">كل الورشات</option>
              {Object.entries(WORKSHOP_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>الاسم</th>
                <th style={styles.th}>التخصص</th>
                <th style={styles.th}>واتساب</th>
                <th style={styles.th}>الورشات</th>
                <th style={styles.th}>تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecent?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                filteredRecent?.map((r, i) => (
                  <tr key={r.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{r.id}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: CHARCOAL }}>{r.fullNameAr}</div>
                      <div style={{ fontSize: "11px", color: "#888" }}>{r.fullNameEn}</div>
                    </td>
                    <td style={styles.td}>{r.specialty}</td>
                    <td style={{ ...styles.td, direction: "ltr" }}>{r.whatsapp}</td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {r.workshops.map((wid) => (
                          <span key={wid} style={styles.workshopTag}>
                            {wid.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontSize: "11px", color: "#888" }}>
                      {new Date(r.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

/* ── StatCard ── */
function StatCard({ label, value, sub, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  );
}

/* ── Styles ── */
const styles = {
  page: {
    padding: "24px",
    fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
    color: CHARCOAL,
    direction: "rtl",
    maxWidth: "1200px",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: `3px solid ${BEIGE}`,
    borderTopColor: GOLD,
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  retryBtn: {
    marginTop: "16px",
    padding: "8px 24px",
    backgroundColor: GOLD,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "28px",
  },
  headerSub: {
    fontSize: "12px",
    color: GOLD,
    fontWeight: 600,
    marginBottom: "4px",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: CHARCOAL,
    margin: 0,
  },
  refreshBtn: {
    padding: "8px 18px",
    backgroundColor: "transparent",
    border: `1.5px solid ${BEIGE}`,
    borderRadius: "8px",
    color: DARK_BROWN,
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "#fff",
    border: `1px solid ${BEIGE}`,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(139,111,20,0.06)",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: "6px",
  },
  statLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: CHARCOAL,
    marginBottom: "4px",
  },
  statSub: {
    fontSize: "11px",
    color: "#aaa",
  },
  section: {
    backgroundColor: "#fff",
    border: `1px solid ${BEIGE}`,
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(139,111,20,0.06)",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: CHARCOAL,
    marginBottom: "18px",
    marginTop: 0,
  },
  workshopGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px",
  },
  workshopCapCard: {
    border: `1px solid ${BEIGE}`,
    borderRadius: "10px",
    padding: "14px",
    backgroundColor: OFF_WHITE,
  },
  workshopCapHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  workshopCapId: {
    fontSize: "11px",
    fontWeight: 700,
    color: GOLD,
    backgroundColor: "#FBF7EE",
    padding: "2px 8px",
    borderRadius: "4px",
    border: `1px solid #E8D9A0`,
  },
  workshopCapBadge: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  workshopCapName: {
    fontSize: "12px",
    fontWeight: 600,
    color: CHARCOAL,
    marginBottom: "10px",
    lineHeight: 1.4,
  },
  progressWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  progressBar: {
    height: "6px",
    backgroundColor: BEIGE,
    borderRadius: "99px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "99px",
    transition: "width 0.3s ease",
  },
  progressLabel: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    fontSize: "12px",
  },
  specialtyList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  specialtyRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  specialtyName: {
    fontSize: "13px",
    color: DARK_BROWN,
    width: "160px",
    flexShrink: 0,
    fontWeight: 500,
  },
  specialtyBarWrap: {
    flex: 1,
    height: "8px",
    backgroundColor: BEIGE,
    borderRadius: "99px",
    overflow: "hidden",
  },
  specialtyBarFill: {
    height: "100%",
    backgroundColor: GOLD,
    borderRadius: "99px",
    transition: "width 0.3s",
  },
  specialtyCount: {
    fontSize: "13px",
    fontWeight: 700,
    color: CHARCOAL,
    width: "28px",
    textAlign: "center",
  },
  specialtyPct: {
    fontSize: "11px",
    color: "#aaa",
    width: "36px",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  tableControls: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "8px 12px",
    border: `1.5px solid ${BEIGE}`,
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: OFF_WHITE,
    minWidth: "200px",
  },
  filterSelect: {
    padding: "8px 12px",
    border: `1.5px solid ${BEIGE}`,
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: OFF_WHITE,
    color: CHARCOAL,
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  tableHeadRow: {
    backgroundColor: "#FDFCF8",
    borderBottom: `2px solid ${BEIGE}`,
  },
  th: {
    padding: "10px 14px",
    textAlign: "right",
    fontWeight: 700,
    color: DARK_BROWN,
    fontSize: "12px",
    whiteSpace: "nowrap",
  },
  trEven: {
    backgroundColor: "#fff",
    borderBottom: `1px solid ${BEIGE}`,
  },
  trOdd: {
    backgroundColor: "#FDFCF8",
    borderBottom: `1px solid ${BEIGE}`,
  },
  td: {
    padding: "10px 14px",
    textAlign: "right",
    verticalAlign: "middle",
  },
  workshopTag: {
    fontSize: "10px",
    fontWeight: 700,
    color: GOLD,
    backgroundColor: "#FBF7EE",
    border: `1px solid #E8D9A0`,
    padding: "2px 6px",
    borderRadius: "4px",
  },
};