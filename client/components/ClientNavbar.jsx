"use client";

// components/ClientNavbar.js
// ملف واحد يجمع الـ Navbar + خط النبض + شريط الأخبار كاملاً

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Globe, Menu, X, Pause, Play, Megaphone } from 'lucide-react';
import { useLang } from '@/client/context/LangContext';

const emergencyBlue = "#1B365D";
const goldenTouch   = "#D4AF37";
const goldLight     = "#F4D79B";
const pulseRed      = "#C8102E";

const translations = {
  ar: {
    dir: 'rtl',
    title: "المؤتمر العلمي الثاني عشر لأمراض الباطنة",
    subtitle: "The 12th Conference of Internal Medicine",
    switchBtn: "English",
    tickerLabel: "آخر أخبار المؤتمر",
    links: [
      { name: "الرئيسية",        href: "/" },
      { name: "البرنامج العلمي", href: "/program" },
      { name: "تقديم الأبحاث",  href: "/participation" },
      { name: "التسجيل والحضور", href: "/live" },
    ],
  },
  en: {
    dir: 'ltr',
    title: "The 12th Conference of Internal Medicine",
    subtitle: "Scientific excellence & sustainable health",
    switchBtn: "العربية",
    tickerLabel: "Conference News",
    links: [
      { name: "Home",                href: "/" },
      { name: "Scientific Program",  href: "/program" },
      { name: "Abstract Submission", href: "/participation" },
      { name: "Registration",        href: "/live" },
    ],
  },
};

const PLACEHOLDER_NEWS = {
  ar: [
    "فتح باب التسجيل في المؤتمر الثاني عشر لأمراض الباطنة",
    "تحديث البرنامج العلمي وقائمة المتحدثين الدوليين",
    "مواعيد الورش والمحاضرات — ديسمبر 2026",
    "إطلاق الموقع الرسمي للمؤتمر",
  ],
  en: [
    "Registration is now open for the 12th Internal Medicine Conference",
    "Scientific program and international speakers list updated",
    "Workshop and lecture schedules announced — December 2026",
    "Official conference website launched",
  ],
};

function getNewsTitle(item, lang) {
  if (typeof item === "string") return item.trim();
  if (!item || typeof item !== "object") return "";

  let title;
  if (lang === "ar") {
    title = item.titleAr ?? item.title_ar ?? item.title ?? item.titleEn ?? item.title_en;
  } else {
    title = item.titleEn ?? item.title_en ?? item.title ?? item.titleAr ?? item.title_ar;
  }

  if (typeof title === "string") return title.trim();

  if (title && typeof title === "object") {
    const localized = title[lang] ?? title.ar ?? title.en;
    return typeof localized === "string" ? localized.trim() : "";
  }

  return "";
}

function useBreakpoint() {
  const [bp, setBp] = useState('desktop');
  useEffect(() => {
    const check = () => setBp(
      window.innerWidth < 768 ? 'mobile' :
      window.innerWidth < 1100 ? 'tablet' : 'desktop'
    );
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return bp;
}

/* ─────────────────────────────────────────────
   خط نبض القلب (ECG) — بديل الخط الذهبي المستقيم
   يعمل عبر SVG متكرر كخلفية، يتحرك أفقياً باستمرار
───────────────────────────────────────────── */
function HeartbeatPulseLine({ top, height = 10 }) {
  const svgMarkup = `
    <svg xmlns='http://www.w3.org/2000/svg' width='120' height='24' viewBox='0 0 120 24'>
      <defs>
        <linearGradient id='pulseGradient' x1='0' y1='0' x2='100%' y2='0'>
          <stop offset='0%' stop-color='${pulseRed}' />
          <stop offset='50%' stop-color='${goldenTouch}' />
          <stop offset='100%' stop-color='${pulseRed}' />
        </linearGradient>
      </defs>
      <polyline
        points='0,12 18,12 23,12 27,3 31,21 35,12 39,12 60,12 78,12 83,12 87,3 91,21 95,12 99,12 120,12'
        fill='none'
        stroke='url(#pulseGradient)'
        stroke-width='2.4'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
    </svg>
  `;

  const encodedSvg = encodeURIComponent(svgMarkup.replace(/\s+/g, ' ').trim());

  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        height,
        position: 'sticky',
        top,
        zIndex: 999,
        backgroundColor: emergencyBlue,
        backgroundImage: `url("data:image/svg+xml,${encodedSvg}")`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: '120px 100%',
        backgroundPosition: '0 center',
        animation: 'heartbeat-scroll 1.8s linear infinite',
        boxShadow: `0 0 10px ${pulseRed}77`,
        flexShrink: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   شريط أخبار بعرض الصفحة (Marquee حقيقي)
───────────────────────────────────────────── */
function FullWidthTicker({ lang, isMobile, top, onHeight }) {
  const isRtl = lang === 'ar';
  const t = translations[lang];

  const [newsItems, setNewsItems] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const tickerHeight = isMobile ? 36 : 42;

  useEffect(() => {
    if (onHeight) onHeight(tickerHeight);
  }, [tickerHeight, onHeight]);

  useEffect(() => {
    const controller = new AbortController();
    setNewsItems([]);

    fetch("/api/news", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load news");
        return res.json();
      })
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        const titles = items
          .filter((item) => item?.published !== false)
          .map((item) => getNewsTitle(item, lang))
          .filter(Boolean);
        setNewsItems(titles);
      })
      .catch(() => {
        if (!controller.signal.aborted) setNewsItems([]);
      });

    return () => controller.abort();
  }, [lang]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handle = (e) => setReducedMotion(e.matches);
    setReducedMotion(mq.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handle);
      return () => mq.removeEventListener("change", handle);
    }
    mq.addListener(handle);
    return () => mq.removeListener(handle);
  }, []);

  const tickerItems = useMemo(() => {
    if (newsItems.length > 0) return newsItems;
    return PLACEHOLDER_NEWS[lang] ?? PLACEHOLDER_NEWS.ar;
  }, [newsItems, lang]);

  const animationDuration = useMemo(() => {
    const totalChars = tickerItems.reduce((total, item) => total + item.length, 0);
    return Math.max(28, Math.min(75, totalChars * 0.18));
  }, [tickerItems]);

  const animationPaused = isPaused || isHovered || reducedMotion;

  return (
    <div
      role="region"
      aria-label={isRtl ? "شريط أخبار المؤتمر" : "Conference news ticker"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        height: tickerHeight,
        boxSizing: "border-box",
        position: "sticky",
        top,
        zIndex: 998,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        flexShrink: 0,
        direction: "ltr",
        flexDirection: isRtl ? "row" : "row-reverse",
        background: `linear-gradient(90deg, ${emergencyBlue} 0%, #24467a 50%, ${emergencyBlue} 100%)`,
      }}
    >
      {/* زر إيقاف / تشغيل */}
      <button
        type="button"
        onClick={() => setIsPaused((p) => !p)}
        aria-label={isPaused ? (isRtl ? "تشغيل شريط الأخبار" : "Play news ticker") : (isRtl ? "إيقاف شريط الأخبار" : "Pause news ticker")}
        aria-pressed={isPaused}
        title={isPaused ? (isRtl ? "تشغيل" : "Play") : (isRtl ? "إيقاف" : "Pause")}
        style={{
          width: 27, height: 25,
          margin: "0 10px",
          padding: 0,
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", borderRadius: 5,
          color: emergencyBlue,
          background: goldLight,
          cursor: "pointer",
          position: "relative", zIndex: 1,
        }}
      >
        {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
      </button>

      <div aria-hidden="true" style={{ width: 1, height: "55%", flexShrink: 0, background: `${goldenTouch}55`, position: "relative", zIndex: 1 }} />

      {/* الأخبار المتحركة */}
      <div style={{ height: "100%", flex: 1, minWidth: 0, display: "flex", alignItems: "center", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <div
          className="ticker-track"
          style={{
            animationName: reducedMotion ? "none" : "ticker-marquee",
            animationDuration: `${animationDuration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationPlayState: animationPaused ? "paused" : "running",
          }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="ticker-group" dir={t.dir} aria-hidden={copy === 1}>
              {tickerItems.map((item, index) => (
                <span key={`${copy}-${index}`} dir={t.dir} style={{
                  display: "inline-flex", alignItems: "center", flexShrink: 0,
                  paddingInline: 18, color: "#E8EDF4", fontSize: 13, fontWeight: 700,
                  fontFamily: "inherit", whiteSpace: "nowrap",
                }}>
                  <span aria-hidden="true" style={{ color: goldenTouch, marginInlineEnd: 8, fontSize: 9 }}>◆</span>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" style={{ width: 1, height: "55%", flexShrink: 0, background: `${goldenTouch}55`, position: "relative", zIndex: 1 }} />

      {/* عنوان الأخبار */}
      <div style={{
        height: "100%", padding: "0 16px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        flexShrink: 0, direction: t.dir, color: goldLight, whiteSpace: "nowrap",
        position: "relative", zIndex: 1, borderInlineEnd: `1px solid ${goldenTouch}35`,
      }}>
        <Megaphone size={16} color={goldenTouch} strokeWidth={2} />
        <span className="ticker-label" style={{ fontSize: 11, fontWeight: 900, fontFamily: "inherit" }}>
          {t.tickerLabel}
        </span>
      </div>
    </div>
  );
}

export default function ClientNavbar() {
  const { lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tickerHeight, setTickerHeight] = useState(42);
  const bp       = useBreakpoint();
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const t        = translations[lang];

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  const navHeight   = isMobile ? 64 : isTablet ? 90 : 130;
  const pulseHeight = isMobile ? 8 : 10;
  const logoH       = isMobile ? 52 : isTablet ? 72 : 150;
  const titleSize   = isMobile ? '1rem' : isTablet ? '1.2rem' : '1.6rem';
  const subSize     = isMobile ? '0.75rem' : isTablet ? '0.85rem' : '1rem';

  return (
    <>
      <style>{`
        @keyframes glow-pulse {
          0%   { filter: drop-shadow(0 0 8px rgba(212,175,55,0.4)); }
          100% { filter: drop-shadow(0 0 20px rgba(212,175,55,0.7)); }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes heartbeat-scroll {
          from { background-position-x: 0; }
          to   { background-position-x: -120px; }
        }
        @keyframes ticker-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          align-items: center;
          width: max-content;
          will-change: transform;
        }
        .ticker-group {
          display: flex;
          align-items: center;
          flex: 0 0 auto;
          width: max-content;
        }
        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 800;
          font-size: 1.05rem;
          position: relative;
          padding-bottom: 3px;
          transition: color .2s;
        }
        .nav-link::after {
          content:'';
          position:absolute;
          bottom:0; left:0; right:0;
          height:2px;
          background:${goldenTouch};
          transform:scaleX(0);
          transition:transform .25s;
        }
        .nav-link:hover::after { transform:scaleX(1); }
        .nav-link:hover { color:${goldenTouch}; }
        .mobile-link {
          display: block;
          padding: 14px 20px;
          color: white;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          border-bottom: 1px solid rgba(212,175,55,0.15);
          transition: background .2s;
        }
        .mobile-link:hover { background: rgba(212,175,55,0.1); }
        .hamburger-btn {
          background: transparent;
          border: 2px solid rgba(212,175,55,0.6);
          border-radius: 8px;
          color: ${goldenTouch};
          width: 40px; height: 40px;
          display: flex; align-items:center; justify-content:center;
          cursor: pointer;
          transition: all .2s;
        }
        .hamburger-btn:hover { background: rgba(212,175,55,0.12); border-color: ${goldenTouch}; }
        @media (max-width: 520px) {
          .ticker-label { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        backgroundColor: emergencyBlue,
        padding: isMobile ? '0 14px' : isTablet ? '0 20px' : '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        direction: t.dir,
        height: navHeight,
        position: 'sticky', top: 0, zIndex: 1000,
        boxSizing: 'border-box',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      }}>

        {/* شعار + عنوان */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 18, minWidth: 0 }}>
          <div style={{ position: 'relative', top: isMobile ? 0 : 8, flexShrink: 0 }}>
            <img src="/logo.png" alt="Logo" style={{
              height: logoH, width: 'auto', objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.6))',
              animation: 'glow-pulse 2s infinite alternate',
            }} />
          </div>

          {!isMobile && (
            <div style={{
              [t.dir === 'rtl' ? 'borderRight' : 'borderLeft']: `3px solid ${goldenTouch}88`,
              [t.dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: isTablet ? 16 : 25,
              minWidth: 0,
            }}>
              <h2 style={{
                color: 'white', margin: 0, fontSize: titleSize, fontWeight: 900, lineHeight: 1.2,
                overflow: isTablet ? 'hidden' : 'visible',
                textOverflow: isTablet ? 'ellipsis' : 'clip',
                whiteSpace: isTablet ? 'nowrap' : 'normal',
                maxWidth: isTablet ? '380px' : 'none',
              }}>{t.title}</h2>
              <p style={{ color: goldenTouch, margin: '4px 0 0 0', fontSize: subSize, fontWeight: 'bold' }}>
                {t.subtitle}
              </p>
            </div>
          )}

          {isMobile && (
            <div style={{ minWidth: 0 }}>
              <h2 style={{
                color: 'white', margin: 0, fontSize: '0.85rem', fontWeight: 900, lineHeight: 1.3,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>{t.title}</h2>
            </div>
          )}
        </div>

        {/* Desktop: روابط + لغة */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: isTablet ? '1.4rem' : '2.8rem', alignItems: 'center', flexShrink: 0 }}>
            {t.links.map((link, i) => (
              <Link key={i} href={link.href} className="nav-link"
                style={{ fontSize: isTablet ? '0.88rem' : '1.05rem' }}>
                {link.name}
              </Link>
            ))}
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{
              backgroundColor: 'transparent', border: `2px solid ${goldenTouch}`,
              color: goldenTouch, padding: isTablet ? '6px 14px' : '8px 20px',
              borderRadius: 30, cursor: 'pointer', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: isTablet ? '0.82rem' : '0.95rem', transition: 'all .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Globe size={isTablet ? 15 : 18} /> {t.switchBtn}
            </button>
          </div>
        )}

        {/* Mobile: لغة + Hamburger */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{
              backgroundColor: 'transparent', border: `1.5px solid ${goldenTouch}88`,
              color: goldenTouch, padding: '5px 10px', borderRadius: 20,
              cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Globe size={13} /> {t.switchBtn}
            </button>
            <button className="hamburger-btn"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}
      </nav>

      {/* ── خط نبض القلب — بديل الخط الذهبي المستقيم ── */}
      <HeartbeatPulseLine top={navHeight} height={pulseHeight} />

      {/* ── شريط الأخبار ── */}
      <FullWidthTicker
        lang={lang}
        isMobile={isMobile}
        top={navHeight + pulseHeight}
        onHeight={setTickerHeight}
      />

      {/* Mobile Dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'sticky', top: navHeight + pulseHeight + tickerHeight, zIndex: 997,
          background: emergencyBlue,
          borderBottom: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          direction: t.dir, animation: 'slideDown .2s ease',
        }}>
          {t.links.map((link, i) => (
            <Link key={i} href={link.href} className="mobile-link"
              onClick={() => setMenuOpen(false)}>
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}