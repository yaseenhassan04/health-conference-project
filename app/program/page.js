"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

const B = '#1B365D', R = '#C8102E', G = '#D4AF37';

const PROGRAM = {
  ar: [
    {
      label: 'DAY · 01',
      day: 'اليوم الأول',
      subtitle: 'الافتتاح وتحديات الطوارئ',
      date: '4 ديسمبر 2026',
      sessions: [
        { type: 'opening', timeStart: '09:00 ص', timeEnd: '10:30 ص', name: 'الجلسة الافتتاحية', desc: 'كلمة رئيس المؤتمر وضيوف الشرف — الطب في القطاع، صمود مستدام.', tags: ['افتتاح', 'ضيوف الشرف', 'كلمة الرئيس'] },
        { type: 'break',   timeStart: '10:30 ص', timeEnd: '11:00 ص', name: 'استراحة — Networking Break', desc: '', tags: [] },
        { type: '',        timeStart: '11:00 ص', timeEnd: '01:00 م', name: 'الجلسة الأولى', desc: 'إدارة الأمراض المزمنة تحت الحصار والتصعيد.', tags: ['متحدثون من غزة', 'عبر الفيديو', 'أمراض مزمنة'] },
        { type: 'break',   timeStart: '01:00 م', timeEnd: '02:00 م', name: 'استراحة غداء', desc: '', tags: [] },
        { type: '',        timeStart: '02:00 م', timeEnd: '04:00 م', name: 'الجلسة الثانية', desc: 'الاستجابة لحالات الطوارئ والإصابات الجماعية.', tags: ['طوارئ', 'إصابات', 'بروتوكولات'] },
      ],
    },
    {
      label: 'DAY · 02',
      day: 'اليوم الثاني',
      subtitle: 'الأبحاث والمستجدات العلمية',
      date: '5 ديسمبر 2026',
      sessions: [
        { type: '',        timeStart: '09:00 ص', timeEnd: '11:00 ص', name: 'جلسة الأبحاث المقبولة', desc: 'عرض الملخصات البحثية المقبولة من الباحثين المشاركين.', tags: ['أبحاث', 'ملخصات', 'باحثون'] },
        { type: 'break',   timeStart: '11:00 ص', timeEnd: '11:30 ص', name: 'استراحة', desc: '', tags: [] },
        { type: '',        timeStart: '11:30 ص', timeEnd: '01:30 م', name: 'الجلسة الختامية', desc: 'توصيات المؤتمر وإعلان نتائج التحكيم العلمي.', tags: ['ختام', 'توصيات', 'جوائز'] },
        { type: 'opening', timeStart: '01:30 م', timeEnd: '02:30 م', name: 'حفل الختام والتكريم', desc: 'تكريم المشاركين والباحثين والمتحدثين الدوليين.', tags: ['تكريم', 'ختام', 'شهادات'] },
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
        { type: 'opening', timeStart: '09:00 AM', timeEnd: '10:30 AM', name: 'Opening Ceremony', desc: 'Welcome address by the conference president and honored guests.', tags: ['Opening', 'Guests', 'Welcome'] },
        { type: 'break',   timeStart: '10:30 AM', timeEnd: '11:00 AM', name: 'Networking Break', desc: '', tags: [] },
        { type: '',        timeStart: '11:00 AM', timeEnd: '01:00 PM', name: 'Session One', desc: 'Managing chronic diseases under siege and escalation.', tags: ['Gaza Speakers', 'Video', 'Chronic Disease'] },
        { type: 'break',   timeStart: '01:00 PM', timeEnd: '02:00 PM', name: 'Lunch Break', desc: '', tags: [] },
        { type: '',        timeStart: '02:00 PM', timeEnd: '04:00 PM', name: 'Session Two', desc: 'Emergency response and mass casualty management.', tags: ['Emergency', 'Trauma', 'Protocols'] },
      ],
    },
    {
      label: 'DAY · 02',
      day: 'Day Two',
      subtitle: 'Research & Scientific Updates',
      date: 'December 5, 2026',
      sessions: [
        { type: '',        timeStart: '09:00 AM', timeEnd: '11:00 AM', name: 'Accepted Research Session', desc: 'Presentation of accepted research abstracts from participating researchers.', tags: ['Research', 'Abstracts', 'Researchers'] },
        { type: 'break',   timeStart: '11:00 AM', timeEnd: '11:30 AM', name: 'Coffee Break', desc: '', tags: [] },
        { type: '',        timeStart: '11:30 AM', timeEnd: '01:30 PM', name: 'Closing Session', desc: 'Conference recommendations and scientific review results.', tags: ['Closing', 'Recommendations', 'Awards'] },
        { type: 'opening', timeStart: '01:30 PM', timeEnd: '02:30 PM', name: 'Closing Ceremony', desc: 'Honoring participants, researchers, and international speakers.', tags: ['Ceremony', 'Certificates', 'Awards'] },
      ],
    },
  ],
};

/* ─── hook لاكتشاف حجم الشاشة ─── */
function useBreakpoint() {
  const [bp, setBp] = useState('desktop'); // desktop | tablet | mobile
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
function SessionCard({ session, bp }) {
  const isBreak   = session.type === 'break';
  const isOpening = session.type === 'opening';
  const isMobile  = bp === 'mobile';

  /* الوقت: عمود ضيق على الموبايل */
  const timeColWidth = isMobile ? 80 : 110;
  const timeFontSize = isMobile ? 11 : 12;
  const cardPadding  = isMobile ? '12px 10px' : '16px 20px';
  const nameFontSize = isMobile ? (isBreak ? 12 : 13) : (isBreak ? 13 : 15);

  return (
    <div
      style={{
        display: 'flex',
        background: '#fff',
        border: `1px solid ${isOpening ? G + '60' : '#e8edf2'}`,
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        transition: 'all .25s',
        opacity: isBreak ? 0.7 : 1,
      }}
      onMouseEnter={e => {
        if (!isBreak) {
          e.currentTarget.style.borderColor = G;
          e.currentTarget.style.transform = 'translateX(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,54,93,0.08)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isOpening ? G + '60' : '#e8edf2';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* عمود الوقت */}
      <div style={{
        minWidth: timeColWidth,
        width: timeColWidth,
        padding: isMobile ? '12px 6px' : '16px 12px',
        borderLeft: '1px solid #e8edf2',
        background: isOpening ? 'rgba(212,175,55,0.06)' : isBreak ? 'rgba(27,54,93,0.02)' : 'rgba(27,54,93,0.03)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: 'monospace', fontSize: timeFontSize, fontWeight: 700, color: isOpening ? G : isBreak ? '#94a3b8' : B, direction: 'ltr', textAlign: 'center' }}>{session.timeStart}</div>
        <div style={{ fontSize: 10, color: '#cbd5e1' }}>↕</div>
        <div style={{ fontFamily: 'monospace', fontSize: timeFontSize, fontWeight: 700, color: isOpening ? G : isBreak ? '#94a3b8' : B, direction: 'ltr', textAlign: 'center' }}>{session.timeEnd}</div>
      </div>

      {/* المحتوى */}
      <div style={{ padding: cardPadding, flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: nameFontSize,
          fontWeight: 700,
          color: isBreak ? '#94a3b8' : B,
          marginBottom: session.desc ? 5 : 0,
          fontStyle: isBreak ? 'italic' : 'normal',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}>
          {isOpening && <span style={{ fontSize: isMobile ? 14 : 16 }}>⭐</span>}
          {isBreak   && <span style={{ fontSize: isMobile ? 12 : 14 }}>☕</span>}
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
                background: isOpening ? 'rgba(212,175,55,0.1)' : 'rgba(27,54,93,0.06)',
                border: `1px solid ${isOpening ? G + '40' : 'rgba(27,54,93,0.1)'}`,
                color: isOpening ? '#92700a' : '#64748b',
                fontWeight: 600,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* شريط اللون الجانبي */}
      {!isBreak && (
        <div style={{
          width: isMobile ? 3 : 4,
          background: isOpening ? `linear-gradient(180deg,${G},${G}80)` : `linear-gradient(180deg,${B},${R})`,
          flexShrink: 0,
        }} />
      )}
    </div>
  );
}

/* ─── الصفحة الرئيسية ─── */
export default function Program() {
  const [lang, setLang] = useState('ar');
  const [acceptedAbstracts, setAcceptedAbstracts] = useState([]);
  const [loadingLib, setLoadingLib] = useState(true);
  const bp = useBreakpoint();

  const isRTL    = lang === 'ar';
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const program  = PROGRAM[lang];

  useEffect(() => {
    fetch('/api/abstracts')
      .then(r => r.json())
      .then(data => {
        const accepted = (data.abstracts || []).filter(a =>
          a.status === 'accepted' || a.status === 'ACCEPTED'
        );
        setAcceptedAbstracts(accepted);
      })
      .catch(console.error)
      .finally(() => setLoadingLib(false));
  }, []);

  /* قيم responsive */
  const mainPadding   = isMobile ? '20px 12px 48px' : isTablet ? '28px 20px 56px' : '36px 20px 60px';
  const h1FontSize    = isMobile ? 22 : isTablet ? 26 : 32;
  const libPadding    = isMobile ? 20 : isTablet ? 24 : 32;
  const navPadding    = isMobile ? '0 14px' : '0 28px';
  const ctaFontSize   = isMobile ? 13 : 15;
  const ctaPadding    = isMobile ? '11px 22px' : '13px 32px';

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

        /* ── Responsive overrides ── */

        /* Tablet */
        @media (max-width: 1023px) {
          .day-header { flex-wrap: wrap; gap: 8px !important; }
          .day-divider { display: none !important; }
        }

        /* Mobile */
        @media (max-width: 639px) {
          .day-label { font-size: 9px !important; padding: 3px 8px !important; }
          .day-title { font-size: 14px !important; }
          .day-date  { font-size: 11px !important; }
          .lib-item  { flex-direction: column !important; align-items: flex-start !important; }
          .lib-item-btn { width: 100% !important; text-align: center !important; justify-content: center !important; display: flex !important; margin-top: 8px; }
          .lib-item-text { white-space: normal !important; }
          .footer-text { font-size: 11px !important; padding: 20px 14px !important; }
          .ecg-wrap { height: 36px !important; }
        }
      `}</style>

      

      {/* ── ECG ── */}
      <div className="ecg-wrap" style={{ height: isMobile ? 36 : 52, background: 'rgba(27,54,93,0.03)', borderBottom: '1px solid rgba(27,54,93,0.07)', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 52" preserveAspectRatio="none">
          <path className="ecg-line"
            d="M0 26 L80 26 L95 10 L110 42 L125 26 L250 26 L265 5 L285 47 L300 26 L500 26 L515 10 L530 42 L545 26 L700 26 L715 5 L735 47 L750 26 L900 26 L915 10 L930 42 L945 26 L1200 26"
            fill="none" stroke={R} strokeWidth="2.2" />
        </svg>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: mainPadding }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(200,16,46,0.07)', border: '1px solid rgba(200,16,46,0.2)',
            borderRadius: 50, padding: isMobile ? '4px 12px' : '5px 16px',
            fontSize: isMobile ? 11 : 12, fontWeight: 700, color: R, marginBottom: isMobile ? 12 : 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: R, display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }}></span>
            {lang === 'ar' ? 'البرنامج العلمي' : 'Scientific Program'}
          </div>

          <h1 style={{ fontSize: h1FontSize, fontWeight: 900, color: B, margin: '0 0 10px', lineHeight: 1.2 }}>
            {lang === 'ar' ? 'البرنامج العلمي والأجندة' : 'Scientific Program & Agenda'}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ width: isMobile ? 40 : 60, height: 2, background: `linear-gradient(90deg,transparent,${G})` }}></div>
            <span style={{ color: R, fontSize: isMobile ? 14 : 16 }}>♥</span>
            <div style={{ width: isMobile ? 40 : 60, height: 2, background: `linear-gradient(90deg,${G},transparent)` }}></div>
          </div>

          <p style={{ fontSize: isMobile ? 12 : 14, color: '#64748b', fontWeight: 500, padding: isMobile ? '0 8px' : 0 }}>
            {lang === 'ar'
              ? 'جدول الجلسات والمحاضرات — 4-5 ديسمبر 2026 | مجمع ميران، غزة'
              : 'Session Schedule — December 4-5, 2026 | Miran Complex, Gaza'}
          </p>
        </div>

        {/* ── PROGRAM DAYS ── */}
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
              {/* الخط الفاصل — يُخفى على الموبايل والتابلت عبر CSS */}
              <div className="day-divider" style={{ flex: 1, height: 1, background: `linear-gradient(${isRTL ? '270deg' : '90deg'},${G}80,transparent)` }}></div>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf2', overflow: 'hidden', padding: isMobile ? 10 : 16 }}>
              {day.sessions.map((s, si) => <SessionCard key={si} session={s} bp={bp} />)}
            </div>
          </div>
        ))}

        {/* ── LIBRARY PANEL ── */}
        <div style={{
          background: '#fff',
          border: '1px solid #e8edf2',
          borderRadius: 20,
          padding: libPadding,
          marginTop: 8,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${R},${G},${B})` }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 12 : 16, flexWrap: 'wrap' }}>
            <div style={{
              width: isMobile ? 38 : 46, height: isMobile ? 38 : 46,
              borderRadius: 12,
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isMobile ? 18 : 22, flexShrink: 0,
            }}>📚</div>
            <div>
              <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 900, color: B }}>
                {lang === 'ar' ? 'المكتبة الرقمية' : 'Digital Library'}
              </div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: '#94a3b8' }}>
                {lang === 'ar' ? 'ملخصات الأبحاث المعتمدة' : 'Approved Research Abstracts'}
                {acceptedAbstracts.length > 0 && (
                  <span style={{ marginRight: 8, marginLeft: 8, background: 'rgba(27,54,93,0.1)', color: B, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {acceptedAbstracts.length} {lang === 'ar' ? 'بحث' : 'papers'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p style={{ fontSize: isMobile ? 13 : 14, color: '#64748b', lineHeight: 1.8, marginBottom: isMobile ? 14 : 20 }}>
            {lang === 'ar'
              ? 'ملخصات الأبحاث العلمية المقبولة من اللجنة العلمية — متاحة للتحميل المباشر.'
              : 'Scientific abstracts approved by the Scientific Committee — available for direct download.'}
          </p>

          {loadingLib ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>
              ⏳ {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : acceptedAbstracts.length === 0 ? (
            <div style={{ background: '#F8FAFC', border: '1px dashed #e2e8f0', borderRadius: 12, padding: isMobile ? 20 : 28, textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 26 : 32, marginBottom: 10, opacity: 0.4 }}>🔒</div>
              <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                {lang === 'ar' ? 'لا يوجد أبحاث منشورة حالياً' : 'No published research yet'}
              </div>
              <div style={{ fontSize: 11, color: '#cbd5e1', fontFamily: 'monospace' }}>
                COMING SOON · {lang === 'ar' ? 'سيتم التحديث قريباً' : 'Updates coming soon'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {acceptedAbstracts.map((ab, i) => (
                <div key={i} className="lib-item" style={{
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
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lib-item-text" style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: B, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'normal' : 'nowrap' }}>
                      📄 {ab.title}
                    </div>
                    <div style={{ fontSize: isMobile ? 11 : 12, color: '#64748b' }}>
                      ✍️ {ab.authorName}
                      {ab.category && ab.category !== 'General' && (
                        <span style={{ marginRight: 8, marginLeft: 8, background: 'rgba(27,54,93,0.07)', color: B, padding: '1px 8px', borderRadius: 10, fontSize: 11 }}>
                          {ab.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={ab.filepath || ab.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="lib-item-btn"
                    style={{
                      padding: isMobile ? '8px 0' : '8px 18px',
                      width: isMobile ? '100%' : 'auto',
                      textAlign: 'center',
                      background: B, color: '#fff',
                      borderRadius: 8, fontSize: isMobile ? 12 : 12,
                      fontWeight: 700, textDecoration: 'none',
                      whiteSpace: 'nowrap', flexShrink: 0,
                      transition: 'all .2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = R; }}
                    onMouseLeave={e => { e.currentTarget.style.background = B; }}>
                    📥 {lang === 'ar' ? 'تحميل' : 'Download'}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: 'center', marginTop: isMobile ? 28 : 40 }}>
          <Link href="/participation" style={{
            padding: ctaPadding,
            background: R, color: '#fff',
            borderRadius: 12,
            fontFamily: "'Cairo',sans-serif",
            fontSize: ctaFontSize,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(200,16,46,0.2)',
          }}>
            📄 {lang === 'ar' ? 'قدّم بحثك الآن' : 'Submit Your Research'}
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer-text" style={{ padding: isMobile ? '20px 14px' : '28px 40px', borderTop: '1px solid #e8edf2', textAlign: 'center', color: '#94a3b8', fontSize: isMobile ? 11 : 13, background: '#fff' }}>
        {lang === 'ar' ? '© 2026 مؤتمر الصمود والاستدامة الطبي' : '© 2026 Medical Resilience & Sustainability Conference'}
      </footer>
    </div>
  );
}