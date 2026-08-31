"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
export const dynamic = "force-dynamic";
import { useLang } from "@/client/context/LangContext";
import { TRANSLATIONS, MEDIA_ITEMS_FALLBACK } from "@/client/content/home";
import ParticlesBackground from "@/client/components/home/ParticlesBackground";
import PresidentQuoteSlide from "@/client/components/home/PresidentQuoteSlide";
import NewsTicker from "@/client/components/home/NewsTicker";
import IconGlyph from "@/client/components/home/IconGlyph";
import PersonModal from "@/client/components/home/PersonModal";
import "./styles/home.css";


function proxyImg(url) {
  if (!url) return "";
  if (url.includes("vercel-storage.com") || url.includes("blob.vercel")) {
    return `/api/gallery/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

// ✅ دالة للحصول على البطاقات (carousel)
function getOrgCards(isRtl) {
  if (isRtl) {
    return ["/OIP.webp", "/OIP2.webp"]; // عربي
  } else {
    return ["/OIP.webp", "/OIP2.webp"]; // انجليزي
  }
}

/* ─── Constants ─── */
const B = "#1B365D",
  R = "#C8102E",
  G = "#D4AF37";
const STAT_ICONS = ["🎤", "🔬", "👥", "🌍"];
const STAT_COLORS = [R, B, "#0e7490", "#047857"];
const TARGETS = { speakers: 20, sessions: 15, attendees: 1000, countries: 5 };

function useBreakpoint() {
  const [bp, setBp] = useState("desktop");
  useEffect(() => {
    const check = () =>
      setBp(
        window.innerWidth < 640
          ? "mobile"
          : window.innerWidth < 1100
            ? "tablet"
            : "desktop",
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}





export default function Home() {
  const { lang } = useLang();
  const t = useMemo(() => TRANSLATIONS[lang] ?? TRANSLATIONS.ar, [lang]);
  const isRtl = lang === "ar";

  const [modal, setModal] = useState(null);
  const [counts, setCounts] = useState({
    speakers: 0,
    sessions: 0,
    attendees: 0,
    countries: 0,
  });
  const [visible, setVisible] = useState({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState(MEDIA_ITEMS_FALLBACK);
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [orgCardIndex, setOrgCardIndex] = useState(0);

  // ✅ Carousel للمؤسسة الداعمة - تبديل كل 5 ثواني
  useEffect(() => {
    const interval = setInterval(() => {
      setOrgCardIndex((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/gallery/media")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setMediaItems(d.items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        const published =
          data.items?.filter((item) => item.published !== false) || [];
        setNewsItems(published);
        setNewsLoading(false);
      })
      .catch(() => {
        setNewsLoading(false);
      });
  }, []);

  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredLeader, setHoveredLeader] = useState(null);
  const [hoveredCommittee, setHoveredCommittee] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  const statsRef = useRef(null);
  const animated = useRef(false);
  const sliderRef = useRef(null);
  const autoPlay = useRef(null);

  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const NAV_H = isMobile ? 64 : isTablet ? 90 : 130;
  const STICKY_TOP = NAV_H + 38 + 8;
  const SLIDE_H = isMobile ? 220 : isTablet ? 300 : 400;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !animated.current) {
          animated.current = true;
          const dur = 1800,
            t0 = performance.now();
          const step = (now) => {
            const p = Math.min((now - t0) / dur, 1),
              ease = 1 - Math.pow(1 - p, 3);
            setCounts({
              speakers: Math.round(TARGETS.speakers * ease),
              sessions: Math.round(TARGETS.sessions * ease),
              attendees: Math.round(TARGETS.attendees * ease),
              countries: Math.round(TARGETS.countries * ease),
            });
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    animated.current = false;
    setVisible({});
    const tm = setTimeout(() => {
      setVisible((p) => ({ ...p, hero: true, stats: true, gallery: true }));
      const els = document.querySelectorAll("[data-reveal]");
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting)
              setVisible((p) => ({
                ...p,
                [e.target.getAttribute("data-reveal")]: true,
              }));
          }),
        { threshold: 0.1 },
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 100);
    return () => clearTimeout(tm);
  }, [lang]);

  useEffect(() => {
    autoPlay.current = setInterval(
      () => setActiveSlide((p) => (p + 1) % mediaItems.length),
      5000,
    );
    return () => clearInterval(autoPlay.current);
  }, [mediaItems.length]);

  const goTo = (idx) => {
    setActiveSlide((idx + mediaItems.length) % mediaItems.length);
    clearInterval(autoPlay.current);
    autoPlay.current = setInterval(
      () => setActiveSlide((p) => (p + 1) % mediaItems.length),
      5000,
    );
  };
  const onDragStart = (x) => {
    setIsDragging(true);
    setDragStart(x);
    setDragDelta(0);
  };
  const onDragMove = (x) => {
    if (!isDragging) return;
    setDragDelta(x - dragStart);
  };
  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDelta < -60) goTo(activeSlide + 1);
    else if (dragDelta > 60) goTo(activeSlide - 1);
    setDragDelta(0);
  };

  const rev = (id, delay = 0) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const slideTranslate = `translateX(calc(${isRtl ? "+" : "-"}${activeSlide * 100}% + ${isRtl ? -dragDelta : dragDelta}px))`;

  const statVals = [
    counts.speakers === TARGETS.speakers
      ? `${TARGETS.speakers}+`
      : String(counts.speakers),
    counts.sessions === TARGETS.sessions
      ? `${TARGETS.sessions}+`
      : String(counts.sessions),
    counts.attendees === TARGETS.attendees ? "1K+" : String(counts.attendees),
    counts.countries === TARGETS.countries
      ? `${TARGETS.countries}+`
      : String(counts.countries),
  ];

  const orgCards = useMemo(() => getOrgCards(isRtl), [isRtl]);

  const sidebarRightContent = useMemo(
    () => (
      <>
        {/* ══ بطاقة المؤسسة الداعمة (نظيفة وبسيطة) ══ */}
        {/* ══ بطاقة المؤسسة الداعمة — حسب دليل الهوية البصرية ══ */}
{(() => {
  const NAVY = "#0D1B2A";
  const GOLD_LIGHT = "#F4D78B";
  const GRAY_LIGHT = "#F7F9FC";
  const GRAY = "#E6EBF1";
  const SLATE = "#2C3E50";

  const TIERS = [
    {
      key: "gold",
      label: isRtl ? "الداعم الذهبي" : "Gold Sponsor",
      badgeBg: `linear-gradient(135deg,${G},${GOLD_LIGHT},${G})`,
      badgeText: NAVY,
      diamond: G,
      ring: `0 0 0 1px ${G}55, 0 14px 36px ${G}22`,
      frameBorder: `linear-gradient(135deg,${G},${GOLD_LIGHT},${G})`,
    },
    {
      key: "silver",
      label: isRtl ? "الداعم الفضي" : "Silver Sponsor",
      badgeBg: `linear-gradient(135deg,#C7CBD3,${GRAY},#C7CBD3)`,
      badgeText: SLATE,
      diamond: "#B7BDC8",
      ring: `0 0 0 1px #B7BDC855, 0 14px 36px #B7BDC822`,
      frameBorder: `linear-gradient(135deg,#C7CBD3,${GRAY},#C7CBD3)`,
    },
  ];
  const active = TIERS[orgCardIndex] || TIERS[0];

  const BENEFITS = [
    { icon: "globe", ar: "خبرة عالمية", en: "Global Expertise" },
    { icon: "handshake", ar: "شراكة طبية", en: "Medical Partnership" },
    { icon: "medal", ar: "معايير عالية", en: "High Standards" },
    { icon: "microscope", ar: "خبرة علمية", en: "Scientific Excellence" },
  ];


  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: active.ring,
        transition: "box-shadow 0.5s ease",
        border: `1px solid ${GRAY}`,
      }}
    >
      {/* الرأس المصغّر */}
      <div
  style={{
    position: "relative",
    padding: "14px 16px 13px",
    background: `linear-gradient(135deg,${NAVY}06,${G}0a)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  }}
>
    {/* شارة الأيقونة مع توهج نابض */}
  <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
    {/* حلقة نابضة خلفية */}
    <div
      style={{
        position: "absolute",
        inset: -6,
        borderRadius: 16,
        border: `1.5px solid ${G}`,
        animation: "icon-pulse-ring 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: 12,
        background: `linear-gradient(135deg,${NAVY},#1a3050)`,
        border: `1px solid ${G}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "glow-gold 3s ease-in-out infinite",
      }}
    >
      <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: G, fill: "none", strokeWidth: 1.6 }}>
        <path d="M4 21V6a1 1 0 011-1h6a1 1 0 011 1v15M13 21V10a1 1 0 011-1h5a1 1 0 011 1v11" strokeLinejoin="round" />
        <path d="M7 8h1M7 11h1M7 14h1M10 8h1M10 11h1M10 14h1M16 12h1M16 15h1M16 18h1" strokeLinecap="round" />
        <path d="M2 21h20" strokeLinecap="round" />
      </svg>
    </div>
  </div>

  {/* العنوان */}
  <span
    style={{
      fontSize: 20,
      fontWeight: 900,
      color: NAVY,
      letterSpacing: "0.4px",
    }}
  >
    {t.supportingOrg}
  </span>

  {/* خط سفلي متدرّج بدل الحد العادي */}
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: "5%",
      right: "5%",
      height: 1,
      background: `linear-gradient(90deg,transparent,${G}70,transparent)`,
    }}
  />
</div>


      {/* بطاقة الشعار السداسية */}
               <div
        style={{
          position: "relative",
          padding: "6px 18px 18px",
          background: `radial-gradient(circle at 50% 0%, ${NAVY}05, ${GRAY_LIGHT})`,
          textAlign: "center",
        }}
      >
                {/* زخرفة علوية */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ width: 50, height: 1, background: `linear-gradient(90deg,transparent,${G}80)` }} />
          <span style={{ color: G, fontSize: 20 }}>✦</span>
          <span style={{ width: 50, height: 1, background: `linear-gradient(270deg,transparent,${G}80)` }} />
        </div>

        {/* الإطار السداسي */}
                {/* إطار الشعار — مربع عاجي */}
        <div
          key={`frame-${orgCardIndex}`}
          style={{
            width: 250,
            height: 200,
            margin: "0 auto 14px",
            borderRadius: 20,
            padding: 3,
            background: active.frameBorder,
            boxShadow: "0 10px 26px rgba(0,0,0,0.14)",
            animation: "fade-in 0.5s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 17,
              background: "#FFFCF4",
              border: `1px solid ${G}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: 3,
            }}
          >
            <img
              src={orgCards[orgCardIndex]}
              alt={active.label}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const p = e.currentTarget.parentElement;
                if (p)
                  p.innerHTML = `<div style="font-size:15px;font-weight:900;color:${NAVY};">UK-MED</div>`;
              }}
            />
          </div>
        </div>

       

        {/* شارة الفئة */}
        <div
          key={`badge-${orgCardIndex}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 16px",
            borderRadius: 30,
            background: active.badgeBg,
            boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            animation: "fade-in 0.5s ease",
          }}
        >
          <span style={{ width: 8, height: 8, background: active.badgeText, opacity: 0.75, transform: "rotate(45deg)" }} />
          <span style={{ fontSize: 11, fontWeight: 900, color: active.badgeText, letterSpacing: "0.4px" }}>
            {active.label}
          </span>
        </div>
      </div>

      {/* صف الأيقونات */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 4,
          padding: "14px 10px",
          background: "#fff",
          borderTop: `1px solid ${GRAY}`,
        }}
      >
        {BENEFITS.map((b, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, textAlign: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1.4px solid ${G}55`,
                background: `${G}0a`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconGlyph type={b.icon} color={G} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: SLATE, lineHeight: 1.3 }}>
              {isRtl ? b.ar : b.en}
            </span>
          </div>
        ))}
      </div>

      {/* البانر السفلي */}
      <div
        style={{
          background: `linear-gradient(135deg,${NAVY},#152840)`,
          padding: "10px 14px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg,transparent,${G},transparent)`,
          }}
        />
        <div style={{ fontSize: 10, fontWeight: 700, color: GOLD_LIGHT, letterSpacing: "0.3px" }}>
          {t.conferenceTitle}
        </div>
      </div>
    </div>
  );
})()}

        {/* ══ لجان المؤتمر (COMMITTEES) ══ */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `1px solid ${G}28`,
            overflow: "hidden",
            boxShadow: "0 3px 14px rgba(27,54,93,0.07)",
            marginTop: 16,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              background: `linear-gradient(135deg,${B}06,${G}08)`,
              borderBottom: `1px solid ${B}0c`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>🏛️</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: B }}>
              {t.committeesTitle}
            </span>
          </div>
          {t.committees?.map((c, i) => (
            <button
              key={i}
              onClick={() => setModal({ type: "committee", data: c })}
              onMouseEnter={() => setHoveredCommittee(i)}
              onMouseLeave={() => setHoveredCommittee(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "13px 16px",
                background:
                  hoveredCommittee === i
                    ? `linear-gradient(135deg,${G}08,${B}04)`
                    : "#fff",
                border: "none",
                borderBottom:
                  i < t.committees.length - 1 ? `1px solid ${B}07` : "none",
                cursor: "pointer",
                fontFamily: "'Cairo',sans-serif",
                color: B,
                textAlign: isRtl ? "right" : "left",
                transition: "background 0.25s, transform 0.22s",
                transform:
                  hoveredCommittee === i
                    ? isRtl
                      ? "translateX(-3px)"
                      : "translateX(3px)"
                    : "translateX(0)",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background:
                    hoveredCommittee === i
                      ? `linear-gradient(135deg,${G}25,${B}20)`
                      : `linear-gradient(135deg,${B}08,${G}12)`,
                  border: `1px solid ${G}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                  transition: "transform 0.25s",
                  transform:
                    hoveredCommittee === i
                      ? "rotate(8deg) scale(1.1)"
                      : "rotate(0) scale(1)",
                }}
              >
                {c.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: B,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.members?.[0]}
                </div>
              </div>
              <span
                style={{
                  color: hoveredCommittee === i ? G : "#cbd5e1",
                  fontSize: 14,
                  flexShrink: 0,
                  transition: "color 0.2s",
                }}
              >
                {isRtl ? "‹" : "›"}
              </span>
            </button>
          ))}
        </div>
      </>
    ),
    [t, isRtl, isMobile, hoveredLeader, hoveredCommittee, orgCardIndex, orgCards],
  );

  const sidebarLeftContent = useMemo(
    () => (
      <>
        <PresidentQuoteSlide t={t} isRtl={isRtl} />

        {/* ══ قدم بحثك الآن ══ */}
        <div
          style={{
            background: `linear-gradient(160deg,#FAFBFD,#F2F6FB,#EBF0F8)`,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: `0 4px 24px rgba(27,54,93,0.1),0 0 0 1px ${G}35`,
            border: `1px solid ${G}30`,
            position: "relative",
          }}
        >
          <div
            style={{
              height: 5,
              background: `linear-gradient(90deg,${R},${G},${R})`,
              backgroundSize: "200% 100%",
              animation: "shimmer-border 2.5s linear infinite",
            }}
          />
          <div style={{ padding: "20px 18px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg,${G},#b8941f)`,
                color: "#1a1000",
                fontSize: 11,
                fontWeight: 900,
                padding: "4px 16px",
                borderRadius: 30,
                marginBottom: 14,
                letterSpacing: "1px",
              }}
            >
              {t.edition}
            </div>
            <div
              style={{
                marginBottom: 8,
                fontSize: 12,
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              {t.registerNowSub}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href="/participation"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px",
                  background: `linear-gradient(135deg,${R},#a80d24)`,
                  color: "#fff",
                  borderRadius: 11,
                  fontFamily: "'Cairo',sans-serif",
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: `0 4px 14px ${R}40`,
                  transition: "transform 0.22s, box-shadow 0.22s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-2px) scale(1.02)";
                  e.currentTarget.style.boxShadow = `0 8px 22px ${R}55`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = `0 4px 14px ${R}40`;
                }}
              >
                🎫 {t.btnReg}
              </Link>
              <Link
                href="/program"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "11px",
                  background: "#fff",
                  color: B,
                  borderRadius: 11,
                  fontFamily: "'Cairo',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 700,
                  textDecoration: "none",
                  border: `1.5px solid ${B}25`,
                  transition: "transform 0.22s, border-color 0.22s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = G;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.borderColor = `${B}25`;
                }}
              >
                🎓 {t.btnProg}
              </Link>
            </div>
          </div>
        </div>

        {/* ══ شريط الأخبار ══ */}
        <NewsTicker
          newsItems={newsItems}
          newsLoading={newsLoading}
          t={t}
          isRtl={isRtl}
          onClickItem={(item) => setModal({ type: "news", data: item })}
        />

        {/* QUICK LINKS */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `1px solid ${B}12`,
            overflow: "hidden",
            boxShadow: "0 3px 14px rgba(27,54,93,0.07)",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              background: `linear-gradient(135deg,${B}06,${G}06)`,
              borderBottom: `1px solid ${B}0c`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 17 }}>🔗</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: B }}>
              {t.quickLinks}
            </span>
          </div>
          {t.quickLinksItems.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              onMouseEnter={() => setHoveredLink(i)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom: i < 3 ? `1px solid ${B}07` : "none",
                textDecoration: "none",
                background: hoveredLink === i ? `${B}05` : "#fff",
                color: B,
                transition: "background 0.22s, transform 0.22s",
                transform:
                  hoveredLink === i
                    ? isRtl
                      ? "translateX(-4px)"
                      : "translateX(4px)"
                    : "translateX(0)",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: hoveredLink === i ? `${G}20` : `${B}08`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  flexShrink: 0,
                  transition: "background 0.22s, transform 0.25s",
                  transform:
                    hoveredLink === i ? "rotate(-8deg) scale(1.1)" : "",
                }}
              >
                {link.icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {link.label}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 13,
                  color: hoveredLink === i ? G : "#cbd5e1",
                  transition: "color 0.2s",
                }}
              >
                {isRtl ? "‹" : "›"}
              </span>
            </Link>
          ))}
        </div>
      </>
    ),
    [t, isRtl, newsItems, newsLoading, hoveredLink],
  );

  return (
    <div
      style={{
        direction: t.dir,
        fontFamily: "'Cairo',sans-serif",
        background: "#F0F4F9",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <ParticlesBackground />


      {/* ECG BAR */}
      <div
        style={{
          height: 38,
          background: `linear-gradient(90deg,#EBF0F7,#F0F4F9,#EBF0F7)`,
          overflow: "hidden",
          position: "relative",
          borderBottom: `1px solid ${G}30`,
          zIndex: 2,
        }}
      >
        <svg
          width="100%"
          height="38"
          viewBox="0 0 1200 38"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 0 }}
        >
          <path
            className="ecg-line"
            d="M0 19 L70 19 L86 4 L102 34 L118 19 L230 19 L246 2 L266 36 L282 19 L460 19 L476 4 L492 34 L508 19 L660 19 L676 2 L696 36 L712 19 L860 19 L876 4 L892 34 L908 19 L1200 19"
            fill="none"
            stroke={B}
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
            opacity="0.25"
          />
          <path
            className="ecg-line"
            d="M0 19 L70 19 L86 4 L102 34 L118 19 L230 19 L246 2 L266 36 L282 19 L460 19 L476 4 L492 34 L508 19 L660 19 L676 2 L696 36 L712 19 L860 19 L876 4 L892 34 L908 19 L1200 19"
            fill="none"
            stroke={R}
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
            opacity="0.35"
            style={{ animationDelay: "0.4s" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            direction: "ltr",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22c55e",
              animation: "pulse-dot 1s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>
            LIVE
          </span>
        </div>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div
        className="main-layout"
        style={{
          maxWidth: isMobile || isTablet ? "100%" : 1560,
          margin: "0 auto",
          padding: isMobile
            ? "14px 12px 0"
            : isTablet
              ? "16px 14px 0"
              : "22px 18px 0",
          position: "relative",
          zIndex: 1,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* RIGHT SIDEBAR */}
        {!isMobile && !isTablet && (
          <aside
            className="sidebar-r gold-glow-card"
            style={{
              position: "sticky",
              top: STICKY_TOP,
              borderRadius: 18,
              animation: "slide-in-right 0.7s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {sidebarRightContent}
          </aside>
        )}

        {/* CENTER */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile/Tablet: SidebarRight on top */}
          {(isMobile || isTablet) && (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {sidebarRightContent}
            </div>
          )}

          {/* HERO */}
          <div
            style={{
              ...rev("hero", 0),
              borderRadius: isMobile ? 14 : 22,
              overflow: "hidden",
              marginBottom: isMobile ? 14 : 22,
              boxShadow: `0 0 0 3px ${G}50,0 12px 40px rgba(27,54,93,0.15)`,
              position: "relative",
              animation: visible["hero"]
                ? "hero-fade 1s cubic-bezier(0.22,1,0.36,1) both"
                : "none",
            }}
          >
            <img
              src="/hero-banner.png"
              alt={isRtl ? "شعار المؤتمر" : "Conference Banner"}
              style={{
                width: "100%",
                display: "block",
                objectFit: "cover",
                objectPosition: "center top",
                minHeight: isMobile ? 180 : 260,
                maxHeight: isMobile ? 220 : isTablet ? 300 : 360,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const p = e.currentTarget.parentElement;
                p.style.cssText += `background:linear-gradient(135deg,${G}18,#EBF0F8);min-height:${isMobile ? 180 : 280}px;display:flex;align-items:center;justify-content:center;`;
                const d = document.createElement("div");
                d.style.cssText = "text-align:center;padding:40px;";
                d.innerHTML = `<div style="font-size:60px;margin-bottom:14px">🏥</div><div style="font-size:17px;font-weight:900;color:${B}">${t.conferenceTitle}</div>`;
                p.appendChild(d);
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 5,
                background: `linear-gradient(90deg,${R},${G},${R})`,
                backgroundSize: "200% 100%",
                animation: "shimmer-border 2.5s linear infinite",
              }}
            />
          </div>

          {/* STATS */}
          <div
            ref={statsRef}
            data-reveal="stats"
            className="stats-grid"
            style={{
              ...rev("stats", 0.05),
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: isMobile ? 10 : 14,
              marginBottom: isMobile ? 14 : 22,
            }}
          >
            {STAT_ICONS.map((ico, i) => (
              <div
                key={i}
                className="stat-card"
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                style={{
                  background: "#fff",
                  borderRadius: isMobile ? 12 : 16,
                  padding: isMobile ? "14px 10px" : "22px 16px",
                  border: `1px solid ${STAT_COLORS[i]}18`,
                  boxShadow:
                    hoveredStat === i
                      ? `0 12px 32px ${STAT_COLORS[i]}30,0 0 0 2px ${STAT_COLORS[i]}25`
                      : `0 3px 14px rgba(27,54,93,0.06)`,
                  position: "relative",
                  overflow: "hidden",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg,${STAT_COLORS[i]},${STAT_COLORS[i]}55)`,
                    backgroundSize: "200% 100%",
                    animation:
                      hoveredStat === i
                        ? "shimmer-border 1.5s linear infinite"
                        : "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.5) 50%,transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation:
                      hoveredStat === i ? "shimmer-card 0.8s ease" : "none",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    fontSize: isMobile ? 24 : 32,
                    marginBottom: 6,
                    display: "inline-block",
                    transition: "transform 0.3s",
                    transform:
                      hoveredStat === i
                        ? "scale(1.2) rotate(-8deg)"
                        : "scale(1)",
                  }}
                >
                  {ico}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 26 : 36,
                    fontWeight: 900,
                    color: STAT_COLORS[i],
                    lineHeight: 1,
                    marginBottom: 6,
                    direction: "ltr",
                    letterSpacing: "-1px",
                  }}
                >
                  {statVals[i]}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 10 : 12,
                    color: "#64748b",
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {t.statsLbls[i]}
                </div>
              </div>
            ))}
          </div>

          {/* GALLERY */}
          <div
            data-reveal="gallery"
            style={{
              ...rev("gallery", 0.05),
              background: "#fff",
              borderRadius: isMobile ? 14 : 22,
              overflow: "hidden",
              marginBottom: isMobile ? 14 : 32,
              boxShadow: "0 4px 24px rgba(27,54,93,0.09)",
              border: `1px solid ${G}30`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "10px 14px" : "14px 20px",
                borderBottom: `1px solid ${B}0c`,
                background: "#FAFBFD",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: isMobile ? 32 : 38,
                    height: isMobile ? 32 : 38,
                    borderRadius: 10,
                    background: `${G}15`,
                    border: `1px solid ${G}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? 16 : 18,
                  }}
                >
                  🎞️
                </div>
                <div>
                  <div
                    style={{
                      fontSize: isMobile ? 13 : 15,
                      fontWeight: 900,
                      color: B,
                    }}
                  >
                    {t.galleryTitle}
                  </div>
                  {!isMobile && (
                    <div
                      style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}
                    >
                      {t.gallerySub}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setVideoOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: isMobile ? "5px 12px" : "7px 16px",
                    background: `linear-gradient(135deg,${R},#a80d24)`,
                    border: "none",
                    borderRadius: 20,
                    cursor: "pointer",
                    fontFamily: "'Cairo',sans-serif",
                    fontSize: isMobile ? 11 : 12.5,
                    fontWeight: 800,
                    color: "#fff",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.06)";
                    e.currentTarget.style.boxShadow = `0 6px 18px ${R}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  ▶ {t.videoLabel}
                </button>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#9A7A10",
                    background: `${G}15`,
                    border: `1px solid ${G}30`,
                    padding: "4px 12px",
                    borderRadius: 20,
                    direction: "ltr",
                  }}
                >
                  {activeSlide + 1}/{mediaItems.length}
                </div>
              </div>
            </div>

            <div
              ref={sliderRef}
              style={{
                position: "relative",
                overflow: "hidden",
                userSelect: "none",
              }}
              onMouseDown={(e) => onDragStart(e.clientX)}
              onMouseMove={(e) => onDragMove(e.clientX)}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
              onTouchMove={(e) => {
                e.preventDefault();
                onDragMove(e.touches[0].clientX);
              }}
              onTouchEnd={onDragEnd}
            >
              <div
                className={`slide-track${isDragging ? " drag" : ""}`}
                style={{ transform: slideTranslate }}
              >
                {mediaItems.map((item, i) => {
                  const meta = t.mediaCaptions[i] || { caption: "", tag: "" };
                  return (
                    <div
                      key={i}
                      style={{
                        minWidth: "100%",
                        height: SLIDE_H,
                        position: "relative",
                        flexShrink: 0,
                        background: `linear-gradient(135deg,${G}12,#EBF0F8)`,
                      }}
                    >
                      <img
                        src={proxyImg(item.src)}
                        alt={meta.caption}
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          pointerEvents: "none",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const p = e.currentTarget.parentElement;
                          const d = document.createElement("div");
                          d.style.cssText =
                            "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;";
                          d.innerHTML = `<span style="font-size:48px">🏥</span><span style="color:${B};font-size:15px;font-weight:700;">${meta.caption}</span>`;
                          p.appendChild(d);
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to bottom,transparent 50%,rgba(27,54,93,0.6))",
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          [isRtl ? "right" : "left"]: 12,
                          background: G,
                          color: B,
                          fontSize: 11,
                          fontWeight: 900,
                          padding: "4px 12px",
                          borderRadius: 30,
                        }}
                      >
                        {meta.tag}
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: isMobile
                            ? "20px 16px 12px"
                            : "32px 26px 18px",
                          pointerEvents: "none",
                          animation:
                            i === activeSlide
                              ? "slide-caption 0.55s cubic-bezier(0.22,1,0.36,1) both"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            fontSize: isMobile ? 13 : 16,
                            fontWeight: 800,
                            color: "#fff",
                            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                          }}
                        >
                          {meta.caption}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 6,
                          }}
                        >
                          {mediaItems.map((_, di) => (
                            <div
                              key={di}
                              style={{
                                width: di === i ? 18 : 6,
                                height: 6,
                                borderRadius: 4,
                                background:
                                  di === i ? G : "rgba(255,255,255,0.4)",
                                transition: "all .35s",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {[
                { s: "left", d: isRtl ? +1 : -1, c: "‹" },
                { s: "right", d: isRtl ? -1 : +1, c: "›" },
              ].map((btn) => (
                <button
                  key={btn.s}
                  className="slider-arrow"
                  onClick={() => goTo(activeSlide + btn.d)}
                  style={{
                    [btn.s]: isMobile ? 8 : 16,
                    width: isMobile ? 36 : 48,
                    height: isMobile ? 36 : 48,
                    fontSize: isMobile ? 20 : 24,
                  }}
                >
                  {btn.c}
                </button>
              ))}

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `${B}15`,
                  zIndex: 5,
                }}
              >
                <div
                  key={activeSlide}
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg,${G},${R})`,
                    animation: "progress-bar 5s linear",
                  }}
                />
              </div>
            </div>

            {!isMobile && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "12px 16px",
                  overflowX: "auto",
                  background: "#F4F6FA",
                  scrollbarWidth: "none",
                  borderTop: `1px solid ${B}08`,
                }}
              >
                {mediaItems.map((item, i) => {
                  const meta = t.mediaCaptions[i] || {};
                  return (
                    <div
                      key={i}
                      className={`thumb-item${i === activeSlide ? " active" : ""}`}
                      onClick={() => goTo(i)}
                    >
                      <img
                        src={proxyImg(item.src)}
                        alt={meta.caption || ""}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          pointerEvents: "none",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {i === activeSlide && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: G,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SidebarLeft on mobile/tablet */}
          {(isMobile || isTablet) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {sidebarLeftContent}
            </div>
          )}
        </div>

        {/* LEFT SIDEBAR */}
        {!isMobile && !isTablet && (
          <aside
            className="sidebar-l"
            style={{
              position: "sticky",
              top: STICKY_TOP,
              animation: "slide-in-left 0.7s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {sidebarLeftContent}
          </aside>
        )}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          padding: isMobile ? "16px 14px" : "22px 36px",
          borderTop: `1px solid ${G}25`,
          textAlign: "center",
          background: "#fff",
          color: "#94a3b8",
          fontSize: isMobile ? 11 : 13,
          fontWeight: 600,
          marginTop: 32,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span>{t.footer}</span>
          <span style={{ color: "#e2e8f0" }}>|</span>
          <span
            style={{
              direction: "ltr",
              color: "#cbd5e1",
              fontSize: isMobile ? 10 : 13,
            }}
          >
            Nasser Medical Complex · Gaza · 4–5 Dec 2026
          </span>
        </div>
      </footer>

      {/* VIDEO LIGHTBOX */}
      {videoOpen && (
        <div
          onClick={() => setVideoOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fade-in .2s",
            padding: isMobile ? 12 : 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 900,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: `0 30px 100px rgba(0,0,0,0.5)`,
              animation: "scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg,${R},${G},${R})`,
                backgroundSize: "200% 100%",
                animation: "shimmer-border 2.5s linear infinite",
                zIndex: 10,
              }}
            />
            <button
              onClick={() => setVideoOpen(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: R,
                border: "none",
                borderRadius: "50%",
                width: 38,
                height: 38,
                color: "#fff",
                fontSize: 16,
                cursor: "pointer",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "rotate(90deg) scale(1.1)")
              }
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
              }}
            >
              ✕
            </button>
            <video
              src="/promo-video.mp4"
              controls
              autoPlay
              playsInline
              poster="/hospital-side.jpg"
              style={{
                width: "100%",
                display: "block",
                background: "#000",
                maxHeight: "80vh",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const p = e.currentTarget.parentElement;
                const d = document.createElement("div");
                d.style.cssText = `padding:60px;text-align:center;background:#F0F4F9;font-family:'Cairo',sans-serif;`;
                d.innerHTML = `<div style="font-size:50px;margin-bottom:14px">▶️</div><div style="font-size:16px;font-weight:700;color:${B}">${t.noVideo}</div>`;
                p.appendChild(d);
              }}
            />
          </div>
        </div>
      )}

      {/* MODALS */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,54,93,0.65)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 999,
            backdropFilter: "blur(10px)",
            animation: "fade-in .2s",
            overflowY: "auto",
            padding: isMobile
              ? "80px 12px 40px"
              : `${STICKY_TOP + 16}px 20px 40px`,
          }}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: isMobile ? 18 : 24,
              width: "100%",
              maxWidth: isMobile ? "100%" : 520,
              position: "relative",
              boxShadow: `0 28px 70px rgba(27,54,93,0.25),0 0 0 2px ${G}30`,
              borderTop: `5px solid ${modal.type === "news" ? R : G}`,
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setModal(null)}
              style={{
                position: "absolute",
                top: 14,
                [isRtl ? "left" : "right"]: 14,
                background: "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                cursor: "pointer",
                fontSize: 15,
                color: "#64748b",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.25s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
                e.currentTarget.style.background = `${R}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.background = "#f1f5f9";
              }}
            >
              ✕
            </button>

            {modal.type === "person" && (
              <PersonModal
                image={modal.data.image}
                badgeLabel={modal.data.role}
                name={modal.data.name}
                title={modal.data.title}
                email={modal.data.email}
                phone={modal.data.phone}
                bio={modal.data.bio}
                expertise={modal.data.expertise}
                expertiseLbl={t.expertiseLbl}
                isMobile={isMobile}
                isRtl={isRtl}
              />
            )}

            {modal.type === "committee" &&
              (() => {
                const c = modal.data;
                return (
                  <div style={{ direction: t.dir }}>
                    {c.head ? (
                      <PersonModal
                        image={c.head.image}
                        badgeLabel={c.name}
                        name={c.head.name}
                        title={c.head.title}
                        email={c.head.email}
                        phone={c.head.phone}
                        bio={c.head.bio}
                        expertise={c.head.expertise}
                        expertiseLbl={t.expertiseLbl}
                        isMobile={isMobile}
                        isRtl={isRtl}
                      />
                    ) : (
                      <div
                        style={{
                          padding: isMobile ? "30px 20px" : "40px 30px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 18,
                            background: `${B}10`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 32,
                            margin: "0 auto 14px",
                            animation: "float-avatar 3s ease-in-out infinite",
                          }}
                        >
                          {c.icon}
                        </div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: B,
                            marginBottom: 4,
                          }}
                        >
                          {c.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: R,
                            background: `${R}0e`,
                            padding: "4px 14px",
                            borderRadius: 30,
                            display: "inline-block",
                            marginBottom: 14,
                          }}
                        >
                          {t.execCommittee}
                        </div>
                        <p
                          style={{
                            color: "#475569",
                            fontSize: 14,
                            lineHeight: 1.9,
                            background: "#F8FAFC",
                            padding: "14px 16px",
                            borderRadius: 12,
                            border: "1px solid #e8edf2",
                            marginBottom: 16,
                            textAlign: isRtl ? "right" : "left",
                          }}
                        >
                          {c.desc}
                        </p>
                        <div
                          style={{
                            background: "#fef9ee",
                            borderRadius: 12,
                            border: `1px solid ${G}35`,
                            padding: "14px 16px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 900,
                              color: B,
                              marginBottom: 10,
                            }}
                          >
                            👥 {t.membersLbl}
                          </div>
                          {c.members.map((m, i) => (
                            <div
                              key={i}
                              style={{
                                background: "#fff",
                                padding: "10px 14px",
                                borderRadius: 10,
                                [isRtl ? "borderRight" : "borderLeft"]:
                                  `3px solid ${G}`,
                                fontSize: 13,
                                fontWeight: 700,
                                color: B,
                                border: "1px solid #e8edf2",
                                marginBottom: i < c.members.length - 1 ? 8 : 0,
                              }}
                            >
                              ✓ {m}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            {modal.type === "news" && (
              <div
                style={{
                  padding: isMobile ? "30px 20px" : "40px 30px",
                  textAlign: "center",
                  direction: t.dir,
                }}
              >
                <div
                  style={{
                    fontSize: 40,
                    marginBottom: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 80,
                    height: 80,
                    background: `${R}0e`,
                    borderRadius: 18,
                    animation: "float-avatar 3s ease-in-out infinite",
                  }}
                >
                  {modal.data.icon || "📰"}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 17 : 21,
                    fontWeight: 900,
                    color: B,
                    marginBottom: 5,
                  }}
                >
                  {modal.data.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {modal.data.date}
                </div>
                <div
                  style={{
                    width: 40,
                    height: 3,
                    background: `linear-gradient(90deg,${R},${G})`,
                    borderRadius: 3,
                    margin: "0 auto 14px",
                    backgroundSize: "200% 100%",
                    animation: "shimmer-border 2.5s linear infinite",
                  }}
                />
                <div
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 12,
                    padding: "16px 18px",
                    fontSize: isMobile ? 13 : 15,
                    color: "#475569",
                    lineHeight: 2,
                    border: "1px solid #e8edf2",
                    textAlign: isRtl ? "right" : "left",
                  }}
                >
                  {modal.data.content}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
