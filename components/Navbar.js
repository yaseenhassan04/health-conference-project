"use client";

import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function Navbar({ lang = 'ar', setLang }) {
  const emergencyBlue = "#1B365D";
  const goldenTouch = "#D4AF37";

  const translations = {
    ar: {
      dir: 'rtl',
      title: "المؤتمر العلمي الثاني عشر لأمراض الباطنة",
      subtitle: "The 12th Conference of Internal Medicine",
      switchBtn: "English",
      links: [
        { name: "الرئيسية", href: "/" },
        { name: "البرنامج العلمي", href: "/program" },
        { name: "تقديم الأبحاث", href: "/participation" },
        { name: "التسجيل والحضور", href: "/live" }
      ]
    },
    en: {
      dir: 'ltr',
      title: "The 12th Conference of Internal Medicine",
      subtitle: "Scientific excellence & sustainable health",
      switchBtn: "العربية",
      links: [
        { name: "Home", href: "/" },
        { name: "Scientific Program", href: "/program" },
        { name: "Abstract Submission", href: "/participation" },
        { name: "Registration", href: "/live" }
      ]
    }
  };

  const t = translations[lang] || translations['ar'];

  return (
    <nav style={{
      backgroundColor: emergencyBlue,
      borderBottom: `5px solid ${goldenTouch}`,
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      direction: t.dir,
      height: '130px',
      position: 'sticky', top: 0, zIndex: 1000,
      boxSizing: 'border-box',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{
          position: 'relative',
          top: '15px'
        }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              height: '150px',
              width: 'auto',
              objectFit: 'contain',
              // ✅ ⬅️ تحديث الـ Filter ليعطي توهج ذهبي خفيف
              filter: `drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))`,
              animation: 'glow-pulse 2s infinite alternate'
            }}
          />
        </div>

        <div style={{
          [t.dir === 'rtl' ? 'borderRight' : 'borderLeft']: `3px solid ${goldenTouch}88`,
          [t.dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: '25px'
        }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.6rem', fontWeight: '900', lineHeight: 1.2 }}>
            {t.title}
          </h2>
          <p style={{ color: goldenTouch, margin: '5px 0 0 0', fontSize: '1rem', fontWeight: 'bold' }}>
            {t.subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2.8rem', alignItems: 'center' }}>
        {t.links.map((link, index) => (
          <Link key={index} href={link.href} style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: '800',
            fontSize: '1.05rem'
          }}>
            {link.name}
          </Link>
        ))}

        {setLang && (
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${goldenTouch}`,
              color: goldenTouch,
              padding: '8px 20px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.95rem'
            }}
          >
            <Globe size={18} /> {t.switchBtn}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes glow-pulse {
          0% { filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.4)); }
          100% { filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.7)); }
        }
      `}</style>
    </nav>
  );
}