"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';

const B = '#1B365D', R = '#C8102E', G = '#D4AF37';

/* ─────────────────────────────────────────
   برنامج 3 جلسات × 1.5 ساعة + استراحات
   09:00 مسابقة صباحية 30 دق
   09:30 جلسة 1 (90 دق)
   11:00 استراحة (30 دق)
   11:30 جلسة 2 (90 دق)
   13:00 استراحة غداء (60 دق)
   14:00 جلسة 3 (90 دق)
   15:30 انتهاء
───────────────────────────────────────── */
const PROGRAM = {
  ar: [
    {
      label: 'DAY · 01',
      day: 'اليوم الأول',
      subtitle: 'الافتتاح وتحديات الطوارئ',
      date: '4 ديسمبر 2026',
      sessions: [
        {
          type: 'quiz',
          timeStart: '09:00 ص', timeEnd: '09:30 ص',
          name: 'مسابقة الصباح الطبية',
          desc: 'تحدٍّ علمي صباحي بين المشاركين — أسئلة في الباطنة والطوارئ.',
          tags: ['مسابقة', 'تحدي علمي', 'صباح'],
        },
        {
          type: 'opening',
          timeStart: '09:30 ص', timeEnd: '11:00 ص',
          name: 'الجلسة الافتتاحية',
          desc: 'كلمة رئيس المؤتمر وضيوف الشرف — الطب في القطاع، صمود مستدام.',
          tags: ['افتتاح', 'ضيوف الشرف', 'كلمة الرئيس'],
        },
        { type: 'break', timeStart: '11:00 ص', timeEnd: '11:30 ص', name: 'استراحة — Networking Break', desc: '', tags: [] },
        {
          type: '',
          timeStart: '11:30 ص', timeEnd: '01:00 م',
          name: 'الجلسة الثانية',
          desc: 'إدارة الأمراض المزمنة تحت الحصار والتصعيد.',
          tags: ['متحدثون من غزة', 'عبر الفيديو', 'أمراض مزمنة'],
        },
        { type: 'break', timeStart: '01:00 م', timeEnd: '02:00 م', name: 'استراحة الغداء', desc: '', tags: [] },
        {
          type: '',
          timeStart: '02:00 م', timeEnd: '03:30 م',
          name: 'الجلسة الثالثة',
          desc: 'الاستجابة لحالات الطوارئ والإصابات الجماعية.',
          tags: ['طوارئ', 'إصابات', 'بروتوكولات'],
        },
      ],
    },
    {
      label: 'DAY · 02',
      day: 'اليوم الثاني',
      subtitle: 'الأبحاث والمستجدات العلمية',
      date: '5 ديسمبر 2026',
      sessions: [
        {
          type: 'quiz',
          timeStart: '09:00 ص', timeEnd: '09:30 ص',
          name: 'مسابقة الصباح الطبية',
          desc: 'الجولة الثانية — أسئلة متقدمة في أمراض الباطنة.',
          tags: ['مسابقة', 'تحدي علمي', 'يوم ثانٍ'],
        },
        {
          type: '',
          timeStart: '09:30 ص', timeEnd: '11:00 ص',
          name: 'جلسة الأبحاث المقبولة',
          desc: 'عرض الملخصات البحثية المقبولة من الباحثين المشاركين.',
          tags: ['أبحاث', 'ملخصات', 'باحثون'],
        },
        { type: 'break', timeStart: '11:00 ص', timeEnd: '11:30 ص', name: 'استراحة', desc: '', tags: [] },
        {
          type: '',
          timeStart: '11:30 ص', timeEnd: '01:00 م',
          name: 'الجلسة العلمية الثانية',
          desc: 'آخر المستجدات في طب الباطنة وبروتوكولات العلاج.',
          tags: ['مستجدات', 'بروتوكولات', 'علاج'],
        },
        { type: 'break', timeStart: '01:00 م', timeEnd: '02:00 م', name: 'استراحة الغداء', desc: '', tags: [] },
        {
          type: 'opening',
          timeStart: '02:00 م', timeEnd: '03:30 م',
          name: 'الجلسة الختامية وحفل التكريم',
          desc: 'توصيات المؤتمر، إعلان نتائج المسابقة، وتكريم المشاركين والمتحدثين.',
          tags: ['ختام', 'توصيات', 'تكريم', 'شهادات'],
        },
      ],
    },
  ],
  en: [
    {
      label: 'DAY · 01',
      day: 'Day One',
      subtitle: 'Opening & Emergency Challenges',
      date: 'December 4, 2026',
      sessions: [
        {
          type: 'quiz',
          timeStart: '09:00 AM', timeEnd: '09:30 AM',
          name: 'Morning Medical Quiz',
          desc: 'Scientific morning challenge among participants — internal medicine & emergency questions.',
          tags: ['Quiz', 'Challenge', 'Morning'],
        },
        {
          type: 'opening',
          timeStart: '09:30 AM', timeEnd: '11:00 AM',
          name: 'Opening Ceremony',
          desc: 'Welcome address by the conference president and honored guests.',
          tags: ['Opening', 'Guests', 'Welcome'],
        },
        { type: 'break', timeStart: '11:00 AM', timeEnd: '11:30 AM', name: 'Networking Break', desc: '', tags: [] },
        {
          type: '',
          timeStart: '11:30 AM', timeEnd: '01:00 PM',
          name: 'Session Two',
          desc: 'Managing chronic diseases under siege and escalation.',
          tags: ['Gaza Speakers', 'Video', 'Chronic Disease'],
        },
        { type: 'break', timeStart: '01:00 PM', timeEnd: '02:00 PM', name: 'Lunch Break', desc: '', tags: [] },
        {
          type: '',
          timeStart: '02:00 PM', timeEnd: '03:30 PM',
          name: 'Session Three',
          desc: 'Emergency response and mass casualty management.',
          tags: ['Emergency', 'Trauma', 'Protocols'],
        },
      ],
    },
    {
      label: 'DAY · 02',
      day: 'Day Two',
      subtitle: 'Research & Scientific Updates',
      date: 'December 5, 2026',
      sessions: [
        {
          type: 'quiz',
          timeStart: '09:00 AM', timeEnd: '09:30 AM',
          name: 'Morning Medical Quiz',
          desc: 'Round Two — Advanced questions in internal medicine.',
          tags: ['Quiz', 'Challenge', 'Day Two'],
        },
        {
          type: '',
          timeStart: '09:30 AM', timeEnd: '11:00 AM',
          name: 'Accepted Research Session',
          desc: 'Presentation of accepted research abstracts from participating researchers.',
          tags: ['Research', 'Abstracts', 'Researchers'],
        },
        { type: 'break', timeStart: '11:00 AM', timeEnd: '11:30 AM', name: 'Coffee Break', desc: '', tags: [] },
        {
          type: '',
          timeStart: '11:30 AM', timeEnd: '01:00 PM',
          name: 'Scientific Session Two',
          desc: 'Latest updates in internal medicine and treatment protocols.',
          tags: ['Updates', 'Protocols', 'Treatment'],
        },
        { type: 'break', timeStart: '01:00 PM', timeEnd: '02:00 PM', name: 'Lunch Break', desc: '', tags: [] },
        {
          type: 'opening',
          timeStart: '02:00 PM', timeEnd: '03:30 PM',
          name: 'Closing Session & Ceremony',
          desc: 'Conference recommendations, quiz results announcement, and honoring participants.',
          tags: ['Closing', 'Ceremony', 'Certificates', 'Awards'],
        },
      ],
    },
  ],
};

/* ─── hook لاكتشاف حجم الشاشة ─── */
function useBreakpoint() {
  const [bp, setBp] = useState('desktop');
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return bp;
}

/* ─── SessionCard ─── */
function SessionCard({ session, bp, lang }) {
  const isBreak   = session.type === 'break';
  const isOpening = session.type === 'opening';
  const isQuiz    = session.type === 'quiz';
  const isMobile  = bp === 'mobile';

  const timeColWidth = isMobile ? 80 : 110;
  const timeFontSize = isMobile ? 11 : 12;
  const cardPadding  = isMobile ? '12px 10px' : '16px 20px';
  const nameFontSize = isMobile ? (isBreak ? 12 : 13) : (isBreak ? 13 : 15);

  /* ألوان حسب النوع */
  const accentColor = isQuiz ? '#7C3AED' : isOpening ? G : B;
  const bgColor     = isQuiz
    ? 'rgba(124,58,237,0.05)'
    : isOpening
    ? 'rgba(212,175,55,0.06)'
    : isBreak
    ? 'rgba(27,54,93,0.02)'
    : 'rgba(27,54,93,0.03)';
  const barGradient = isQuiz
    ? 'linear-gradient(180deg,#7C3AED,#A855F7)'
    : isOpening
    ? `linear-gradient(180deg,${G},${G}80)`
    : `linear-gradient(180deg,${B},${R})`;
  const tagBg     = isQuiz ? 'rgba(124,58,237,0.1)' : isOpening ? 'rgba(212,175,55,0.1)' : 'rgba(27,54,93,0.06)';
  const tagBorder = isQuiz ? 'rgba(124,58,237,0.3)' : isOpening ? `${G}40` : 'rgba(27,54,93,0.1)';
  const tagColor  = isQuiz ? '#5B21B6' : isOpening ? '#92700a' : '#64748b';

  return (
    <div
      style={{
        display: 'flex',
        background: '#fff',
        border: `1px solid ${isOpening ? G + '60' : isQuiz ? 'rgba(124,58,237,0.25)' : '#e8edf2'}`,
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        transition: 'all .25s',
        opacity: isBreak ? 0.7 : 1,
      }}
      onMouseEnter={e => {
        if (!isBreak) {
          e.currentTarget.style.borderColor = accentColor;
          e.currentTarget.style.transform = 'translateX(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,54,93,0.08)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isOpening ? G + '60' : isQuiz ? 'rgba(124,58,237,0.25)' : '#e8edf2';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* عمود الوقت */}
      <div style={{
        minWidth: timeColWidth, width: timeColWidth,
        padding: isMobile ? '12px 6px' : '16px 12px',
        borderLeft: '1px solid #e8edf2',
        background: bgColor,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: 'monospace', fontSize: timeFontSize, fontWeight: 700, color: isBreak ? '#94a3b8' : accentColor, direction: 'ltr', textAlign: 'center' }}>
          {session.timeStart}
        </div>
        <div style={{ fontSize: 10, color: '#cbd5e1' }}>↕</div>
        <div style={{ fontFamily: 'monospace', fontSize: timeFontSize, fontWeight: 700, color: isBreak ? '#94a3b8' : accentColor, direction: 'ltr', textAlign: 'center' }}>
          {session.timeEnd}
        </div>
      </div>

      {/* المحتوى */}
      <div style={{ padding: cardPadding, flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: nameFontSize, fontWeight: 700,
          color: isBreak ? '#94a3b8' : isQuiz ? '#5B21B6' : B,
          marginBottom: session.desc ? 5 : 0,
          fontStyle: isBreak ? 'italic' : 'normal',
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        }}>
          {isOpening && <span style={{ fontSize: isMobile ? 14 : 16 }}>⭐</span>}
          {isBreak   && <span style={{ fontSize: isMobile ? 12 : 14 }}>☕</span>}
          {isQuiz    && <span style={{ fontSize: isMobile ? 14 : 16 }}>🏆</span>}
          {session.name}
        </div>
        {session.desc && (
          <div style={{ fontSize: isMobile ? 12 : 13, color: '#64748b', lineHeight: 1.6, marginBottom: 8 }}>
            {session.desc}
          </div>
        )}
        {session.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 4 : 6 }}>
            {session.tags.map((tag, i) => (
              <span key={i} style={{
                fontSize: isMobile ? 10 : 11,
                padding: isMobile ? '2px 8px' : '3px 10px',
                borderRadius: 20,
                background: tagBg, border: `1px solid ${tagBorder}`, color: tagColor,
                fontWeight: 600,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* شريط جانبي */}
      {!isBreak && (
        <div style={{ width: isMobile ? 3 : 4, background: barGradient, flexShrink: 0 }} />
      )}
    </div>
  );
}

/* ─── LibraryItem ─── */
function LibraryItem({ item, lang, isMobile }) {
  const typeIcon = { book: '📗', reference: '📖', paper: '📄', guide: '📋', other: '📁' };
  const icon = typeIcon[item.type] || typeIcon.other;

  return (
    <div
      className="lib-item"
      style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 14px' : '14px 18px',
        background: '#F8FAFC',
        border: `1px solid rgba(212,175,55,0.25)`,
        borderRight: `4px solid ${G}`,
        borderRadius: 12,
        transition: 'all .25s',
        gap: isMobile ? 8 : 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: isMobile ? 13 : 14, fontWeight: 700, color: B, marginBottom: 4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'normal' : 'nowrap',
        }}>
          {icon} {item.title}
        </div>
        <div style={{ fontSize: isMobile ? 11 : 12, color: '#64748b', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {item.author && <span>✍️ {item.author}</span>}
          {item.category && (
            <span style={{ background: 'rgba(27,54,93,0.07)', color: B, padding: '1px 8px', borderRadius: 10, fontSize: 11 }}>
              {item.category}
            </span>
          )}
          {item.year && <span style={{ color: '#94a3b8' }}>• {item.year}</span>}
        </div>
        {item.description && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>{item.description}</div>
        )}
      </div>
      {item.fileUrl && (
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="lib-item-btn"
          style={{
            padding: isMobile ? '8px 0' : '8px 18px',
            width: isMobile ? '100%' : 'auto',
            textAlign: 'center',
            background: B, color: '#fff',
            borderRadius: 8, fontSize: 12,
            fontWeight: 700, textDecoration: 'none',
            whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'all .2s',
            display: 'inline-block',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = R; }}
          onMouseLeave={e => { e.currentTarget.style.background = B; }}
        >
          📥 {lang === 'ar' ? 'تحميل' : 'Download'}
        </a>
      )}
    </div>
  );
}

/* ─── الصفحة الرئيسية ─── */
export default function Program() {
  const { lang } = useLang();
  const [library, setLibrary]     = useState([]);
  const [loadingLib, setLoadingLib] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const bp = useBreakpoint();

  const isRTL    = lang === 'ar';
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const program  = PROGRAM[lang];

  /* جلب المكتبة من API مخصص (منفصل تماماً عن نظام الملخصات) */
  useEffect(() => {
    fetch('/api/library')
      .then(r => r.json())
      .then(data => setLibrary(data.items || []))
      .catch(console.error)
      .finally(() => setLoadingLib(false));
  }, []);

  /* فلترة المكتبة */
  const libCategories = ['all', ...Array.from(new Set(library.map(i => i.category).filter(Boolean)))];
  const filteredLib   = activeFilter === 'all' ? library : library.filter(i => i.category === activeFilter);

  /* responsive */
  const mainPadding = isMobile ? '20px 12px 48px' : isTablet ? '28px 20px 56px' : '36px 20px 60px';
  const h1FontSize  = isMobile ? 22 : isTablet ? 26 : 32;
  const libPadding  = isMobile ? 20 : isTablet ? 24 : 32;
  const ctaFontSize = isMobile ? 13 : 15;
  const ctaPadding  = isMobile ? '11px 22px' : '13px 32px';

  return (
    <div style={{ direction: isRTL ? 'rtl' : 'ltr', fontFamily: "'Cairo',sans-serif", background: '#F4F7F9', minHeight: '100vh' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; }
        .ecg-line { stroke-dasharray:1200; stroke-dashoffset:1200; animation:ecg 3.5s linear infinite }
        @keyframes ecg { to { stroke-dashoffset:0 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        .day-card { animation:slideUp .5s ease both }
        .day-card:nth-child(1) { animation-delay:.05s }
        .day-card:nth-child(2) { animation-delay:.15s }
        .lib-item:hover { border-color:#D4AF37!important; transform:translateX(-2px); box-shadow:0 6px 20px rgba(27,54,93,0.08) }
        .filter-btn { transition: all .2s; cursor: pointer; border: none; font-family: 'Cairo',sans-serif; }
        .filter-btn:hover { opacity: 0.85; }
        @media (max-width: 1023px) {
          .day-header { flex-wrap: wrap; gap: 8px !important; }
          .day-divider { display: none !important; }
        }
        @media (max-width: 639px) {
          .day-label { font-size: 9px !important; padding: 3px 8px !important; }
          .day-title { font-size: 14px !important; }
          .day-date  { font-size: 11px !important; }
          .lib-item  { flex-direction: column !important; align-items: flex-start !important; }
          .lib-item-btn { width: 100% !important; text-align: center !important; justify-content: center !important; display: flex !important; margin-top: 8px; }
          .footer-text { font-size: 11px !important; padding: 20px 14px !important; }
          .ecg-wrap { height: 36px !important; }
        }
      `}</style>

      {/* ECG */}
      <div className="ecg-wrap" style={{ height: isMobile ? 36 : 52, background: 'rgba(27,54,93,0.03)', borderBottom: '1px solid rgba(27,54,93,0.07)', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 52" preserveAspectRatio="none">
          <path className="ecg-line"
            d="M0 26 L80 26 L95 10 L110 42 L125 26 L250 26 L265 5 L285 47 L300 26 L500 26 L515 10 L530 42 L545 26 L700 26 L715 5 L735 47 L750 26 L900 26 L915 10 L930 42 L945 26 L1200 26"
            fill="none" stroke={R} strokeWidth="2.2" />
        </svg>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: mainPadding }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(200,16,46,0.07)', border: '1px solid rgba(200,16,46,0.2)',
            borderRadius: 50, padding: isMobile ? '4px 12px' : '5px 16px',
            fontSize: isMobile ? 11 : 12, fontWeight: 700, color: R, marginBottom: isMobile ? 12 : 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: R, display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }} />
            {lang === 'ar' ? 'البرنامج العلمي' : 'Scientific Program'}
          </div>

          <h1 style={{ fontSize: h1FontSize, fontWeight: 900, color: B, margin: '0 0 10px', lineHeight: 1.2 }}>
            {lang === 'ar' ? 'البرنامج العلمي والأجندة' : 'Scientific Program & Agenda'}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ width: isMobile ? 40 : 60, height: 2, background: `linear-gradient(90deg,transparent,${G})` }} />
            <span style={{ color: R, fontSize: isMobile ? 14 : 16 }}>♥</span>
            <div style={{ width: isMobile ? 40 : 60, height: 2, background: `linear-gradient(90deg,${G},transparent)` }} />
          </div>

          <p style={{ fontSize: isMobile ? 12 : 14, color: '#64748b', fontWeight: 500, padding: isMobile ? '0 8px' : 0 }}>
            {lang === 'ar'
              ? 'جدول الجلسات والمحاضرات — 4-5 ديسمبر 2026 | مجمع ميران، غزة'
              : 'Session Schedule — December 4-5, 2026 | Miran Complex, Gaza'}
          </p>

          {/* مفتاح الألوان */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 10 : 16, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { color: '#7C3AED', label: lang === 'ar' ? 'مسابقة صباحية' : 'Morning Quiz' },
              { color: G,         label: lang === 'ar' ? 'افتتاح / ختام' : 'Opening / Closing' },
              { color: B,         label: lang === 'ar' ? 'جلسة علمية' : 'Scientific Session' },
              { color: '#94a3b8', label: lang === 'ar' ? 'استراحة' : 'Break' },
            ].map((k, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: isMobile ? 10 : 11, color: '#64748b' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: k.color, flexShrink: 0 }} />
                {k.label}
              </div>
            ))}
          </div>
        </div>

        {/* PROGRAM DAYS */}
        {program.map((day, di) => (
          <div key={di} className="day-card" style={{ marginBottom: isMobile ? 20 : 32 }}>
            <div className="day-header" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, marginBottom: isMobile ? 12 : 16 }}>
              <div className="day-label" style={{
                background: B, color: G,
                padding: isMobile ? '3px 8px' : '4px 12px',
                borderRadius: 8,
                fontSize: isMobile ? 9 : 10,
                fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em', flexShrink: 0,
              }}>
                {day.label}
              </div>
              <div>
                <div className="day-title" style={{ fontSize: isMobile ? 14 : 17, fontWeight: 900, color: B, lineHeight: 1.2 }}>
                  {day.day}: {day.subtitle}
                </div>
                <div className="day-date" style={{ fontSize: isMobile ? 11 : 12, color: '#94a3b8', marginTop: 2 }}>
                  📅 {day.date}
                </div>
              </div>
              <div className="day-divider" style={{ flex: 1, height: 1, background: `linear-gradient(${isRTL ? '270deg' : '90deg'},${G}80,transparent)` }} />
            </div>

            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf2', overflow: 'hidden', padding: isMobile ? 10 : 16 }}>
              {day.sessions.map((s, si) => (
                <SessionCard key={si} session={s} bp={bp} lang={lang} />
              ))}
            </div>
          </div>
        ))}

        {/* ── DIGITAL LIBRARY ── */}
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: 20, padding: libPadding, marginTop: 8,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${R},${G},${B})` }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 12 : 16, flexWrap: 'wrap' }}>
            <div style={{
              width: isMobile ? 38 : 46, height: isMobile ? 38 : 46, borderRadius: 12,
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isMobile ? 18 : 22, flexShrink: 0,
            }}>📚</div>
            <div>
              <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 900, color: B }}>
                {lang === 'ar' ? 'المكتبة الرقمية' : 'Digital Library'}
              </div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: '#94a3b8' }}>
                {lang === 'ar' ? 'كتب ومراجع طبية مختارة من فريق المؤتمر' : 'Selected medical books & references by the conference team'}
                {library.length > 0 && (
                  <span style={{ marginRight: 8, marginLeft: 8, background: 'rgba(27,54,93,0.1)', color: B, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {library.length} {lang === 'ar' ? 'مرجع' : 'resources'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* فلتر التصنيف */}
          {library.length > 0 && libCategories.length > 2 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {libCategories.map(cat => (
                <button
                  key={cat}
                  className="filter-btn"
                  onClick={() => setActiveFilter(cat)}
                  style={{
                    padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: activeFilter === cat ? B : 'rgba(27,54,93,0.06)',
                    color: activeFilter === cat ? '#fff' : '#64748b',
                  }}
                >
                  {cat === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : cat}
                </button>
              ))}
            </div>
          )}

          {loadingLib ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>
              ⏳ {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : filteredLib.length === 0 ? (
            <div style={{ background: '#F8FAFC', border: '1px dashed #e2e8f0', borderRadius: 12, padding: isMobile ? 20 : 28, textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 26 : 32, marginBottom: 10, opacity: 0.4 }}>📚</div>
              <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                {lang === 'ar' ? 'لا توجد مراجع منشورة حالياً' : 'No resources published yet'}
              </div>
              <div style={{ fontSize: 11, color: '#cbd5e1', fontFamily: 'monospace' }}>
                COMING SOON · {lang === 'ar' ? 'سيتم التحديث قريباً' : 'Updates coming soon'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredLib.map((item, i) => (
                <LibraryItem key={i} item={item} lang={lang} isMobile={isMobile} />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: isMobile ? 28 : 40 }}>
          <Link href="/participation" style={{
            padding: ctaPadding, background: R, color: '#fff', borderRadius: 12,
            fontFamily: "'Cairo',sans-serif", fontSize: ctaFontSize, fontWeight: 700,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(200,16,46,0.2)',
          }}>
            📄 {lang === 'ar' ? 'قدّم بحثك الآن' : 'Submit Your Research'}
          </Link>
        </div>
      </div>

      <footer className="footer-text" style={{ padding: isMobile ? '20px 14px' : '28px 40px', borderTop: '1px solid #e8edf2', textAlign: 'center', color: '#94a3b8', fontSize: isMobile ? 11 : 13, background: '#fff' }}>
        {lang === 'ar' ? '© 2026 مؤتمر الصمود والاستدامة الطبي — مستشفى ناصر' : '© 2026 Medical Resilience & Sustainability Conference — Nasser Hospital'}
      </footer>
    </div>
  );
}