"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
const statsSaveTimer = { current: null };
 
function saveStats(likes, views) {
  clearTimeout(statsSaveTimer.current);
  statsSaveTimer.current = setTimeout(() => {
    fetch("/api/gallery/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ likes, views }),
    }).catch(() => {}); // صامت عند الفشل
  }, 1500); // نانتظر 1.5 ثانية قبل الإرسال
}
 
function proxyImg(url) {
  if (!url) return "";
  if (url.includes("vercel-storage.com") || url.includes("blob.vercel")) {
    return `/api/gallery/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function getOrgCards(isRtl) {
  return ["/OIP.webp", "/OIP2.webp"];
}

/* ─── Constants ─── */
const B = "#1B365D",
  R = "#C8102E",
  G = "#D4AF37";
const STAT_ICONS = ["🎤", "🔬", "👥", "🌍"];
const STAT_COLORS = [R, B, "#0e7490", "#047857"];
const TARGETS = { speakers: 20, sessions: 15, attendees: 1000, countries: 5 };

const MEDIA_CATEGORIES_AR = ["الكل", "المؤتمرات السابقة", "الورش الطبية", "الجولات الميدانية", "اللقطات التحضيرية"];
const MEDIA_CATEGORIES_EN = ["All", "Past Conferences", "Medical Workshops", "Field Tours", "Prep Shots"];

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

/* ─── Lightbox Component ─── */
function GalleryLightbox({ item, meta, onClose, onPrev, onNext, isRtl, isMobile, onLike, likes, views }) {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isVideo, setIsVideo] = useState(item?.type === "video");

  useEffect(() => {
    setZoom(1);
    setIsVideo(item?.type === "video");
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") isRtl ? onNext() : onPrev();
      if (e.key === "ArrowRight") isRtl ? onPrev() : onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [item]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: meta?.caption || "", url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = proxyImg(item?.src);
    a.download = meta?.caption || "media";
    a.click();
  };

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.93)",
        zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fade-in 0.2s ease",
        backdropFilter: "blur(8px)",
        flexDirection: "column",
        padding: isMobile ? "60px 12px 80px" : "60px 20px 80px",
      }}
    >
      {/* Top bar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "12px 16px" : "14px 24px",
          background: "linear-gradient(to bottom,rgba(0,0,0,0.8),transparent)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {meta?.tag && (
            <span style={{
              background: G, color: B, fontSize: 11, fontWeight: 900,
              padding: "3px 12px", borderRadius: 30,
            }}>{meta.tag}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isMobile && (
            <>
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                style={lbBtnStyle}
                title="Zoom Out"
              >🔍−</button>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, minWidth: 40, textAlign: "center" }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                style={lbBtnStyle}
                title="Zoom In"
              >🔍+</button>
            </>
          )}
          <button onClick={handleShare} style={lbBtnStyle} title="Share">
            {copied ? "✓" : "🔗"}
          </button>
          {!isVideo && (
            <button onClick={handleDownload} style={lbBtnStyle} title="Download">
              ⬇️
            </button>
          )}
          <button
            onClick={onClose}
            style={{ ...lbBtnStyle, background: R }}
          >✕</button>
        </div>
      </div>

      {/* Main media */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "90vw",
          maxHeight: "82vh",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {isVideo ? (
          <video
            src={item.src}
            controls autoPlay playsInline
            style={{
              maxWidth: "88vw", maxHeight: "78vh",
              borderRadius: 14, boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              border: `2px solid ${G}40`,
            }}
          />
        ) : (
          <img
            src={proxyImg(item.src)}
            alt={meta?.caption}
            style={{
              maxWidth: "88vw", maxHeight: "78vh",
              borderRadius: 14, boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              border: `2px solid ${G}40`,
              transform: `scale(${zoom})`,
              transition: "transform 0.3s ease",
              cursor: zoom > 1 ? "zoom-out" : "zoom-in",
              objectFit: "contain",
            }}
            onClick={() => setZoom(z => z > 1 ? 1 : 1.8)}
          />
        )}

        {/* Prev */}
        <button
          onClick={e => { e.stopPropagation(); isRtl ? onNext() : onPrev(); }}
          style={{
            position: "absolute", left: isMobile ? -40 : -60, top: "50%",
            transform: "translateY(-50%)",
            ...lbArrowStyle,
          }}
        >‹</button>

        {/* Next */}
        <button
          onClick={e => { e.stopPropagation(); isRtl ? onPrev() : onNext(); }}
          style={{
            position: "absolute", right: isMobile ? -40 : -60, top: "50%",
            transform: "translateY(-50%)",
            ...lbArrowStyle,
          }}
        >›</button>
      </div>

      {/* Bottom info bar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top,rgba(0,0,0,0.85),transparent)",
          padding: isMobile ? "20px 16px 20px" : "24px 28px 22px",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          gap: 14, flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
            {meta?.caption}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>👁 {views}</span>
            <button
              onClick={onLike}
              style={{
                border: "none", cursor: "pointer",
                fontSize: 13, color: "#f87171", fontWeight: 700,
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 20,
                background: "rgba(248,113,113,0.12)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}
            >
              ❤️ {likes}
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(meta?.caption || "");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={{
            ...lbBtnStyle,
            fontSize: 12, padding: "7px 14px",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          {copied ? "✓ " + (isRtl ? "تم النسخ" : "Copied") : "📋 " + (isRtl ? "نسخ النص" : "Copy Caption")}
        </button>
      </div>
    </div>
  );
}

const lbBtnStyle = {
  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 10, color: "#fff", cursor: "pointer",
  fontSize: 14, fontWeight: 700,
  padding: "7px 12px",
  transition: "background 0.2s",
  fontFamily: "'Cairo',sans-serif",
  backdropFilter: "blur(6px)",
};
const lbArrowStyle = {
  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "50%", color: "#fff", cursor: "pointer",
  fontSize: 26, fontWeight: 700,
  width: 44, height: 44,
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "background 0.2s, transform 0.2s",
  backdropFilter: "blur(6px)",
};

export default function Home() {
  const { lang } = useLang();
  const t = useMemo(() => TRANSLATIONS[lang] ?? TRANSLATIONS.ar, [lang]);
  const isRtl = lang === "ar";

  const [modal, setModal] = useState(null);
  const [counts, setCounts] = useState({ speakers: 0, sessions: 0, attendees: 0, countries: 0 });
  const [visible, setVisible] = useState({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [orgCardIndex, setOrgCardIndex] = useState(0);

  /* Gallery enhancements state */
  const [activeCategory, setActiveCategory] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [mediaLikes, setMediaLikes] = useState({});
  const [mediaViews, setMediaViews] = useState({});
  const [hoveredThumb, setHoveredThumb] = useState(null);
  const thumbStripRef = useRef(null);

  // ─── Timer ref للزيادة العشوائية (بدل interval) ───
  const autoIncrementTimer = useRef(null);

  const MEDIA_CATEGORIES = isRtl ? MEDIA_CATEGORIES_AR : MEDIA_CATEGORIES_EN;

  /* ─── زيادة عشوائية طبيعية بـ setTimeout متكرر (لا interval ثابت) ─── */
  useEffect(() => {
    if (!mediaItems.length) return;

    const scheduleNext = () => {
  const delay = 8000 + Math.random() * 7000;
  autoIncrementTimer.current = setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * mediaItems.length);
 
    setMediaViews(prevViews => {
      // بيزيد فوق أي قيمة موجودة — لو ما في قيمة بعد، بيستنى ما يزيد
      const current = prevViews[randomIndex];
      if (current === undefined) return prevViews; // ← لسا ما اتحمل من API
      const nextViews = { ...prevViews, [randomIndex]: current + 1 };
 
      if (Math.random() < 0.35) {
        setMediaLikes(prevLikes => {
          const currentLike = prevLikes[randomIndex];
          if (currentLike === undefined) return prevLikes;
          const nextLikes = { ...prevLikes, [randomIndex]: currentLike + 1 };
          saveStats(nextLikes, nextViews);
          return nextLikes;
        });
      } else {
        setMediaLikes(likes => { saveStats(likes, nextViews); return likes; });
      }
 
      return nextViews;
    });
 
    scheduleNext();
  }, delay);
};

    scheduleNext();
    return () => clearTimeout(autoIncrementTimer.current);
  }, [mediaItems]);

  const filteredMedia = useMemo(
    () =>
      activeCategory === 0
        ? mediaItems
        : mediaItems.filter((m) => Number(m.category) === activeCategory),
    [mediaItems, activeCategory],
  );

  const getMeta = useCallback(
    (item, idx) => ({
      caption:
        (isRtl ? item?.captionAr : item?.captionEn || item?.captionAr) ||
        t.mediaCaptions?.[idx]?.caption ||
        "",
      tag:
        (isRtl ? item?.tag : item?.tagEn || item?.tag) ||
        t.mediaCaptions?.[idx]?.tag ||
        "",
    }),
    [isRtl, t],
  );

  useEffect(() => { setActiveSlide(0); }, [activeCategory]);

  useEffect(() => {
    if (activeSlide >= filteredMedia.length && filteredMedia.length > 0) setActiveSlide(0);
  }, [filteredMedia.length]);

  /* ─── تهيئة الإعجابات والمشاهدات ─── */
  useEffect(() => {
  if (!mediaItems.length) return;
 
  fetch("/api/gallery/stats")
    .then(r => r.json())
    .then(data => {
      // إذا في أرقام محفوظة → استخدمها
      // إذا مفيش (أول مرة) → ولّد أرقام أولية وارفعها
      const savedLikes = data.likes || {};
      const savedViews = data.views || {};
 
      const initLikes = {};
      const initViews = {};
      let needsSave = false;
 
      mediaItems.forEach((_, i) => {
        const k = String(i);
        if (savedLikes[k] !== undefined) {
          initLikes[i] = savedLikes[k];
        } else {
          initLikes[i] = Math.floor(Math.random() * 30) + 5;
          needsSave = true;
        }
        if (savedViews[k] !== undefined) {
          initViews[i] = savedViews[k];
        } else {
          initViews[i] = Math.floor(Math.random() * 200) + 50;
          needsSave = true;
        }
      });
 
      setMediaLikes(initLikes);
      setMediaViews(initViews);
 
      // احفظ الأرقام الأولية إذا كانت أول مرة
      if (needsSave) saveStats(initLikes, initViews);
    })
    .catch(() => {
      // إذا فشل الـ API → ولّد أرقام محلية
      const initLikes = {};
      const initViews = {};
      mediaItems.forEach((_, i) => {
        initLikes[i] = Math.floor(Math.random() * 30) + 5;
        initViews[i] = Math.floor(Math.random() * 200) + 50;
      });
      setMediaLikes(initLikes);
      setMediaViews(initViews);
    });
}, [mediaItems]);

  /* ─── زيادة المشاهدة عند تغيير الـ slide يدوياً ─── */
 useEffect(() => {
  if (filteredMedia[activeSlide]) {
    const realIdx = mediaItems.indexOf(filteredMedia[activeSlide]);
    setMediaViews(prev => {
      const next = { ...prev, [realIdx]: (prev[realIdx] || 0) + 1 };
      // احفظ بعد كل مشاهدة (مع debounce)
      setMediaLikes(likes => { saveStats(likes, next); return likes; });
      return next;
    });
  }
}, [activeSlide]);

  /* ─── Auto-scroll thumbnail strip ─── */
  useEffect(() => {
    if (thumbStripRef.current) {
      const strip = thumbStripRef.current;
      const thumbW = 88 + 8;
      strip.scrollTo({ left: activeSlide * thumbW - strip.clientWidth / 2 + thumbW / 2, behavior: "smooth" });
    }
  }, [activeSlide]);

const handleLike = useCallback((realIdx) => {
  setMediaLikes(prev => {
    const next = { ...prev, [realIdx]: (prev[realIdx] || 0) + 1 };
    // احفظ بعد كل إعجاب (مع debounce)
    setMediaViews(views => { saveStats(next, views); return views; });
    return next;
  });
}, []);

  const openLightbox = useCallback((slideIdx) => {
    setLightboxIndex(slideIdx);
    const item = filteredMedia[slideIdx];
    const realIdx = mediaItems.indexOf(item);
    setMediaViews(prev => ({ ...prev, [realIdx]: (prev[realIdx] || 0) + 1 }));
  }, [filteredMedia, mediaItems]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const lightboxPrev = useCallback(() => {
    if (!filteredMedia.length) return;
    setLightboxIndex(i => (i - 1 + filteredMedia.length) % filteredMedia.length);
  }, [filteredMedia.length]);
  const lightboxNext = useCallback(() => {
    if (!filteredMedia.length) return;
    setLightboxIndex(i => (i + 1) % filteredMedia.length);
  }, [filteredMedia.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrgCardIndex((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/gallery/media", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMediaItems(Array.isArray(d.items) ? d.items : []))
      .catch(() => setMediaItems(MEDIA_ITEMS_FALLBACK))
      .finally(() => setMediaLoaded(true));
  }, []);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        const published = data.items?.filter((item) => item.published !== false) || [];
        setNewsItems(published);
        setNewsLoading(false);
      })
      .catch(() => { setNewsLoading(false); });
  }, []);

  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredLeader, setHoveredLeader] = useState(null);
  const [hoveredCommittee, setHoveredCommittee] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  const statsRef = useRef(null);
  const animated = useRef(false);
  const sliderRef = useRef(null);
  // ─── لا autoPlay ref هنا — الانتقال التلقائي موقوف ───

  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const NAV_H = isMobile ? 64 : isTablet ? 90 : 130;
  const STICKY_TOP = NAV_H + 42 + 8; // 42px = FullWidthNewsTicker height

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !animated.current) {
          animated.current = true;
          const dur = 1800, t0 = performance.now();
          const step = (now) => {
            const p = Math.min((now - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
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
      setVisible((p) => ({ ...p, hero: true, stats: true, gallery: true, features: true }));
      const els = document.querySelectorAll("[data-reveal]");
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting)
            setVisible((p) => ({ ...p, [e.target.getAttribute("data-reveal")]: true }));
        }),
        { threshold: 0.1 },
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 100);
    return () => clearTimeout(tm);
  }, [lang]);

  // ─── لا autoPlay useEffect — الانتقال التلقائي موقوف تماماً ───

  /* ─── goTo: بدون إعادة تشغيل autoplay ─── */
  const goTo = (idx) => {
    if (!filteredMedia.length) return;
    setActiveSlide((idx + filteredMedia.length) % filteredMedia.length);
  };

  const swipeVelocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);

  const onDragStart = (x) => {
    setIsDragging(true);
    setDragStart(x);
    setDragDelta(0);
    swipeVelocity.current = 0;
    lastX.current = x;
    lastTime.current = Date.now();
  };
  const onDragMove = (x) => {
    if (!isDragging) return;
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) swipeVelocity.current = (x - lastX.current) / dt;
    lastX.current = x;
    lastTime.current = now;
    setDragDelta(x - dragStart);
  };
  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 40;
    const velocityThreshold = 0.3;
    if (dragDelta < -threshold || swipeVelocity.current < -velocityThreshold) goTo(activeSlide + 1);
    else if (dragDelta > threshold || swipeVelocity.current > velocityThreshold) goTo(activeSlide - 1);
    setDragDelta(0);
  };

  const rev = (id, delay = 0) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const slideTranslate = `translateX(calc(${isRtl ? "+" : "-"}${activeSlide * 100}% + ${isRtl ? -dragDelta : dragDelta}px))`;

  const statVals = [
    counts.speakers === TARGETS.speakers ? `${TARGETS.speakers}+` : String(counts.speakers),
    counts.sessions === TARGETS.sessions ? `${TARGETS.sessions}+` : String(counts.sessions),
    counts.attendees === TARGETS.attendees ? "1K+" : String(counts.attendees),
    counts.countries === TARGETS.countries ? `${TARGETS.countries}+` : String(counts.countries),
  ];

  const orgCards = useMemo(() => getOrgCards(isRtl), [isRtl]);

  const sidebarRightContent = useMemo(
    () => (
      <>
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
            <div style={{
              background: "#fff", borderRadius: 22, overflow: "hidden",
              boxShadow: active.ring, transition: "box-shadow 0.5s ease",
              border: `1px solid ${GRAY}`,
            }}>
              <div style={{
                position: "relative", padding: "14px 16px 13px",
                background: `linear-gradient(135deg,${NAVY}06,${G}0a)`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                  <div style={{
                    position: "absolute", inset: -6, borderRadius: 16,
                    border: `1.5px solid ${G}`,
                    animation: "icon-pulse-ring 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
                    pointerEvents: "none",
                  }} />
                  <div style={{
                    position: "relative", width: 40, height: 40, borderRadius: 12,
                    background: `linear-gradient(135deg,${NAVY},#1a3050)`,
                    border: `1px solid ${G}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "glow-gold 3s ease-in-out infinite",
                  }}>
                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: G, fill: "none", strokeWidth: 1.6 }}>
                      <path d="M4 21V6a1 1 0 011-1h6a1 1 0 011 1v15M13 21V10a1 1 0 011-1h5a1 1 0 011 1v11" strokeLinejoin="round" />
                      <path d="M7 8h1M7 11h1M7 14h1M10 8h1M10 11h1M10 14h1M16 12h1M16 15h1M16 18h1" strokeLinecap="round" />
                      <path d="M2 21h20" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: NAVY, letterSpacing: "0.4px" }}>
                  {t.supportingOrg}
                </span>
                <div style={{
                  position: "absolute", bottom: 0, left: "5%", right: "5%", height: 1,
                  background: `linear-gradient(90deg,transparent,${G}70,transparent)`,
                }} />
              </div>

              <div style={{
                position: "relative", padding: "6px 18px 18px",
                background: `radial-gradient(circle at 50% 0%, ${NAVY}05, ${GRAY_LIGHT})`,
                textAlign: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ width: 50, height: 1, background: `linear-gradient(90deg,transparent,${G}80)` }} />
                  <span style={{ color: G, fontSize: 20 }}>✦</span>
                  <span style={{ width: 50, height: 1, background: `linear-gradient(270deg,transparent,${G}80)` }} />
                </div>
                <div key={`frame-${orgCardIndex}`} style={{
                  width: 250, height: 200, margin: "0 auto 14px",
                  borderRadius: 20, padding: 3,
                  background: active.frameBorder,
                  boxShadow: "0 10px 26px rgba(0,0,0,0.14)",
                  animation: "fade-in 0.5s ease",
                }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: 17,
                    background: "#FFFCF4", border: `1px solid ${G}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", padding: 3,
                  }}>
                    <img
                      src={orgCards[orgCardIndex]}
                      alt={active.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const p = e.currentTarget.parentElement;
                        if (p) p.innerHTML = `<div style="font-size:15px;font-weight:900;color:${NAVY};">UK-MED</div>`;
                      }}
                    />
                  </div>
                </div>
                <div key={`badge-${orgCardIndex}`} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 16px", borderRadius: 30,
                  background: active.badgeBg,
                  boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
                  animation: "fade-in 0.5s ease",
                }}>
                  <span style={{ width: 8, height: 8, background: active.badgeText, opacity: 0.75, transform: "rotate(45deg)" }} />
                  <span style={{ fontSize: 11, fontWeight: 900, color: active.badgeText, letterSpacing: "0.4px" }}>
                    {active.label}
                  </span>
                </div>
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4,
                padding: "14px 10px", background: "#fff",
                borderTop: `1px solid ${GRAY}`,
              }}>
                {BENEFITS.map((b, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, textAlign: "center" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      border: `1.4px solid ${G}55`, background: `${G}0a`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <IconGlyph type={b.icon} color={G} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: SLATE, lineHeight: 1.3 }}>
                      {isRtl ? b.ar : b.en}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                background: `linear-gradient(135deg,${NAVY},#152840)`,
                padding: "10px 14px", textAlign: "center", position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg,transparent,${G},transparent)`,
                }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: GOLD_LIGHT, letterSpacing: "0.3px" }}>
                  {t.conferenceTitle}
                </div>
              </div>
            </div>
          );
        })()}

        {/* COMMITTEES */}
        <div style={{
          background: "#fff", borderRadius: 16, border: `1px solid ${G}28`,
          overflow: "hidden", boxShadow: "0 3px 14px rgba(27,54,93,0.07)", marginTop: 16,
        }}>
          <div style={{
            padding: "12px 16px",
            background: `linear-gradient(135deg,${B}06,${G}08)`,
            borderBottom: `1px solid ${B}0c`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>🏛️</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: B }}>{t.committeesTitle}</span>
          </div>
          {t.committees?.map((c, i) => (
            <button
              key={i}
              onClick={() => setModal({ type: "committee", data: c })}
              onMouseEnter={() => setHoveredCommittee(i)}
              onMouseLeave={() => setHoveredCommittee(null)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "13px 16px",
                background: hoveredCommittee === i ? `linear-gradient(135deg,${G}08,${B}04)` : "#fff",
                border: "none",
                borderBottom: i < t.committees.length - 1 ? `1px solid ${B}07` : "none",
                cursor: "pointer", fontFamily: "'Cairo',sans-serif",
                color: B, textAlign: isRtl ? "right" : "left",
                transition: "background 0.25s, transform 0.22s",
                transform: hoveredCommittee === i ? (isRtl ? "translateX(-3px)" : "translateX(3px)") : "translateX(0)",
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: hoveredCommittee === i ? `linear-gradient(135deg,${G}25,${B}20)` : `linear-gradient(135deg,${B}08,${G}12)`,
                border: `1px solid ${G}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
                transition: "transform 0.25s",
                transform: hoveredCommittee === i ? "rotate(8deg) scale(1.1)" : "rotate(0) scale(1)",
              }}>
                {c.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 800, color: B,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{c.name}</div>
                <div style={{
                  fontSize: 11, color: "#94a3b8", marginTop: 2,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{c.members?.[0]}</div>
              </div>
              <span style={{
                color: hoveredCommittee === i ? G : "#cbd5e1",
                fontSize: 14, flexShrink: 0, transition: "color 0.2s",
              }}>
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

        <div style={{
          background: `linear-gradient(160deg,#FAFBFD,#F2F6FB,#EBF0F8)`,
          borderRadius: 18, overflow: "hidden",
          boxShadow: `0 4px 24px rgba(27,54,93,0.1),0 0 0 1px ${G}35`,
          border: `1px solid ${G}30`, position: "relative",
        }}>
          <div style={{
            height: 5,
            background: `linear-gradient(90deg,${R},${G},${R})`,
            backgroundSize: "200% 100%",
            animation: "shimmer-border 2.5s linear infinite",
          }} />
          <div style={{ padding: "20px 18px", textAlign: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: `linear-gradient(135deg,${G},#b8941f)`,
              color: "#1a1000", fontSize: 11, fontWeight: 900,
              padding: "4px 16px", borderRadius: 30, marginBottom: 14, letterSpacing: "1px",
            }}>
              {t.edition}
            </div>
            <div style={{ marginBottom: 8, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
              {t.registerNowSub}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/participation" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px",
                background: `linear-gradient(135deg,${R},#a80d24)`,
                color: "#fff", borderRadius: 11,
                fontFamily: "'Cairo',sans-serif", fontSize: 14, fontWeight: 800,
                textDecoration: "none",
                boxShadow: `0 4px 14px ${R}40`,
                transition: "transform 0.22s, box-shadow 0.22s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.boxShadow = `0 8px 22px ${R}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 14px ${R}40`; }}
              >
                🎫 {t.btnReg}
              </Link>
              <Link href="/program" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px", background: "#fff", color: B, borderRadius: 11,
                fontFamily: "'Cairo',sans-serif", fontSize: 13.5, fontWeight: 700,
                textDecoration: "none", border: `1.5px solid ${B}25`,
                transition: "transform 0.22s, border-color 0.22s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = G; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = `${B}25`; }}
              >
                🎓 {t.btnProg}
              </Link>
            </div>
          </div>
        </div>

        <NewsTicker
          newsItems={newsItems}
          newsLoading={newsLoading}
          t={t}
          isRtl={isRtl}
          onClickItem={(item) => setModal({ type: "news", data: item })}
        />

        <div style={{
          background: "#fff", borderRadius: 16,
          border: `1px solid ${B}12`, overflow: "hidden",
          boxShadow: "0 3px 14px rgba(27,54,93,0.07)",
        }}>
          <div style={{
            padding: "12px 16px",
            background: `linear-gradient(135deg,${B}06,${G}06)`,
            borderBottom: `1px solid ${B}0c`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 17 }}>🔗</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: B }}>{t.quickLinks}</span>
          </div>
          {t.quickLinksItems.map((link, i) => (
            <Link key={i} href={link.href}
              onMouseEnter={() => setHoveredLink(i)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderBottom: i < 3 ? `1px solid ${B}07` : "none",
                textDecoration: "none",
                background: hoveredLink === i ? `${B}05` : "#fff",
                color: B, transition: "background 0.22s, transform 0.22s",
                transform: hoveredLink === i ? (isRtl ? "translateX(-4px)" : "translateX(4px)") : "translateX(0)",
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: hoveredLink === i ? `${G}20` : `${B}08`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, flexShrink: 0,
                transition: "background 0.22s, transform 0.25s",
                transform: hoveredLink === i ? "rotate(-8deg) scale(1.1)" : "",
              }}>
                {link.icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{link.label}</span>
              <span style={{
                marginLeft: "auto", fontSize: 13,
                color: hoveredLink === i ? G : "#cbd5e1",
                transition: "color 0.2s",
              }}>
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
    <div style={{
      direction: t.dir, fontFamily: "'Cairo',sans-serif",
      background: "#F0F4F9", minHeight: "100vh", position: "relative",
    }}>
      <ParticlesBackground />

      {/* MAIN LAYOUT */}
      <div className="main-layout" style={{
        maxWidth: isMobile || isTablet ? "100%" : 1560,
        margin: "0 auto",
        padding: isMobile ? "14px 12px 0" : isTablet ? "16px 14px 0" : "22px 18px 0",
        position: "relative", zIndex: 1, width: "100%", boxSizing: "border-box",
      }}>

        {/* RIGHT SIDEBAR */}
        {!isMobile && !isTablet && (
          <aside className="sidebar-r gold-glow-card" style={{
            position: "sticky", top: STICKY_TOP, borderRadius: 18,
            animation: "slide-in-right 0.7s cubic-bezier(0.22,1,0.36,1) both",
          }}>
            {sidebarRightContent}
          </aside>
        )}

        {/* CENTER */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {(isMobile || isTablet) && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
              {sidebarRightContent}
            </div>
          )}

          {/* HERO */}
          <div style={{
            ...rev("hero", 0),
            borderRadius: isMobile ? 14 : 22, overflow: "hidden",
            marginBottom: isMobile ? 14 : 22,
            boxShadow: `0 0 0 3px ${G}50,0 12px 40px rgba(27,54,93,0.15)`,
            position: "relative",
            animation: visible["hero"] ? "hero-fade 1s cubic-bezier(0.22,1,0.36,1) both" : "none",
          }}>
            <img src="/hero-banner.png" alt={isRtl ? "شعار المؤتمر" : "Conference Banner"} style={{
              width: "100%", display: "block", objectFit: "cover", objectPosition: "center top",
              minHeight: isMobile ? 180 : 260, maxHeight: isMobile ? 220 : isTablet ? 300 : 360,
            }} onError={(e) => {
              e.currentTarget.style.display = "none";
              const p = e.currentTarget.parentElement;
              p.style.cssText += `background:linear-gradient(135deg,${G}18,#EBF0F8);min-height:${isMobile ? 180 : 280}px;display:flex;align-items:center;justify-content:center;`;
              const d = document.createElement("div");
              d.style.cssText = "text-align:center;padding:40px;";
              d.innerHTML = `<div style="font-size:60px;margin-bottom:14px">🏥</div><div style="font-size:17px;font-weight:900;color:${B}">${t.conferenceTitle}</div>`;
              p.appendChild(d);
            }} />
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 5,
              background: `linear-gradient(90deg,${R},${G},${R})`,
              backgroundSize: "200% 100%", animation: "shimmer-border 2.5s linear infinite",
            }} />
          </div>

          {/* ══════════════ GALLERY ══════════════ */}
          {mediaLoaded && mediaItems.length > 0 && (
            <div data-reveal="gallery" style={{
              ...rev("gallery", 0.05),
              background: "#fff", borderRadius: isMobile ? 14 : 22,
              overflow: "hidden", marginBottom: isMobile ? 14 : 32,
              boxShadow: "0 4px 24px rgba(27,54,93,0.09)",
              border: `1px solid ${G}30`,
            }}>

              {/* Gallery Header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: isMobile ? "10px 14px" : "14px 20px",
                borderBottom: `1px solid ${B}0c`,
                background: "#FAFBFD", flexWrap: "wrap", gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: isMobile ? 32 : 38, height: isMobile ? 32 : 38,
                    borderRadius: 10, background: `${G}15`, border: `1px solid ${G}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isMobile ? 16 : 18,
                  }}>🎞️</div>
                  <div>
                    <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 900, color: B }}>
                      {t.galleryTitle}
                    </div>
                    {!isMobile && (
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{t.gallerySub}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => setVideoOpen(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: isMobile ? "5px 12px" : "7px 16px",
                      background: `linear-gradient(135deg,${R},#a80d24)`,
                      border: "none", borderRadius: 20, cursor: "pointer",
                      fontFamily: "'Cairo',sans-serif",
                      fontSize: isMobile ? 11 : 12.5, fontWeight: 800, color: "#fff",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; e.currentTarget.style.boxShadow = `0 6px 18px ${R}50`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    ▶ {t.videoLabel}
                  </button>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: "#9A7A10",
                    background: `${G}15`, border: `1px solid ${G}30`,
                    padding: "4px 12px", borderRadius: 20, direction: "ltr",
                  }}>
                    {filteredMedia.length ? activeSlide + 1 : 0}/{filteredMedia.length}
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: isMobile ? "10px 12px 8px" : "12px 18px 10px",
                overflowX: "auto", scrollbarWidth: "none",
                background: "linear-gradient(to bottom,#FAFBFD,#fff)",
                borderBottom: `1px solid ${B}08`,
              }}>
                {MEDIA_CATEGORIES.map((cat, ci) => {
                  const isActive = activeCategory === ci;
                  return (
                    <button
                      key={ci}
                      onClick={() => setActiveCategory(ci)}
                      style={{
                        flexShrink: 0,
                        padding: isMobile ? "5px 12px" : "6px 16px",
                        borderRadius: 30,
                        border: isActive ? "none" : `1px solid ${B}18`,
                        background: isActive ? `linear-gradient(135deg,${B},#2a4a7a)` : "#fff",
                        color: isActive ? "#fff" : "#64748b",
                        fontSize: isMobile ? 11 : 12,
                        fontWeight: isActive ? 800 : 600,
                        cursor: "pointer",
                        fontFamily: "'Cairo',sans-serif",
                        transition: "all 0.22s",
                        boxShadow: isActive ? `0 4px 12px ${B}30` : "none",
                        transform: isActive ? "translateY(-1px)" : "none",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = `${B}08`; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "#fff"; }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Empty state */}
              {filteredMedia.length === 0 && (
                <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8", fontWeight: 700 }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🖼️</div>
                  {isRtl ? "لا توجد عناصر في هذا القسم" : "No items in this category"}
                </div>
              )}

              {/* ══════════════ SLIDER — نسبة 1:1 مع إصلاح الموبايل ══════════════ */}
              {filteredMedia.length > 0 && (
                <div
                  ref={sliderRef}
                  style={{
                    position: "relative",
                    /* ─── نسبة 1:1 ─── */
                    width: "100%",
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    userSelect: "none",
                    background: "#000",
                  }}
                  onMouseDown={e => onDragStart(e.clientX)}
                  onMouseMove={e => onDragMove(e.clientX)}
                  onMouseUp={onDragEnd}
                  onMouseLeave={onDragEnd}
                  onTouchStart={e => onDragStart(e.touches[0].clientX)}
                  onTouchMove={e => { e.preventDefault(); onDragMove(e.touches[0].clientX); }}
                  onTouchEnd={onDragEnd}
                >
                  {/* ─── Track: flex row، كل slide يأخذ 100% من العرض والارتفاع ─── */}
                  <div
                    className={`slide-track${isDragging ? " drag" : ""}`}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                      height: "100%",
                      transform: slideTranslate,
                      transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
                      willChange: "transform",
                    }}
                  >
                    {filteredMedia.map((item, i) => {
                      const realIdx = mediaItems.indexOf(item);
                      const meta = getMeta(item, realIdx);
                      const isVideoItem = item.type === "video";
                      return (
                        /* ─── كل slide: عرض ثابت 100% من الـ container، ارتفاع 100% ─── */
                        <div
                          key={item.id ?? i}
                          style={{
                            minWidth: "100%",
                            width: "100%",
                            height: "100%",
                            flexShrink: 0,
                            position: "relative",
                            background: "#000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {isVideoItem ? (
                            <div style={{ width: "100%", height: "100%", position: "relative", background: "#000" }}>
                              <video
                                src={item.src}
                                autoPlay
                                playsInline
                                controls
                                preload="auto"
                                ref={(videoEl) => {
                                  if (videoEl) {
                                    videoEl.play().catch(() => {
                                      videoEl.muted = true;
                                      videoEl.play();
                                    });
                                  }
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                onEnded={() => goTo(activeSlide + 1)}
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); openLightbox(i); }}
                                style={{
                                  position: "absolute",
                                  top: 12,
                                  [isRtl ? "left" : "right"]: 12,
                                  background: "rgba(0,0,0,0.7)",
                                  color: "#fff",
                                  border: `1.5px solid ${G}`,
                                  borderRadius: 20,
                                  padding: "6px 14px",
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  zIndex: 5,
                                  backdropFilter: "blur(4px)",
                                  fontFamily: "'Cairo',sans-serif",
                                }}
                              >
                                <span>🔍</span> {isRtl ? "تكبير / صوت كامل" : "Full View"}
                              </button>
                            </div>
                          ) : (
                            <div style={{
                              position: "relative",
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              background: "#000",
                            }}>
                              {/* Blurred background */}
                              <img
                                src={proxyImg(item.src)}
                                alt=""
                                aria-hidden
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  filter: "blur(18px) brightness(0.4) saturate(1.2)",
                                  transform: "scale(1.05)",
                                  pointerEvents: "none",
                                  userSelect: "none",
                                }}
                              />
                              {/* Actual image — contain داخل الـ 1:1 */}
                              <img
                                src={proxyImg(item.src)}
                                alt={meta.caption}
                                draggable={false}
                                onClick={() => openLightbox(i)}
                                style={{
                                  position: "relative",
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  width: "auto",
                                  height: "auto",
                                  objectFit: "contain",
                                  display: "block",
                                  cursor: "zoom-in",
                                  zIndex: 1,
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const p = e.currentTarget.parentElement;
                                  const d = document.createElement("div");
                                  d.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:2;";
                                  d.innerHTML = `<span style="font-size:48px">🏥</span><span style="color:#fff;font-size:15px;font-weight:700;">${meta.caption}</span>`;
                                  p.appendChild(d);
                                }}
                              />
                            </div>
                          )}

                          {/* Gradient overlay */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(to bottom,transparent 50%,rgba(27,54,93,0.6))",
                            pointerEvents: "none",
                            zIndex: 2,
                          }} />

                          {/* Tag */}
                          {meta.tag && (
                            <div style={{
                              position: "absolute", top: 12,
                              [isRtl ? "right" : "left"]: 12,
                              background: G, color: B,
                              fontSize: 11, fontWeight: 900,
                              padding: "4px 12px", borderRadius: 30,
                              zIndex: 3,
                            }}>
                              {meta.tag}
                            </div>
                          )}

                          {/* Video badge */}
                          {isVideoItem && (
                            <div style={{
                              position: "absolute", top: 12,
                              [isRtl ? "left" : "right"]: 12,
                              background: R, color: "#fff",
                              fontSize: 10, fontWeight: 900,
                              padding: "3px 10px", borderRadius: 30,
                              display: "flex", alignItems: "center", gap: 4,
                              zIndex: 3,
                            }}>
                              🎬 {isRtl ? "فيديو" : "Video"}
                            </div>
                          )}

                          {/* Bottom caption + actions */}
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0,
                            padding: isMobile ? "20px 16px 12px" : "32px 26px 18px",
                            animation: i === activeSlide ? "slide-caption 0.55s cubic-bezier(0.22,1,0.36,1) both" : "none",
                            zIndex: 3,
                          }}>
                            <div style={{
                              fontSize: isMobile ? 13 : 16, fontWeight: 800, color: "#fff",
                              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                            }}>
                              {meta.caption}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                              {/* Dots */}
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {filteredMedia.map((_, di) => (
                                  <button
                                    key={di}
                                    onClick={() => goTo(di)}
                                    style={{
                                      width: di === activeSlide ? 18 : 6,
                                      height: 6,
                                      borderRadius: 4,
                                      background: di === activeSlide ? G : "rgba(255,255,255,0.4)",
                                      border: "none",
                                      cursor: "pointer",
                                      transition: "all .35s",
                                      padding: 0,
                                    }}
                                  />
                                ))}
                              </div>

                              {i === activeSlide && (
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                                    👁 {mediaViews[realIdx] || 0}
                                  </span>
                                  <button
                                    onClick={e => { e.stopPropagation(); handleLike(realIdx); }}
                                    style={{
                                      background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
                                      borderRadius: 20, color: "#fff", cursor: "pointer",
                                      fontSize: 11, fontWeight: 700, padding: "3px 10px",
                                      display: "flex", alignItems: "center", gap: 4,
                                      fontFamily: "'Cairo',sans-serif",
                                      transition: "transform 0.2s, background 0.2s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.4)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                                  >
                                    ❤️ {mediaLikes[realIdx] || 0}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Arrow buttons */}
                  {[
                    { s: "left", d: isRtl ? +1 : -1, c: "‹" },
                    { s: "right", d: isRtl ? -1 : +1, c: "›" },
                  ].map((btn) => (
                    <button key={btn.s} className="slider-arrow"
                      onClick={() => goTo(activeSlide + btn.d)}
                      style={{ [btn.s]: isMobile ? 8 : 16, width: isMobile ? 36 : 48, height: isMobile ? 36 : 48, fontSize: isMobile ? 20 : 24 }}
                    >
                      {btn.c}
                    </button>
                  ))}

                  {/* لا progress bar لأن الانتقال التلقائي موقوف */}
                </div>
              )}

              {/* Thumbnail Strip */}
              {!isMobile && filteredMedia.length > 0 && (
                <div
                  ref={thumbStripRef}
                  style={{
                    display: "flex", gap: 8,
                    padding: "12px 16px",
                    overflowX: "auto", background: "#F4F6FA",
                    scrollbarWidth: "thin",
                    scrollbarColor: `${G}50 transparent`,
                    borderTop: `1px solid ${B}08`,
                    scrollBehavior: "smooth",
                  }}
                >
                  {filteredMedia.map((item, i) => {
                    const realIdx = mediaItems.indexOf(item);
                    const meta = getMeta(item, realIdx);
                    const isActive = i === activeSlide;
                    const isHovered = hoveredThumb === i;
                    return (
                      <div
                        key={item.id ?? i}
                        className={`thumb-item${isActive ? " active" : ""}`}
                        onClick={() => goTo(i)}
                        onMouseEnter={() => setHoveredThumb(i)}
                        onMouseLeave={() => setHoveredThumb(null)}
                        style={{
                          position: "relative",
                          width: 88, height: 60, flexShrink: 0,
                          borderRadius: 10, overflow: "hidden",
                          cursor: "pointer",
                          border: isActive
                            ? `2.5px solid ${G}`
                            : isHovered
                              ? `2px solid ${B}50`
                              : "2px solid transparent",
                          boxShadow: isActive
                            ? `0 4px 16px ${G}50`
                            : isHovered
                              ? "0 4px 12px rgba(0,0,0,0.2)"
                              : "0 2px 6px rgba(0,0,0,0.1)",
                          transform: isActive ? "scale(1.08)" : isHovered ? "scale(1.04)" : "scale(1)",
                          transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
                          opacity: isActive ? 1 : isHovered ? 0.9 : 0.7,
                          background: "#1B365D",
                        }}
                      >
                        {(item.type !== "video" || item.thumbnail) && (
                          <img
                            src={proxyImg(item.type === "video" ? item.thumbnail : item.src)}
                            alt={meta.caption || ""}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                            onError={e => { e.currentTarget.style.display = "none"; }}
                          />
                        )}
                        {item.type === "video" && (
                          <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(0,0,0,0.3)",
                          }}>
                            <span style={{ fontSize: 18, color: "#fff" }}>▶</span>
                          </div>
                        )}
                        {(mediaLikes[realIdx] || 0) > 0 && (
                          <div style={{
                            position: "absolute", bottom: 3, right: 3,
                            background: "rgba(0,0,0,0.6)", borderRadius: 8,
                            fontSize: 8, color: "#fff", padding: "1px 5px", fontWeight: 700,
                          }}>
                            ❤ {mediaLikes[realIdx]}
                          </div>
                        )}
                        {isActive && (
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: G }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ FEATURE CARDS ══════════════ */}
          {(() => {
            const NAVY = "#001B2A";
            const GOLD = "#D4AF37";
            const GOLD_L = "#F4D79B";
            const SLATE = "#2C3E50";
            const FEATURES = [
              {
                icon: "globe",
                ar: "خبرة عالمية",
                en: "Global Expertise",
                subAr: "متحدثون من أكثر من 5 دول",
                subEn: "Speakers from 5+ countries",
              },
              {
                icon: "handshake",
                ar: "شراكة طبية",
                en: "Medical Partnership",
                subAr: "شراكات مؤسسية دولية",
                subEn: "International institutional partnerships",
              },
              {
                icon: "medal",
                ar: "معايير عالية",
                en: "High Standards",
                subAr: "مراجعة علمية محكّمة",
                subEn: "Peer-reviewed scientific standards",
              },
              {
                icon: "microscope",
                ar: "خبرة علمية",
                en: "Scientific Excellence",
                subAr: "15+ جلسة علمية متخصصة",
                subEn: "15+ specialized scientific sessions",
              },
            ];
            return (
              <div
                data-reveal="features"
                style={{
                  ...rev("features", 0.08),
                  display: "grid",
                  gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
                  gap: isMobile ? 10 : 14,
                  marginBottom: isMobile ? 14 : 24,
                }}
              >
                {FEATURES.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      borderRadius: isMobile ? 12 : 16,
                      border: `1px solid ${GOLD}30`,
                      padding: isMobile ? "16px 12px" : "22px 18px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: isMobile ? 8 : 10,
                      boxShadow: "0 3px 14px rgba(0,27,42,0.07)",
                      transition: "transform 0.26s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.26s, border-color 0.26s",
                      cursor: "default",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-6px) scale(1.03)";
                      e.currentTarget.style.boxShadow = `0 14px 34px ${GOLD}28, 0 0 0 1.5px ${GOLD}50`;
                      e.currentTarget.style.borderColor = `${GOLD}60`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.boxShadow = "0 3px 14px rgba(0,27,42,0.07)";
                      e.currentTarget.style.borderColor = `${GOLD}30`;
                    }}
                  >
                    {/* Gold accent top line */}
                    <div style={{
                      position: "relative",
                      width: isMobile ? 40 : 50,
                      height: isMobile ? 40 : 50,
                      borderRadius: "50%",
                      border: `1.5px solid ${GOLD}45`,
                      background: `radial-gradient(circle at 35% 35%, ${GOLD}18, ${GOLD}06)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <IconGlyph type={f.icon} color={GOLD} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: isMobile ? 12 : 14,
                        fontWeight: 900,
                        color: NAVY,
                        marginBottom: 3,
                        lineHeight: 1.3,
                      }}>
                        {isRtl ? f.ar : f.en}
                      </div>
                      {!isMobile && (
                        <div style={{
                          fontSize: 11,
                          color: "#64748b",
                          fontWeight: 600,
                          lineHeight: 1.4,
                        }}>
                          {isRtl ? f.subAr : f.subEn}
                        </div>
                      )}
                    </div>
                    <div style={{
                      width: "30px",
                      height: "2px",
                      borderRadius: "2px",
                      background: `linear-gradient(90deg, ${GOLD}, ${GOLD_L})`,
                    }} />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ══════════════ STATS — relocated below feature cards ══════════════ */}
          <div ref={statsRef} data-reveal="stats" style={{
            ...rev("stats", 0.1),
            background: "#fff",
            borderRadius: isMobile ? 14 : 20,
            border: `1px solid ${G}22`,
            boxShadow: "0 4px 20px rgba(27,54,93,0.07)",
            overflow: "hidden",
            marginBottom: isMobile ? 14 : 28,
          }}>
            {/* Section header */}
            <div style={{
              padding: isMobile ? "12px 16px" : "16px 24px",
              background: `linear-gradient(135deg, ${B}06, ${G}08)`,
              borderBottom: `1px solid ${B}0c`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `${G}15`, border: `1px solid ${G}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>📊</div>
              <div>
                <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 900, color: B }}>
                  {isRtl ? "نبذة عن المؤتمر" : "Conference Overview"}
                </div>
                {!isMobile && (
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {isRtl ? "أرقام وإحصائيات المؤتمر الثاني عشر" : "12th Conference key statistics"}
                  </div>
                )}
              </div>
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4,1fr)",
              gap: 0,
            }}>
              {STAT_ICONS.map((ico, i) => (
                <div key={i} className="stat-card"
                  onMouseEnter={() => setHoveredStat(i)}
                  onMouseLeave={() => setHoveredStat(null)}
                  style={{
                    padding: isMobile ? "16px 10px" : "24px 16px",
                    borderRight: i < 3 ? `1px solid ${B}08` : "none",
                    background: hoveredStat === i
                      ? `linear-gradient(135deg, ${STAT_COLORS[i]}06, #fff)`
                      : "#fff",
                    position: "relative", overflow: "hidden", textAlign: "center",
                    transition: "background 0.25s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: hoveredStat === i
                      ? `linear-gradient(90deg,${STAT_COLORS[i]},${STAT_COLORS[i]}55)`
                      : "transparent",
                    transition: "background 0.25s",
                  }} />
                  <div style={{
                    fontSize: isMobile ? 22 : 28, marginBottom: 6,
                    display: "inline-block", transition: "transform 0.3s",
                    transform: hoveredStat === i ? "scale(1.18) rotate(-8deg)" : "scale(1)",
                  }}>
                    {ico}
                  </div>
                  <div style={{
                    fontSize: isMobile ? 24 : 34, fontWeight: 900,
                    color: STAT_COLORS[i], lineHeight: 1, marginBottom: 5,
                    direction: "ltr", letterSpacing: "-1px",
                  }}>
                    {statVals[i]}
                  </div>
                  <div style={{ fontSize: isMobile ? 10 : 11, color: "#64748b", fontWeight: 700, lineHeight: 1.4 }}>
                    {t.statsLbls[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SidebarLeft on mobile/tablet */}
          {(isMobile || isTablet) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
              {sidebarLeftContent}
            </div>
          )}
        </div>

        {/* LEFT SIDEBAR */}
        {!isMobile && !isTablet && (
          <aside className="sidebar-l" style={{
            position: "sticky", top: STICKY_TOP,
            animation: "slide-in-left 0.7s cubic-bezier(0.22,1,0.36,1) both",
          }}>
            {sidebarLeftContent}
          </aside>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{
        padding: isMobile ? "16px 14px" : "22px 36px",
        borderTop: `1px solid ${G}25`, textAlign: "center",
        background: "#fff", color: "#94a3b8",
        fontSize: isMobile ? 11 : 13, fontWeight: 600,
        marginTop: 32, position: "relative", zIndex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <span>{t.footer}</span>
          <span style={{ color: "#e2e8f0" }}>|</span>
          <span style={{ direction: "ltr", color: "#cbd5e1", fontSize: isMobile ? 10 : 13 }}>
            Nasser Medical Complex · Gaza · 4–5 Dec 2026
          </span>
        </div>
      </footer>

      {/* VIDEO LIGHTBOX */}
      {videoOpen && (
        <div onClick={() => setVideoOpen(false)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, animation: "fade-in .2s",
          padding: isMobile ? 12 : 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: "relative", width: "100%", maxWidth: 900,
            borderRadius: 18, overflow: "hidden",
            boxShadow: `0 30px 100px rgba(0,0,0,0.5)`,
            animation: "scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg,${R},${G},${R})`,
              backgroundSize: "200% 100%",
              animation: "shimmer-border 2.5s linear infinite", zIndex: 10,
            }} />
            <button onClick={() => setVideoOpen(false)} style={{
              position: "absolute", top: 12, right: 12,
              background: R, border: "none", borderRadius: "50%",
              width: 38, height: 38, color: "#fff", fontSize: 16,
              cursor: "pointer", zIndex: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "rotate(90deg) scale(1.1)"}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
            >✕</button>
            <video src="/promo-video.mp4" controls autoPlay playsInline poster="/hospital-side.jpg"
              style={{ width: "100%", display: "block", background: "#000", maxHeight: "80vh" }}
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

      {/* GALLERY LIGHTBOX */}
      {lightboxIndex !== null && filteredMedia[lightboxIndex] && (
        <GalleryLightbox
          item={filteredMedia[lightboxIndex]}
          meta={getMeta(filteredMedia[lightboxIndex], mediaItems.indexOf(filteredMedia[lightboxIndex]))}
          onClose={closeLightbox}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
          isRtl={isRtl}
          isMobile={isMobile}
          onLike={() => handleLike(mediaItems.indexOf(filteredMedia[lightboxIndex]))}
          likes={mediaLikes[mediaItems.indexOf(filteredMedia[lightboxIndex])] || 0}
          views={mediaViews[mediaItems.indexOf(filteredMedia[lightboxIndex])] || 0}
        />
      )}

      {/* MODALS */}
      {modal && (
        <div onClick={() => setModal(null)} style={{
          position: "fixed", inset: 0,
          background: "rgba(27,54,93,0.65)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          zIndex: 999, backdropFilter: "blur(10px)",
          animation: "fade-in .2s", overflowY: "auto",
          padding: isMobile ? "80px 12px 40px" : `${STICKY_TOP + 16}px 20px 40px`,
        }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: isMobile ? 18 : 24,
            width: "100%", maxWidth: isMobile ? "100%" : 520,
            position: "relative",
            boxShadow: `0 28px 70px rgba(27,54,93,0.25),0 0 0 2px ${G}30`,
            borderTop: `5px solid ${modal.type === "news" ? R : G}`,
            maxHeight: "85vh", overflowY: "auto",
          }}>
            <button onClick={() => setModal(null)} style={{
              position: "absolute", top: 14,
              [isRtl ? "left" : "right"]: 14,
              background: "#f1f5f9", border: "none", borderRadius: "50%",
              width: 36, height: 36, cursor: "pointer", fontSize: 15, color: "#64748b",
              zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.25s, background 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "rotate(90deg) scale(1.1)"; e.currentTarget.style.background = `${R}15`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = "#f1f5f9"; }}
            >✕</button>

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

            {modal.type === "committee" && (() => {
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
                    <div style={{ padding: isMobile ? "30px 20px" : "40px 30px", textAlign: "center" }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: 18, background: `${B}10`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 32, margin: "0 auto 14px",
                        animation: "float-avatar 3s ease-in-out infinite",
                      }}>
                        {c.icon}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: B, marginBottom: 4 }}>{c.name}</div>
                      <div style={{
                        fontSize: 12, color: R, background: `${R}0e`,
                        padding: "4px 14px", borderRadius: 30,
                        display: "inline-block", marginBottom: 14,
                      }}>
                        {t.execCommittee}
                      </div>
                      <p style={{
                        color: "#475569", fontSize: 14, lineHeight: 1.9,
                        background: "#F8FAFC", padding: "14px 16px", borderRadius: 12,
                        border: "1px solid #e8edf2", marginBottom: 16,
                        textAlign: isRtl ? "right" : "left",
                      }}>
                        {c.desc}
                      </p>
                      <div style={{
                        background: "#fef9ee", borderRadius: 12,
                        border: `1px solid ${G}35`, padding: "14px 16px",
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: B, marginBottom: 10 }}>
                          👥 {t.membersLbl}
                        </div>
                        {c.members.map((m, i) => (
                          <div key={i} style={{
                            background: "#fff", padding: "10px 14px", borderRadius: 10,
                            [isRtl ? "borderRight" : "borderLeft"]: `3px solid ${G}`,
                            fontSize: 13, fontWeight: 700, color: B,
                            border: "1px solid #e8edf2",
                            marginBottom: i < c.members.length - 1 ? 8 : 0,
                          }}>
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
              <div style={{ padding: isMobile ? "30px 20px" : "40px 30px", textAlign: "center", direction: t.dir }}>
                <div style={{
                  fontSize: 40, marginBottom: 14,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 80, height: 80, background: `${R}0e`, borderRadius: 18,
                  animation: "float-avatar 3s ease-in-out infinite",
                }}>
                  {modal.data.icon || "📰"}
                </div>
                <div style={{ fontSize: isMobile ? 17 : 21, fontWeight: 900, color: B, marginBottom: 5 }}>
                  {modal.data.title}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 12 }}>
                  {modal.data.date}
                </div>
                <div style={{
                  width: 40, height: 3,
                  background: `linear-gradient(90deg,${R},${G})`,
                  borderRadius: 3, margin: "0 auto 14px",
                  backgroundSize: "200% 100%",
                  animation: "shimmer-border 2.5s linear infinite",
                }} />
                <div style={{
                  background: "#F8FAFC", borderRadius: 12,
                  padding: "16px 18px", fontSize: isMobile ? 13 : 15,
                  color: "#475569", lineHeight: 2,
                  border: "1px solid #e8edf2",
                  textAlign: isRtl ? "right" : "left",
                }}>
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