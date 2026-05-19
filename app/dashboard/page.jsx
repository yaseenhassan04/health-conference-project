"use client";
/**
 * ى/page.jsx
 * الصفحة الرئيسية — تعرض Cards بناءً على role اليوزر
 */

import { useRouter } from "next/navigation";
import { useAuth, ROLE_CONFIG, PAGE_META } from "./layout";
import { useState } from "react";  // ← أضف هذا السطر

const B = "#1B365D", R = "#C8102E", G = "#D4AF37";

/* ─── Card وصول سريع ─── */
function AccessCard({ pageKey, onClick }) {
  const meta = PAGE_META[pageKey];
  if (!meta) return null;

  const cardColors = {
    library:    { from: "#1B365D", to: "#2a4a7f", accent: "#D4AF37" },
    submission: { from: "#065F46", to: "#047857", accent: "#6ee7b7" },
    gallery:    { from: "#7C3AED", to: "#6D28D9", accent: "#c4b5fd" },
    news:       { from: "#C8102E", to: "#9f0d23", accent: "#fca5a5" },
    users:      { from: "#0369a1", to: "#0284c7", accent: "#7dd3fc" },
  };
  const c = cardColors[pageKey] || cardColors.library;

  return (
    <button
      onClick={onClick}
      className="access-card"
      style={{
        background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
        border: "none",
        borderRadius: 20,
        padding: "24px 20px",
        cursor: "pointer",
        textAlign: "right",
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: `0 4px 14px rgba(0,0,0,0.15)`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 140,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
        e.currentTarget.style.boxShadow = `0 20px 30px -12px ${c.from}80`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = `0 4px 14px rgba(0,0,0,0.15)`;
      }}
    >
      {/* خلفية زخرفية */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: -20,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />

      <div style={{ fontSize: 40, lineHeight: 1, position: "relative", zIndex: 1 }}>
        {meta.icon}
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 6,
            letterSpacing: "-0.3px",
          }}
        >
          {meta.label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: c.accent,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
          }}
        >
          <span>فتح القسم</span>
          <span style={{ fontSize: 14, transition: "transform 0.2s" }}>←</span>
        </div>
      </div>

      {/* شريط سفلي */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${c.accent}, transparent)`,
          borderRadius: "0 0 20px 20px",
        }}
      />
    </button>
  );
}

/* ─── بطاقة إحصائية ─── */
function StatCard({ label, value, icon, color }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: "20px 18px",
        border: `1px solid ${isHovered ? G : "#e8edf2"}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: isHovered
          ? `0 8px 25px -8px ${color}40`
          : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.25s ease",
        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: `${color}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
          transition: "all 0.25s",
          transform: isHovered ? "scale(1.08) rotate(-5deg)" : "scale(1)",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: color,
            lineHeight: 1.1,
            letterSpacing: "-1px",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─── الصفحة الرئيسية ─── */
export default function DashboardHome() {
  const router = useRouter();
  const { user, role } = useAuth() || {};
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.doctor;
  const allowedPages = roleConfig.pages || [];

  /* إحصائيات وهمية — اربطها لاحقاً بـ API */
  const statsMap = {
    admin: [
      { label: "إجمالي المستخدمين", value: "24", icon: "👥", color: B },
      { label: "أبحاث مقدمة", value: "87", icon: "📋", color: "#065F46" },
      { label: "كتب في المكتبة", value: "143", icon: "📚", color: G },
      { label: "صور في الألبوم", value: "312", icon: "🖼️", color: "#7C3AED" },
    ],
    doctor: [
      { label: "كتب في المكتبة", value: "143", icon: "📚", color: B },
      { label: "أبحاث مقدمة", value: "87", icon: "📋", color: "#065F46" },
      { label: "بانتظار المراجعة", value: "12", icon: "⏳", color: R },
      { label: "تمت الموافقة", value: "61", icon: "✅", color: "#10b981" },
    ],
    media: [
      { label: "صور في الألبوم", value: "312", icon: "🖼️", color: "#7C3AED" },
      { label: "الأخبار المنشورة", value: "28", icon: "📰", color: R },
      { label: "مسودات", value: "5", icon: "✏️", color: "#94a3b8" },
      { label: "آخر تحديث", value: "اليوم", icon: "🕐", color: G },
    ],
  };
  const stats = statsMap[role] || statsMap.doctor;

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return "🌅 صباح الخير";
    if (h < 17) return "☀️ مساء الخير";
    return "🌙 مساء النور";
  };

  // أيقونات عشوائية لتزيين الخلفية
  const bgIcons = ["🏥", "⚕️", "📚", "🔬", "💊", "🩺", "📊", "🎓"];

  return (
    <div
      style={{
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
        padding: "28px 32px",
        maxWidth: 1200,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#F5F7FB",
      }}
    >
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .access-card:hover div span:last-child {
          transform: translateX(4px);
        }
      `}</style>

      {/* Greeting Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${B} 0%, #2a4a7f 50%, #1a3a6a 100%)`,
          borderRadius: 24,
          padding: "32px 36px",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 15px 35px -10px rgba(27,54,93,0.3)",
        }}
      >
        {/* أيقونات عائمة في الخلفية */}
        {bgIcons.map((icon, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 40 + 20}px`,
              opacity: 0.04,
              pointerEvents: "none",
              animation: `float ${Math.random() * 5 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            {icon}
          </div>
        ))}

        {/* شريط علوي متحرك */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${R}, ${G}, ${R})`,
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s linear infinite",
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              padding: "6px 16px",
              borderRadius: 40,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 14 }}>{roleConfig.icon}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: G,
                letterSpacing: 0.5,
              }}
            >
              {roleConfig.label}
            </span>
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#fff",
              marginBottom: 8,
              letterSpacing: "-0.5px",
            }}
          >
            {greetingTime()}، {user?.name || "مرحباً"} 👋
          </div>

          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span>📅 {new Date().toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: G }} />
            <span>🕐 {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        {/* صورة شخصية صغيرة في الزاوية (اختياري) */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(212,175,55,0.2)",
            border: `2px solid ${G}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
        >
          {user?.name?.[0] || "👤"}
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
          marginBottom: 36,
        }}
      >
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Quick Access Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: B,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: `${G}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ⚡
          </span>
          الوصول السريع
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
          {allowedPages.length} {allowedPages.length === 1 ? "وحدة" : "وحدات"} متاحة
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 18,
        }}
      >
        {allowedPages.map((key) => (
          <AccessCard key={key} pageKey={key} onClick={() => router.push(PAGE_META[key]?.path)} />
        ))}
      </div>

      {/* لا توجد صلاحيات */}
      {allowedPages.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            borderRadius: 20,
            border: "1px dashed #e2e8f0",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: B, marginBottom: 6 }}>
            لا توجد صلاحيات وصول
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            يرجى التواصل مع المدير لتفعيل الصلاحيات
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: 48,
          textAlign: "center",
          fontSize: 12,
          color: "#94a3b8",
          borderTop: "1px solid #e2e8f0",
          paddingTop: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span>© 2026 المؤتمر العلمي الثاني عشر لأمراض الباطنة — مستشفى ناصر</span>
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#cbd5e1" }} />
        <span style={{ direction: "ltr" }}>v2.0.0</span>
      </footer>
    </div>
  );
}