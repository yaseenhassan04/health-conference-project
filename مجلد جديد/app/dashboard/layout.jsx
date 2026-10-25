"use client";
/**
 * app/dashboard/layout.jsx
 * حماية كل صفحات /dashboard/* + Top Navbar
 * يدعم: admin (صلاحيات كاملة) + staff (صلاحيات مخصصة)
 */

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

/* ─── Page Meta ─── */
export const PAGE_META = {
  library:    { label: "المكتبة الرقمية",  icon: "📚", path: "/dashboard/library" },
  abstracts:  { label: "الأبحاث المقدمة", icon: "📋", path: "/dashboard/submission" },
  gallery:    { label: "ألبوم الصور",       icon: "🖼️", path: "/dashboard/gallery" },
  news:       { label: "الأخبار",           icon: "📰", path: "/dashboard/news" },
  live:       { label: "البث المباشر",     icon: "📡", path: "/dashboard/live" },
  users:      { label: "إدارة المستخدمين", icon: "👥", path: "/dashboard/users" },
  workshops:  { label: "ورشات العمل",       icon: "📝", path: "/dashboard/workshops" },
};

const ADMIN_PAGES = Object.keys(PAGE_META); // أدمن يرى كل شيء

/* ─── ROLE_CONFIG — يُصدَّر للاستخدام في page.jsx ─── */
export const ROLE_CONFIG = {
  admin: {
    label: "مسؤول النظام",
    icon: "⚙️",
    pages: ADMIN_PAGES,
  },
  doctor: {
    label: "طبيب / باحث",
    icon: "🩺",
    pages: ["library", "abstracts"],
  },
  media: {
    label: "مسؤول الإعلام",
    icon: "📸",
    pages: ["gallery", "news"],
  },
  staff: {
    label: "موظف",
    icon: "👤",
    // الصلاحيات تأتي من permissions في الـ JWT — تُحسب ديناميكياً
    pages: [],
  },
};

/* ─── Navbar ─── */
function Navbar({ user, onLogout }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isAdmin  = user?.role === "admin";

  // الصفحات المسموح بها حسب الدور
  const allowedPages = isAdmin
    ? ADMIN_PAGES
    : (user?.permissions || []).filter((p) => PAGE_META[p]);

  const roleLabel = isAdmin ? "مسؤول النظام" : "مستخدم";
  const roleColor = isAdmin ? "#C8102E" : "#D4AF37";
  const roleIcon  = isAdmin ? "⚙️" : "👤";

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#1B365D",
      boxShadow: "0 2px 20px rgba(0,0,0,0.18)",
      fontFamily: "'Cairo', sans-serif", direction: "rtl",
    }}>
      {/* Top Row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px", height: 62,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#D4AF37,#C8102E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
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

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Role badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `${roleColor}18`,
            border: `1px solid ${roleColor}40`,
            padding: "5px 12px", borderRadius: 20,
          }}>
            <span style={{ fontSize: 14 }}>{roleIcon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: roleColor }}>
              {roleLabel}
            </span>
          </div>

          {/* User */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.07)",
            padding: "6px 14px", borderRadius: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg,#D4AF37,#C8102E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0,
            }}>
              {user?.name?.[0] || "؟"}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {user?.name || "مستخدم"}
            </span>
          </div>

          {/* Logout */}
          <button onClick={onLogout} style={{
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

      {/* Nav Links Row */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: 4, padding: "0 28px", height: 46, overflowX: "auto",
      }}>
        <NavLink
          label="الرئيسية" icon="🏠"
          active={pathname === "/dashboard"}
          onClick={() => router.push("/dashboard")}
        />
        {allowedPages.map((key) => {
          const meta = PAGE_META[key];
          if (!meta) return null;
          return (
            <NavLink
              key={key}
              label={meta.label} icon={meta.icon}
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
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "6px 14px", borderRadius: 8,
      background: active ? "rgba(212,175,55,0.2)" : "transparent",
      border: active ? "1px solid rgba(212,175,55,0.4)" : "1px solid transparent",
      color: active ? "#D4AF37" : "rgba(255,255,255,0.55)",
      fontSize: 12, fontWeight: active ? 700 : 500,
      cursor: "pointer", fontFamily: "'Cairo',sans-serif",
      whiteSpace: "nowrap", transition: "all .15s", flexShrink: 0,
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </button>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#F4F7F9", fontFamily: "'Cairo',sans-serif", direction: "rtl",
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

/* ─── Access Denied ─── */
function AccessDenied() {
  const router = useRouter();
  return (
    <div style={{
      minHeight: "80vh", display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "'Cairo',sans-serif", direction: "rtl",
    }}>
      <div style={{
        textAlign: "center", background: "#fff", borderRadius: 20,
        padding: "48px 40px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        maxWidth: 380,
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#1B365D", marginBottom: 8 }}>
          غير مصرح بالوصول
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
          ليس لديك صلاحية للوصول لهذه الصفحة
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "10px 24px", borderRadius: 10,
            background: "linear-gradient(135deg,#1B365D,#2a4a7f)",
            color: "#fff", border: "none", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Cairo',sans-serif",
          }}
        >
          🏠 العودة للرئيسية
        </button>
      </div>
    </div>
  );
}

/* ─── Main Layout ─── */
export default function DashboardLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]       = useState(null);
  const [checking, setChecking] = useState(true);
  const [denied, setDenied]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) { router.replace("/login"); return; }

    const payload = decodeJWT(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      localStorage.removeItem("auth_token");
      router.replace("/login");
      return;
    }

    setUser(payload);

    // ── تحقق من الصلاحية على الصفحة الحالية ──
    if (payload.role !== "admin") {
      const permissions = payload.permissions || [];
      // ابحث عن أي page meta مسار بيبدأ بالـ pathname الحالي
      const currentPageKey = Object.entries(PAGE_META).find(([, meta]) =>
        pathname.startsWith(meta.path)
      )?.[0];

      // لو الصفحة محمية وما عنده صلاحية — امنعه
      if (currentPageKey && !permissions.includes(currentPageKey)) {
        setDenied(true);
      }
    }

    setChecking(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.replace("/login");
  };

  if (checking) return <LoadingScreen />;

  // ─── احسب الصفحات المسموحة بناءً على role أو permissions ───
  const computedRole = user?.role || "doctor";
  const userPermissions = user?.permissions || [];
  const computedPages =
    computedRole === "admin"
      ? ADMIN_PAGES
      : ROLE_CONFIG[computedRole]?.pages?.length
        ? ROLE_CONFIG[computedRole].pages
        : userPermissions.filter((p) => PAGE_META[p]);

  return (
    <AuthContext.Provider value={{
      user,
      role: computedRole,
      permissions: userPermissions,
      allowedPages: computedPages,
    }}>
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
        <main style={{ width: "100%" }}>
          {denied ? <AccessDenied /> : children}
        </main>
      </div>
    </AuthContext.Provider>
  );
}