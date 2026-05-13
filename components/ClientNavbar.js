"use client";

// components/ClientNavbar.js
// ملف واحد يجمع الـ Navbar كاملاً — لا يحتاج NavbarWrapper منفصل

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Menu, X } from 'lucide-react';
import { useLang } from '@/context/LangContext';
const emergencyBlue = "#1B365D";
const goldenTouch   = "#D4AF37";

const translations = {
  ar: {
    dir: 'rtl',
    title: "المؤتمر العلمي الثاني عشر لأمراض الباطنة",
    subtitle: "The 12th Conference of Internal Medicine",
    switchBtn: "English",
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
    links: [
      { name: "Home",                href: "/" },
      { name: "Scientific Program",  href: "/program" },
      { name: "Abstract Submission", href: "/participation" },
      { name: "Registration",        href: "/live" },
    ],
  },
};

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

export default function ClientNavbar() {
  const { lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const bp       = useBreakpoint();
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const t        = translations[lang];

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  const navHeight = isMobile ? 64 : isTablet ? 90 : 130;
  const logoH     = isMobile ? 52 : isTablet ? 72 : 150;
  const titleSize = isMobile ? '1rem' : isTablet ? '1.2rem' : '1.6rem';
  const subSize   = isMobile ? '0.75rem' : isTablet ? '0.85rem' : '1rem';

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
      `}</style>

      {/* NAV */}
      <nav style={{
        backgroundColor: emergencyBlue,
        borderBottom: `${isMobile ? 3 : 5}px solid ${goldenTouch}`,
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

      {/* Mobile Dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'sticky', top: navHeight, zIndex: 999,
          background: emergencyBlue, borderBottom: `3px solid ${goldenTouch}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          direction: t.dir, animation: 'slideDown .2s ease',
        }}>
          {t.links.map((link, i) => (
            <Link key={i} href={link.href} className="mobile-link"
              onClick={() => setMenuOpen(false)}>
              {link.name}
            </Link>
          ))}
          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${goldenTouch},transparent)`, margin: '4px 0' }} />
        </div>
      )}
    </>
  );
}