"use client";
/**
 * dashboard/layout.jsx
 * حماية كل صفحات /dashboard/* + Top Navbar
 * يقرأ JWT من localStorage (المفتاح: "auth_token")
 * payload متوقع: { id, name, role, avatar? }
 */

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";

/* ─── Auth Context ─── */
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

/* ─── JWT decoder (بدون مكتبة خارجية) ─── */
function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
}

/* ─── Role Config ─── */
export const ROLE_CONFIG = {
  admin: {
    label: "مسؤول النظام",
    color: "#C8102E",
    bg: "rgba(200,16,46,0.1)",
    icon: "⚙️",
    pages: ["library", "submission", "gallery", "news", "users"],
  },
  doctor: {
    label: "دكتور",
    color: "#1B365D",
    bg: "rgba(27,54,93,0.1)",
    icon: "🩺",
    pages: ["library", "submission"],
  },
  media: {
    label: "مسؤول الإعلام",
    color: "#D4AF37",
    bg: "rgba(212,175,55,0.1)",
    icon: "📸",
    pages: ["gallery", "news"],
  },
};

export const PAGE_META = {
  library:    { label: "المكتبة الرقمية",   icon: "📚", path: "/dashboard/library" },
  submission: { label: "الأبحاث المقدمة",   icon: "📋", path: "/dashboard/submission" },
  gallery:    { label: "ألبوم الصور",        icon: "🖼️", path: "/dashboard/gallery" },
  news:       { label: "الأخبار",            icon: "📰", path: "/dashboard/news" },
  users:      { label: "إدارة المستخدمين",  icon: "👥", path: "/dashboard/users" },
};

/* ─── Navbar ─── */
function Navbar({ user, onLogout }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.doctor;
  const allowedPages = role.pages || [];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#1B365D",
      boxShadow: "0 2px 20px rgba(0,0,0,0.18)",
      fontFamily: "'Cairo', sans-serif",
      direction: "rtl",
    }}>
      {/* الشريط العلوي */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px", height: 62,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* اللوجو */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#D4AF37,#C8102E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900,
          }}>م</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
              لوحة التحكم
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
              المؤتمر العلمي — مستشفى ناصر
            </div>
          </div>
        </div>

        {/* معلومات المستخدم */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Role Badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: role.bg,
            border: `1px solid ${role.color}40`,
            padding: "5px 12px", borderRadius: 20,
          }}>
            <span style={{ fontSize: 14 }}>{role.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: role.color }}>
              {role.label}
            </span>
          </div>

          {/* اسم المستخدم */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.07)",
            padding: "6px 14px", borderRadius: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg,#D4AF37,#C8102E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 900, color: "#fff",
              flexShrink: 0,
            }}>
              {user?.name?.[0] || "؟"}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {user?.name || "مستخدم"}
            </span>
          </div>

          {/* زر تسجيل الخروج */}
          <button
            onClick={onLogout}
            style={{
              padding: "7px 14px", borderRadius: 8,
              background: "rgba(200,16,46,0.15)",
              border: "1px solid rgba(200,16,46,0.4)",
              color: "#ff6b7a", fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Cairo',sans-serif",
              transition: "all .2s",
              display: "flex", alignItems: "center", gap: 5,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(200,16,46,0.3)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(200,16,46,0.15)"}
          >
            🚪 خروج
          </button>
        </div>
      </div>

      {/* شريط التنقل السفلي */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: 4, padding: "0 28px", height: 46,
        overflowX: "auto",
      }}>
        {/* رابط الرئيسية دائماً */}
        <NavLink
          href="/dashboard"
          label="الرئيسية"
          icon="🏠"
          active={pathname === "/dashboard"}
          onClick={() => router.push("/dashboard")}
        />
        {allowedPages.map(key => {
          const meta = PAGE_META[key];
          if (!meta) return null;
          return (
            <NavLink
              key={key}
              href={meta.path}
              label={meta.label}
              icon={meta.icon}
              active={pathname.startsWith(meta.path)}
              onClick={() => router.push(meta.path)}
            />
          );
        })}
      </div>
    </nav>
  );
}

function NavLink({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 14px", borderRadius: 8,
        background: active ? "rgba(212,175,55,0.2)" : "transparent",
        border: active ? "1px solid rgba(212,175,55,0.4)" : "1px solid transparent",
        color: active ? "#D4AF37" : "rgba(255,255,255,0.55)",
        fontSize: 12, fontWeight: active ? 700 : 500,
        cursor: "pointer", fontFamily: "'Cairo',sans-serif",
        whiteSpace: "nowrap", transition: "all .15s",
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </button>
  );
}

/* ─── Loading Screen ─── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#F4F7F9", fontFamily: "'Cairo',sans-serif",
      direction: "rtl",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(135deg,#1B365D,#C8102E)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, margin: "0 auto 16px",
          animation: "pulse 1.2s ease-in-out infinite",
        }}>م</div>
        <div style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>
          جاري التحقق من الصلاحيات...
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  );
}

/* ─── Layout الرئيسي ─── */
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const payload = decodeJWT(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      localStorage.removeItem("auth_token");
      router.replace("/login");
      return;
    }
    setUser(payload);
    setChecking(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.replace("/login");
  };

  if (checking) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, role: user?.role }}>
      <div style={{ minHeight: "100vh", background: "#F0F4F8", fontFamily: "'Cairo',sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #f1f5f9; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}</style>
        <Navbar user={user} onLogout={handleLogout} />
        <main>{children}</main>
      </div>
    </AuthContext.Provider>
  );
}