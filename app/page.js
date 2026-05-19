"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
import { useLang } from '@/context/LangContext';

function proxyImg(url) {
  if (!url) return "";
  if (url.includes("vercel-storage.com") || url.includes("blob.vercel")) {
    return `/api/gallery/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/* ─── Constants (outside component to avoid re-creation) ─── */
const B = '#1B365D', R = '#C8102E', G = '#D4AF37';
const STAT_ICONS  = ['🎤','🔬','👥','🌍'];
const STAT_COLORS = [R, B, '#0e7490', '#047857'];
const TARGETS     = { speakers:20, sessions:15, attendees:1000, countries:5 };

// ✅ تم تعديل المصفوفة هنا لتطابق الامتدادات الفعلية لملفاتك لضمان عدم ظهور صور مكسورة
const MEDIA_ITEMS_FALLBACK = [
  { src: '/img1.jpg', captionAr: 'حفل افتتاح المؤتمر العلمي', captionEn: 'Conference Opening Ceremony', tag: 'فعاليات', tagEn: 'Events' },
  { src: '/img2.jpg', captionAr: 'جانب من الحضور الكريم', captionEn: 'A Side of Attendees', tag: 'فعاليات', tagEn: 'Events' },
  { src: '/img3.jpg', captionAr: 'ورشة العمل الطبية الأولى', captionEn: 'First Medical Workshop', tag: 'ورش', tagEn: 'Workshops' },
  { src: '/img4.jpg', captionAr: 'جلسة مناقشة الأبحاث الطبية', captionEn: 'Medical Research Discussion', tag: 'جلسات', tagEn: 'Sessions' },
  { src: '/img5.jpeg', captionAr: 'المتحدثون الرئيسيون في المؤتمر', captionEn: 'Keynote Speakers', tag: 'متحدثون', tagEn: 'Speakers' },
  { src: '/img6.jpg', captionAr: 'تكريم اللجان المنظمة', captionEn: 'Honoring Organizers', tag: 'فعاليات', tagEn: 'Events' },
  { src: '/img7.jpg', captionAr: 'المعرض الطبي المصاحب', captionEn: 'Accompanying Medical Exhibition', tag: 'أخرى', tagEn: 'Other' },
  { src: '/img8.jpeg', captionAr: 'جلسة النقاف الثانية', captionEn: 'Second Discussion Session', tag: 'جلسات', tagEn: 'Sessions' },
  { src: '/img9.jpeg', captionAr: 'ورشة عمل طب الباطنة', captionEn: 'Internal Medicine Workshop', tag: 'ورش', tagEn: 'Workshops' },
  { src: '/img10.jpeg', captionAr: 'استراحة المشاركين وتبادل الخبرات', captionEn: 'Participants Break', tag: 'أخرى', tagEn: 'Other' },
  { src: '/img12.jpg', captionAr: 'حلقة نقاشية مغلقة والأبحاث المقترحة', captionEn: 'Closed Panel Discussion', tag: 'جلسات', tagEn: 'Sessions' },
  { src: '/img13.jpg', captionAr: 'عرض الأبحاث الطبية والبوسترات', captionEn: 'Poster Presentations', tag: 'أخرى', tagEn: 'Other' },
  { src: '/img14.jpg', captionAr: 'تكريم المتحدثين الدوليين والمشاركين', captionEn: 'Honoring International Speakers', tag: 'متحدثون', tagEn: 'Speakers' },
  { src: '/img15.jpg', captionAr: 'الصورة الجماعية الختامية للمؤتمر', captionEn: 'Closing Group Photo', tag: 'فعاليات', tagEn: 'Events' },
  { src: '/img16.jpg', captionAr: 'مجمع ناصر الطبي المنصة الساندة', captionEn

/* ─── Translations (outside component) ─── */
const TRANSLATIONS = {
  ar: {
    dir:'rtl',
    conferenceTitle:'المؤتمر الطبي الدولي الثاني عشر',
    conferenceSub:'للصمود والاستدامة في الطوارئ والاستجابة الإنسانية',
    btnReg:'قدم بحثك الآن', btnProg:'البرنامج العلمي', watchVideo:'شاهد الفيلم التعريفي',
    statsLbls:['متحدث دولي','جلسة علمية','مشترك متوقع','دولة مشاركة'],
    newsTitle:'أخبار المؤتمر',
    membersLbl:'رئيس اللجنة', expertiseLbl:'التخصصات',
    galleryTitle:'معرض الوسائط', gallerySub:'لقطات من فعاليات المؤتمر',
    leadersTitle:'قيادة المؤتمر',
    committeesTitle:'لجان المؤتمر',
    presidentQuoteLabel:'كلمة رئيس المؤتمر',
    presidentQuote:'قال تعالى: {وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ}.\n\nالزملاء الأعزاء، بعد ثلاث سنوات من قهر العدوان، نعود لنوقد شعلة العلم. ننحني إجلالاً لشهدائنا وأسرانا وجرحانا من الكوادر الطبية الذين جسدوا أسمى معاني التضحية. شكراً لكل يدٍ ستبني نجاح مؤتمرنا الباطني الثاني عشر.\n\nوفقكم الله لما يحب ويرضى.',
    presidentFooter:'رئيس المؤتمر الطبي الدولي · 2026',
    mediaCaptions:[{caption:'مجمع ناصر الطبي',tag:'مستشفى'},{caption:'حفل الافتتاح',tag:'فعاليات'},{caption:'ورشة عمل طبية',tag:'ورش'},{caption:'المتحدثون الدوليون',tag:'متحدثون'},{caption:'جلسة التحكيم',tag:'جلسات'}],
    president:{ name:'د. أحمد جمعة الروبي', role:'رئيس المؤتمر', title:'مدير مشفى الباطنة — استشاري الأمراض الباطنية', bio:'طبيب استشاري متخصص في الأمراض الباطنية، يشغل منصب مدير قسم الباطنة، وله خبرة واسعة في إدارة الحالات الطبية المعقدة والإشراف على البحث العلمي.', email:'rubai@medical.edu', phone:'+970-8-2816-1010', image:'/Mohamed_El_Rouby.jpg', expertise:['الأمراض الباطنية','إدارة الأقسام','البحث العلمي'] },
    supervisor:{ name:'د. عمرو الأسطل', role:'المشرف العام', title:'استشاري الأمراض الرئوية والعناية المركزة — أمريكا', bio:'استشاري دولي في الأمراض الرئوية والعناية المركزة، متمرس في المستشفيات الأمريكية، ويُشرف على الجانب العلمي والتنظيمي للمؤتمر.', email:'astal@medical.edu', phone:'+1-555-000-1234', image:'/Amr_Al_Astal.jpg', expertise:['الأمراض الرئوية','العناية المركزة','الطب الدولي'] },
    committees:[
      {name:'اللجنة التحضيرية',icon:'🏗️',desc:'تشرف على التخطيط العام للمؤتمر وتنسيق الجدول الزمني.',members:['د. محمد خطاب قنديل'],head:{ name:'د. محمد خطاب قنديل', title:'استشاري طب الطوارئ والحالات الحرجة', bio:'استشاري طب الطوارئ والحالات الحرجة، يعمل حاليا في غزة وسابقا في الدوحة. حاصل على البورد العربي والزمالة البريطانية في تخصصه.', email:'khatab@medical.edu', phone:'+970-8-2816-2020', image:'/Mohamed_Khattab_Qandil.jpg', expertise:['طب الطوارئ','الحالات الحرجة','التعليم الطبي'] }},
      {name:'اللجنة العلمية',icon:'🔬',desc:'مسؤولة عن مراجعة الأبحاث وتحديد المحاور العلمية.',members:['د. محمود الشيخ علي'],head:{ name:'د. محمود الشيخ علي', title:'استشاري الطب الباطني والمناظير', bio:'استشاري الطب الباطني والمناظير مع خبرة عميقة في مجاله. حاصل على الزمالة البريطانية في الطب الباطني.', email:'drmnali@gmail.com', phone:'+972-56-703-3314', image:'/Mahmoud_Al_Sheikh_Ali.jpg', expertise:['الطب الباطني','المناظير','تقييم الأبحاث'] }},
      {name:'اللجنة الإعلامية',icon:'📢',desc:'تتولى التغطية الصحفية وإدارة منصات التواصل والموقع.',members:['د. مازن سليمان صافي'],head:{ name:'د. مازن سليمان صافي', title:'رئيس قسم الأدوية المخدرة والمراقبة — مجمع ناصر الطبي', bio:'رئيس قسم الأدوية المخدرة والمراقبة بمجمع ناصر الطبي، نائب مدير الصيدلية. متخصص في الإعلام الطبي وكاتب محتوى احترافي دولي.', email:'mazen@nasermedical.edu', phone:'+970-8-2822-2222', image:'/Mazen_Suleiman_Safi.jpg', expertise:['الأمراض المخدرة','إدارة الصيدلية','الإعلام الطبي','القيادة والتدريب'] }},
    ],
    news:[
      {title:'فتح باب استقبال الأبحاث',date:'١ مايو ٢٠٢٦',icon:'📋',content:'نعلمكم أنه تم فتح باب استقبال الأبحاث العلمية ابتداءً من 1/5/2026 وحتى 30/9/2026.'},
      {title:'تأكيد مشاركة متحدثين دوليين',date:'٢٠ أبريل ٢٠٢٦',icon:'🌍',content:'يسعدنا الإعلان عن تأكيد مشاركة متحدثين دوليين من أوروبا وأمريكا.'},
      {title:'موعد المؤتمر ٤-٥ ديسمبر ٢٠٢٦',date:'١ أبريل ٢٠٢٦',icon:'📅',content:'يُعقد المؤتمر في مجمع ناصر الطبي، غزة، بتاريخ 4-5 ديسمبر 2026.'},
    ],
    footer:'© 2026 مؤتمر الصمود والاستدامة الطبي',
    execCommittee:'لجنة تنفيذية',
    presidentBadge:'رئيس المؤتمر', supervisorBadge:'مشرف عام',
    quickLinks:'روابط سريعة',
    quickLinksItems:[
      { icon:'🖥️', label:'شاشات تفاعلية', href:'/media' },
      { icon:'📄', label:'تقديم الأبحاث', href:'/participation' },
      { icon:'🌍', label:'بث مباشر', href:'/live' },
      { icon:'📋', label:'جدول المؤتمر', href:'/program' },
    ],
    edition:'• المؤتمر الثاني عشر •',
    videoLabel:'فيديو',
    noVideo:'سيتم تحميل الفيديو قريباً',
  },
  en: {
    dir:'ltr',
    conferenceTitle:'12th International Medical Conference',
    conferenceSub:'Resilience & Sustainability in Emergency & Humanitarian Response',
    btnReg:'Register Now', btnProg:'Scientific Program', watchVideo:'Watch Promo Video',
    statsLbls:['International Speakers','Scientific Sessions','Expected Attendees','Participating Countries'],
    newsTitle:'Conference News',
    membersLbl:'Committee Head', expertiseLbl:'Expertise',
    galleryTitle:'Media Gallery', gallerySub:'Highlights from conference events',
    leadersTitle:'Conference Leadership',
    committeesTitle:'Committees',
    presidentQuoteLabel:"President's Message",
    presidentQuote:"It is my honor to welcome you to the International Medical Conference on Resilience and Sustainability.\n\nThis scientific forum embodies our noble mission: advancing healthcare standards and exchanging medical knowledge even in the most challenging of times.",
    presidentFooter:'Conference President · International Medical Conference 2026',
    mediaCaptions:[{caption:'Nasser Medical Complex',tag:'Hospital'},{caption:'Opening Ceremony',tag:'Events'},{caption:'Medical Workshop',tag:'Workshops'},{caption:"Int'l Speakers",tag:'Speakers'},{caption:'Review Session',tag:'Sessions'}],
    president:{ name:'Dr. Ahmed Jumaa Al-Rubai', role:'Conference President', title:'Head of Internal Medicine — Consultant Internist', bio:'Consultant specialist in internal medicine, serving as Head of the Internal Medicine Department, with extensive experience in complex case management and scientific research oversight.', email:'rubai@medical.edu', phone:'+970-8-2816-1010', image:'/Mohamed_El_Rouby.jpg', expertise:['Internal Medicine','Department Management','Scientific Research'] },
    supervisor:{ name:'Dr. Omar Al-Astal', role:'General Supervisor', title:'Pulmonology & Critical Care — USA', bio:'International consultant in pulmonology and critical care, experienced in American hospitals, overseeing the scientific and organizational aspects of the conference.', email:'astal@medical.edu', phone:'+1-555-000-1234', image:'/Amr_Al_Astal.jpg', expertise:['Pulmonology','Critical Care',"Int'l Medicine"] },
    committees:[
      {name:'Preparatory Committee',icon:'🏗️',desc:'Oversees general planning and timeline coordination.',members:['Dr. Mohammad Qandil'],head:{ name:'Dr. Mohammed Khatab Qandil', title:'Emergency Medicine & Critical Care Consultant', bio:'Consultant in Emergency Medicine and Critical Care, currently working in Gaza and previously in Doha. Holds the Arab Board and British Fellowship in his specialty.', email:'khatab@medical.edu', phone:'+970-8-2816-2020', image:'/Mohamed_Khattab_Qandil.jpg', expertise:['Emergency Medicine','Critical Care','Medical Education'] }},
      {name:'Scientific Committee',icon:'🔬',desc:'Reviews abstracts, sets themes, and selects speakers.',members:['Dr. Mahmoud Al-Sheikh Ali'],head:{ name:'Dr. Mahmoud Al-Sheikh Ali', title:'Consultant Internal Medicine & Endoscopy', bio:'Consultant in Internal Medicine and Endoscopy. Holds the British Fellowship in Internal Medicine. Head of the Scientific Committee.', email:'sheikh@medical.edu', phone:'+970-8-2816-3030', image:'/Mahmoud_Al_Sheikh_Ali.jpg', expertise:['Internal Medicine','Endoscopy','Research Evaluation'] }},
      {name:'Media Committee',icon:'📢',desc:'Handles press coverage and social media management.',members:['Dr. Mazen Soliman Safi'],head:{ name:'Dr. Mazen Soliman Safi', title:'Head of Controlled Medications Department — Nasser Medical Complex', bio:'Head of Controlled Medications at Nasser Medical Complex. Specialist in medical media and professional content writer.', email:'mazen@nasermedical.edu', phone:'+970-8-2822-2222', image:'/Mazen_Suleiman_Safi.jpg', expertise:['Controlled Medications','Pharmacy Management','Medical Media','Leadership & Training'] }},
    ],
    news:[
      {title:'Abstract Submission Open',date:'May 1, 2026',icon:'📋',content:'Abstract submission is open from May 1st to June 30th, 2026.'},
      {title:"Int'l Speakers Confirmed",date:'Apr 20, 2026',icon:'🌍',content:'International speakers from Europe and USA have been confirmed.'},
      {title:'Conference: Dec 4–5, 2026',date:'Apr 1, 2026',icon:'📅',content:'The conference will be held at Nasser Medical Complex, Gaza.'},
    ],
    footer:'© 2026 Medical Resilience & Sustainability Conference',
    execCommittee:'Executive Committee',
    presidentBadge:'Conference President', supervisorBadge:'General Supervisor',
    quickLinks:'Quick Links',
    quickLinksItems:[
      { icon:'🖥️', label:'Interactive Screens', href:'/media' },
      { icon:'📄', label:'Research Submission', href:'/participation' },
      { icon:'🌍', label:'Live Stream', href:'/live' },
      { icon:'📋', label:'Schedule', href:'/program' },
    ],
    edition:'• 12th EDITION •',
    videoLabel:'Video',
    noVideo:'Video will be available soon',
  },
};

/* ─── useBreakpoint hook ─── */
function useBreakpoint() {
  const [bp, setBp] = useState('desktop');
  useEffect(() => {
    const check = () => setBp(
      window.innerWidth < 640  ? 'mobile'  :
      window.innerWidth < 1100 ? 'tablet'  : 'desktop'
    );
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return bp;
}

/* ─── ParticlesBackground ─── */
function ParticlesBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.5,
      dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.45 + 0.1,
      color: Math.random() > 0.5 ? G : B,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 110) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = G; ctx.globalAlpha = (1 - dist / 110) * 0.12;
            ctx.lineWidth = 0.8; ctx.stroke();
          }
        });
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.6 }} />;
}

/* ─── Avatar ─── */
function Avatar({ src, name, size = 64, border = 3, float = false }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', border:`${border}px solid ${G}`, boxShadow:`0 4px 16px rgba(27,54,93,0.12)`, background:'#eef2f7', flexShrink:0, animation: float ? 'float-avatar 3.5s ease-in-out infinite' : 'none' }}>
      <img src={src || '/president.png'} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=300&name=${encodeURIComponent(name)}`; }} />
    </div>
  );
}

/* ─── PresidentQuoteSlide (standalone, receives t as prop) ─── */
function PresidentQuoteSlide({ t, isRtl }) {
  const [open, setOpen] = useState(false);
  const president = t.president;
  return (
    <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${G}35`, overflow:'hidden', boxShadow:'0 4px 18px rgba(27,54,93,0.07)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background: open ? `linear-gradient(135deg,${B}06,${G}10)` : '#fff', border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", borderBottom: open ? `1px solid ${G}22` : 'none', transition:'background 0.3s' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', overflow:'hidden', border:`3px solid ${open ? G : '#e2e8f0'}`, flexShrink:0, transition:'border-color .3s, box-shadow .3s', boxShadow: open ? `0 0 16px 4px ${G}45` : 'none', animation: open ? 'float-avatar 3.5s ease-in-out infinite' : 'none' }}>
          <img src={president.image} alt={president.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=200&name=${encodeURIComponent(president.name)}`; }} />
        </div>
        <div style={{ flex:1, textAlign: isRtl ? 'right' : 'left' }}>
          <div style={{ fontSize:13, fontWeight:900, color:B, display:'flex', alignItems:'center', gap:6 }}>
            <span>💬</span>{t.presidentQuoteLabel}
          </div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{president.name}</div>
        </div>
        <div style={{ width:28, height:28, borderRadius:'50%', background: open ? G : `${G}15`, border:`1px solid ${G}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color: open ? B : '#9A7A10', transition:'all .35s', transform: open ? 'rotate(180deg)' : 'rotate(0)', flexShrink:0, fontWeight:900 }}>▼</div>
      </button>
      {open && (
        <div style={{ overflow:'hidden', animation:'slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{ padding:'16px 16px 18px' }}>
            <div style={{ position:'relative', fontSize:13, color:'#374151', lineHeight:2.1, background:`linear-gradient(135deg,#F8FAFC,#fef9ee)`, borderRadius:12, border:`1px solid ${G}22`, [isRtl ? 'borderRight' : 'borderLeft']:`3px solid ${G}`, padding:'14px 18px' }}>
              <span style={{ fontSize:44, color:`${G}28`, fontFamily:'serif', lineHeight:0, position:'absolute', top:24, [isRtl ? 'right' : 'left']:8, pointerEvents:'none' }}>"</span>
              <div style={{ [isRtl ? 'paddingRight' : 'paddingLeft']:26 }}>
                {t.presidentQuote.split('\n\n').map((para, i, arr) => (
                  <span key={i} style={{ display:'block', marginBottom: i < arr.length - 1 ? 12 : 0 }}>{para}</span>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12, paddingTop:10, borderTop:`1px solid ${B}08`, flexWrap:'wrap', gap:8 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:800, color:B }}>{president.name}</div>
                <div style={{ fontSize:10.5, color:'#94a3b8', marginTop:2 }}>{t.presidentFooter}</div>
              </div>
              <div style={{ fontSize:10.5, fontWeight:700, color:'#7a5c1a', background:`${G}12`, border:`1px solid ${G}25`, padding:'3px 10px', borderRadius:20, direction:'ltr' }}>📧 {president.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
    MAIN COMPONENT
══════════════════════════════════════════ */
export default function Home() {
  const { lang } = useLang();
  const t     = useMemo(() => TRANSLATIONS[lang] ?? TRANSLATIONS.ar, [lang]);
  const isRtl = lang === 'ar';

  const [modal,            setModal]            = useState(null);
  const [counts,           setCounts]           = useState({ speakers:0, sessions:0, attendees:0, countries:0 });
  const [visible,          setVisible]          = useState({});
  const [activeSlide,      setActiveSlide]      = useState(0);
  const [isDragging,       setIsDragging]       = useState(false);
  const [dragStart,        setDragStart]        = useState(0);
  const [dragDelta,        setDragDelta]        = useState(0);
  const [videoOpen,        setVideoOpen]        = useState(false);
  const [mediaItems, setMediaItems] = useState(MEDIA_ITEMS_FALLBACK);
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/gallery/media')
      .then(r => r.json())
      .then(d => {
        if (d.items && d.items.length > 0) setMediaItems(d.items);
      })
      .catch(() => {});
  }, []);
  
  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        const published = data.items?.filter(item => item.published !== false) || [];
        setNewsItems(published);
        setNewsLoading(false);
      })
      .catch(() => {
        setNewsLoading(false);
      });
  }, []);

  const [hoveredStat,      setHoveredStat]      = useState(null);
  const [hoveredNews,      setHoveredNews]      = useState(null);
  const [hoveredLeader,    setHoveredLeader]    = useState(null);
  const [hoveredCommittee, setHoveredCommittee] = useState(null);
  const [hoveredLink,      setHoveredLink]      = useState(null);

  const statsRef = useRef(null);
  const animated = useRef(false);
  const sliderRef = useRef(null);
  const autoPlay  = useRef(null);

  const bp       = useBreakpoint();
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';

  const NAV_H      = isMobile ? 64 : isTablet ? 90 : 130;
  const STICKY_TOP = NAV_H + 38 + 8;
  const SLIDE_H    = isMobile ? 220 : isTablet ? 300 : 400;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated.current) {
        animated.current = true;
        const dur = 1800, t0 = performance.now();
        const step = (now) => {
          const p = Math.min((now - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
          setCounts({
            speakers:  Math.round(TARGETS.speakers  * ease),
            sessions:  Math.round(TARGETS.sessions  * ease),
            attendees: Math.round(TARGETS.attendees * ease),
            countries: Math.round(TARGETS.countries * ease),
          });
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    animated.current = false;
    setVisible({});
    const tm = setTimeout(() => {
      setVisible(p => ({ ...p, hero:true, stats:true, gallery:true }));
      const els = document.querySelectorAll('[data-reveal]');
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.getAttribute('data-reveal')]:true }));
        }),
        { threshold: 0.1 }
      );
      els.forEach(el => obs.observe(el));
      return () => obs.disconnect();
    }, 100);
    return () => clearTimeout(tm);
  }, [lang]);

  useEffect(() => {
    autoPlay.current = setInterval(() => setActiveSlide(p => (p + 1) % mediaItems.length), 5000);
    return () => clearInterval(autoPlay.current);
  }, [mediaItems.length]);

  const goTo = (idx) => {
    setActiveSlide((idx + mediaItems.length) % mediaItems.length);
    clearInterval(autoPlay.current);
    autoPlay.current = setInterval(() => setActiveSlide(p => (p + 1) % mediaItems.length), 5000);
  };
  const onDragStart = x => { setIsDragging(true); setDragStart(x); setDragDelta(0); };
  const onDragMove  = x => { if (!isDragging) return; setDragDelta(x - dragStart); };
  const onDragEnd   = () => {
    if (!isDragging) return; setIsDragging(false);
    if (dragDelta < -60) goTo(activeSlide + 1);
    else if (dragDelta > 60) goTo(activeSlide - 1);
    setDragDelta(0);
  };

  const rev = (id, delay = 0) => ({
    opacity:   visible[id] ? 1 : 0,
    transform: visible[id] ? 'translateY(0)' : 'translateY(32px)',
    transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const slideTranslate = `translateX(calc(${isRtl ? '+' : '-'}${activeSlide * 100}% + ${isRtl ? -dragDelta : dragDelta}px))`;

  const statVals = [
    counts.speakers   === TARGETS.speakers   ? `${TARGETS.speakers}+`  : String(counts.speakers),
    counts.sessions   === TARGETS.sessions   ? `${TARGETS.sessions}+`  : String(counts.sessions),
    counts.attendees === TARGETS.attendees ? '1K+'                    : String(counts.attendees),
    counts.countries === TARGETS.countries ? `${TARGETS.countries}+` : String(counts.countries),
  ];

  /* ─── SidebarRight useMemo ─── */
  const SidebarRight = useMemo(() => () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* LOGO / CTA CARD */}
      <div style={{ background:`linear-gradient(160deg,#FAFBFD,#F2F6FB,#EBF0F8)`, borderRadius:18, overflow:'hidden', boxShadow:`0 4px 24px rgba(27,54,93,0.1),0 0 0 1px ${G}35`, border:`1px solid ${G}30`, position:'relative' }}>
        <div style={{ height:5, background:`linear-gradient(90deg,${R},${G},${R})`, backgroundSize:'200% 100%', animation:'shimmer-border 2.5s linear infinite' }}/>
        <div style={{ padding:'20px 18px', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${G},#b8941f)`, color:'#1a1000', fontSize:11, fontWeight:900, padding:'4px 16px', borderRadius:30, marginBottom:14, letterSpacing:'1px' }}>
            {t.edition}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Link href="/participation" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:`linear-gradient(135deg,${R},#a80d24)`, color:'#fff', borderRadius:11, fontFamily:"'Cairo',sans-serif", fontSize:14, fontWeight:800, textDecoration:'none', boxShadow:`0 4px 14px ${R}40`, transition:'transform 0.22s, box-shadow 0.22s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 8px 22px ${R}55`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 14px ${R}40`; }}>
              🎫 {t.btnReg}
            </Link>
            <Link href="/program" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', background:'#fff', color:B, borderRadius:11, fontFamily:"'Cairo',sans-serif", fontSize:13.5, fontWeight:700, textDecoration:'none', border:`1.5px solid ${B}25`, transition:'transform 0.22s, border-color 0.22s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = G; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = `${B}25`; }}>
              🎓 {t.btnProg}
            </Link>
          </div>
        </div>
      </div>

      {/* LEADERS */}
      <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${G}28`, overflow:'hidden', boxShadow:'0 3px 14px rgba(27,54,93,0.07)' }}>
        <div style={{ padding:'12px 16px', background:`linear-gradient(135deg,${B}06,${G}08)`, borderBottom:`1px solid ${B}0c`, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>👥</span>
          <span style={{ fontSize:14, fontWeight:900, color:B }}>{t.leadersTitle}</span>
        </div>
        {[
          { data: t.president,  badge: t.presidentBadge,  bc: R },
          { data: t.supervisor, badge: t.supervisorBadge, bc: '#9A7A10' },
        ].map(({ data, badge, bc }, idx) => (
          <div key={idx}
            onClick={() => setModal({ type:'person', data })}
            onMouseEnter={() => setHoveredLeader(idx)}
            onMouseLeave={() => setHoveredLeader(null)}
            style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom: idx === 0 ? `1px solid ${B}08` : 'none', cursor:'pointer', background: hoveredLeader === idx ? `linear-gradient(135deg,${G}06,${B}04)` : '#fff', transition:'background 0.25s, transform 0.25s', transform: hoveredLeader === idx ? (isRtl ? 'translateX(-3px)' : 'translateX(3px)') : 'translateX(0)' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <Avatar src={data.image} name={data.name} size={isMobile ? 52 : 64} border={3} float={hoveredLeader === idx} />
              <div style={{ position:'absolute', bottom:-2, [isRtl ? 'left' : 'right']:-2, width:18, height:18, borderRadius:'50%', background:bc, border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff', fontWeight:900 }}>✓</div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, fontWeight:800, color:bc, marginBottom:3, background:`${bc}12`, padding:'2px 8px', borderRadius:20, display:'inline-block' }}>{badge}</div>
              <div style={{ fontSize:13, fontWeight:900, color:B, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.name}</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.title.split('—')[0].trim()}</div>
            </div>
            <span style={{ color: hoveredLeader === idx ? G : '#cbd5e1', fontSize:14, flexShrink:0, transition:'color 0.2s' }}>{isRtl ? '‹' : '›'}</span>
          </div>
        ))}
      </div>

      {/* COMMITTEES */}
      <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${G}28`, overflow:'hidden', boxShadow:'0 3px 14px rgba(27,54,93,0.07)' }}>
        <div style={{ padding:'12px 16px', background:`linear-gradient(135deg,${B}06,${G}08)`, borderBottom:`1px solid ${B}0c`, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>🏛️</span>
          <span style={{ fontSize:14, fontWeight:900, color:B }}>{t.committeesTitle}</span>
        </div>
        {t.committees.map((c, i) => (
          <button key={i}
            onClick={() => setModal({ type:'committee', data:c })}
            onMouseEnter={() => setHoveredCommittee(i)}
            onMouseLeave={() => setHoveredCommittee(null)}
            style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'13px 16px', background: hoveredCommittee === i ? `linear-gradient(135deg,${G}08,${B}04)` : '#fff', border:'none', borderBottom: i < t.committees.length - 1 ? `1px solid ${B}07` : 'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", color:B, textAlign: isRtl ? 'right' : 'left', transition:'background 0.25s, transform 0.22s', transform: hoveredCommittee === i ? (isRtl ? 'translateX(-3px)' : 'translateX(3px)') : 'translateX(0)' }}>
            <div style={{ width:38, height:38, borderRadius:10, background: hoveredCommittee === i ? `linear-gradient(135deg,${G}25,${B}20)` : `linear-gradient(135deg,${B}08,${G}12)`, border:`1px solid ${G}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, transition:'transform 0.25s', transform: hoveredCommittee === i ? 'rotate(8deg) scale(1.1)' : 'rotate(0) scale(1)' }}>{c.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:800, color:B, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.members[0]}</div>
            </div>
            <span style={{ color: hoveredCommittee === i ? G : '#cbd5e1', fontSize:14, flexShrink:0, transition:'color 0.2s' }}>{isRtl ? '‹' : '›'}</span>
          </button>
        ))}
      </div>
    </div>
  ), [t, isRtl, hoveredLeader, hoveredCommittee, isMobile, isTablet]);

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', minHeight:'100vh', paddingBottom:60, position:'relative', zIndex:1, fontFamily:"'Cairo',sans-serif" }}>
      <ParticlesBackground />
      
      {/* HERO SECTION */}
      <div style={{ padding:'40px 20px', maxWidth:1200, margin:'0 auto', textAlign:'center', ...rev('hero', 0.1) }}>
        <h1 style={{ fontSize: isMobile ? 24 : 36, fontWeight:900, color:B, marginBottom:10 }}>{t.conferenceTitle}</h1>
        <p style={{ fontSize: isMobile ? 14 : 18, color:'#475569', maxWidth:800, margin:'0 auto 30px', lineHeight:1.6 }}>{t.conferenceSub}</p>
      </div>

      {/* STATS SECTION */}
      <div ref={statsRef} style={{ padding:'20px', maxWidth:1200, margin:'0 auto 40px', display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap:16, ...rev('stats', 0.2) }}>
        {t.statsLbls.map((lbl, i) => (
          <div key={i}
            onMouseEnter={() => setHoveredStat(i)}
            onMouseLeave={() => setHoveredStat(null)}
            style={{ background:'#fff', padding:20, borderRadius:12, border:`1px solid ${G}20`, boxShadow:'0 4px 12px rgba(0,0,0,0.03)', textAlign:'center', transition:'all 0.3s', transform: hoveredStat === i ? 'translateY(-4px)' : 'none' }}>
            <div style={{ fontSize:30, marginBottom:8 }}>{STAT_ICONS[i]}</div>
            <div style={{ fontSize:24, fontWeight:900, color:STAT_COLORS[i] }}>{statVals[i]}</div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 20px', display:'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '2fr 1fr', gap:24 }}>
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          
          {/* PRESIDENT MESSAGE */}
          <PresidentQuoteSlide t={t} isRtl={isRtl} />

          {/* MEDIA GALLERY */}
          <div style={{ background:'#fff', p:20, borderRadius:16, border:`1px solid ${G}20`, padding:20, boxShadow:'0 4px 12px rgba(0,0,0,0.03)', ...rev('gallery', 0.3) }}>
            <h2 style={{ fontSize:18, fontWeight:900, color:B, marginBottom:4 }}>{t.galleryTitle}</h2>
            <p style={{ fontSize:12, color:'#64748b', marginBottom:16 }}>{t.gallerySub}</p>
            
            {/* SLIDER CONTAINER */}
            <div ref={sliderRef}
              onTouchStart={e => onDragStart(e.touches[0].clientX)}
              onTouchMove={e => onDragMove(e.touches[0].clientX)}
              onTouchEnd={onDragEnd}
              onMouseDown={e => onDragStart(e.clientX)}
              onMouseMove={e => onDragMove(e.clientX)}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              style={{ height: SLIDE_H, borderRadius:12, overflow:'hidden', position:'relative', cursor: isDragging ? 'grabbing' : 'grab', userSelect:'none' }}>
              
              <div style={{ display:'flex', width:'100%', height:'100%', transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)', transform: slideTranslate }}>
                {mediaItems.map((item, idx) => (
                  <div key={idx} style={{ minWidth:'100%', width:'100%', height:'100%', position:'relative' }}>
                    <img src={proxyImg(item.src)} alt={isRtl ? item.captionAr : item.captionEn} style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent, rgba(0,0,0,0.85))', padding:'40px 16px 16px', color:'#fff' }}>
                      <span style={{ background:R, fontSize:10, padding:'2px 8px', borderRadius:4, fontWeight:700 }}>{isRtl ? item.tag : item.tagEn}</span>
                      <h3 style={{ fontSize:14, fontWeight:700, marginTop:6 }}>{isRtl ? item.captionAr : item.captionEn}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* SLIDER NAVIGATION ARROWS */}
              <button onClick={() => goTo(activeSlide - 1)} style={{ position:'absolute', top:'50%', [isRtl ? 'right' : 'left']:12, transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.85)', border:'none', cursor:'pointer', fontWeight:900, color:B }}>{isRtl ? '›' : '‹'}</button>
              <button onClick={() => goTo(activeSlide + 1)} style={{ position:'absolute', top:'50%', [isRtl ? 'left' : 'right']:12, transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.85)', border:'none', cursor:'pointer', fontWeight:900, color:B }}>{isRtl ? '‹' : '›'}</button>
            </div>

            {/* SLIDER DOTS */}
            <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:12 }}>
              {mediaItems.map((_, idx) => (
                <button key={idx} onClick={() => goTo(idx)} style={{ width: idx === activeSlide ? 20 : 8, height:8, borderRadius:4, background: idx === activeSlide ? G : '#cbd5e1', border:'none', transition:'all 0.3s', cursor:'pointer' }} />
              ))}
            </div>
          </div>

          {/* NEWS SECTION */}
          <div style={{ background:'#fff', padding:20, borderRadius:16, border:`1px solid ${G}20`, boxShadow:'0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize:18, fontWeight:900, color:B, marginBottom:16 }}>{t.newsTitle}</h2>
            {newsLoading ? (
              <div style={{ textAlign:'center', color:'#64748b', padding:'20px 0' }}>⏳ Loading...</div>
            ) : newsItems.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {t.news.map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:14, padding:14, borderRadius:10, border:'1px solid #f1f5f9', background:'#f8fafc' }}>
                    <div style={{ fontSize:24 }}>{item.icon}</div>
                    <div>
                      <h3 style={{ fontSize:14, fontWeight:700, color:B }}>{item.title}</h3>
                      <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{item.date}</p>
                      <p style={{ fontSize:12, color:'#475569', marginTop:6, lineHeight:1.5 }}>{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {newsItems.map((item, i) => (
                  <div key={item.id || i}
                    onMouseEnter={() => setHoveredNews(i)}
                    onMouseLeave={() => setHoveredNews(null)}
                    style={{ display:'flex', gap:14, padding:14, borderRadius:10, border: hoveredNews === i ? `1px solid ${G}60` : '1px solid #f1f5f9', background: hoveredNews === i ? `linear-gradient(135deg,#fff,${G}04)` : '#f8fafc', transition:'all 0.25s' }}>
                    <div style={{ fontSize:24 }}>{item.icon || '📋'}</div>
                    <div style={{ flex:1 }}>
                      <h3 style={{ fontSize:14, fontWeight:700, color:B }}>{isRtl ? item.titleAr : item.titleEn}</h3>
                      <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{isRtl ? item.dateAr : item.dateEn}</p>
                      <p style={{ fontSize:12, color:'#475569', marginTop:6, lineHeight:1.5 }}>{isRtl ? item.contentAr : item.contentEn}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <SidebarRight />
          
          {/* QUICK LINKS SECTION */}
          <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${G}28`, overflow:'hidden', boxShadow:'0 3px 14px rgba(27,54,93,0.07)' }}>
            <div style={{ padding:'12px 16px', background:`linear-gradient(135deg,${B}06,${G}08)`, borderBottom:`1px solid ${B}0c`, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>🔗</span>
              <span style={{ fontSize:14, fontWeight:900, color:B }}>{t.quickLinks}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:14 }}>
              {t.quickLinksItems.map((item, i) => (
                <Link key={i} href={item.href}
                  onMouseEnter={() => setHoveredLink(i)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:12, borderRadius:10, background: hoveredLink === i ? `${G}12` : '#f8fafc', border: hoveredLink === i ? `1px solid ${G}50` : '1px solid #e2e8f0', textDecoration:'none', transition:'all 0.22s' }}>
                  <span style={{ fontSize:20 }}>{item.icon}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:B }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* PERSON & COMMITTEE MODAL DETAILED POPUP */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, zIndex:999, animation:'fade-in 0.25s ease-out' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, maxWidth:500, width:'100%', overflow:'hidden', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)', border:`1px solid ${G}40`, animation:'scale-up 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
            
            {/* Modal Header Cover */}
            <div style={{ height:90, background:`linear-gradient(135deg,${B},${B}dd)`, position:'relative', padding:'16px 20px', display:'flex', alignItems:'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ position:'absolute', top:14, [isRtl ? 'left' : 'right']:14, background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', width:26, height:26, borderRadius:'50%', cursor:'pointer', fontWeight:900, fontSize:12 }}>✕</button>
              <h3 style={{ color:'#fff', fontSize:16, fontWeight:900 }}>{modal.type === 'person' ? modal.data.role : modal.data.name}</h3>
            </div>

            {/* Modal Body */}
            <div style={{ padding:20 }}>
              {modal.type === 'person' ? (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <Avatar src={modal.data.image} name={modal.data.name} size={72} border={3} />
                    <div>
                      <h4 style={{ fontSize:16, fontWeight:900, color:B }}>{modal.data.name}</h4>
                      <p style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{modal.data.title}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:13, color:'#374151', lineHeight:1.6, background:'#f8fafc', padding:12, borderRadius:10, border:'1px solid #e2e8f0' }}>{modal.data.bio}</p>
                  <div>
                    <h5 style={{ fontSize:12, fontWeight:800, color:B, marginBottom:6 }}>{t.expertiseLbl}:</h5>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {modal.data.expertise.map((exp, idx) => (
                        <span key={idx} style={{ fontSize:11, background:`${G}12`, color:'#7a5c1a', border:`1px solid ${G}25`, padding:'3px 10px', borderRadius:20 }}>{exp}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:12, display:'flex', flexDirection:'column', gap:4, fontSize:11, color:'#64748b' }}>
                    <div>📧 {modal.data.email}</div>
                    <div style={{ direction:'ltr', textAlign: isRtl ? 'right' : 'left' }}>📞 {modal.data.phone}</div>
                  </div>
                </div>
              ) : (
                // Committee Modal View
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,${B}10,${G}15)`, border:`1px solid ${G}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{modal.data.icon}</div>
                    <div>
                      <h4 style={{ fontSize:16, fontWeight:900, color:B }}>{modal.data.name}</h4>
                      <p style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{modal.data.desc}</p>
                    </div>
                  </div>
                  
                  {modal.data.head && (
                    <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:14 }}>
                      <h5 style={{ fontSize:12, fontWeight:800, color:G, marginBottom:10 }}>{t.membersLbl}:</h5>
                      <div style={{ display:'flex', gap:12, background:'#fafbfc', padding:12, borderRadius:12, border:'1px solid #e2e8f0' }}>
                        <Avatar src={modal.data.head.image} name={modal.data.head.name} size={50} border={2} />
                        <div>
                          <h6 style={{ fontSize:13, fontWeight:900, color:B }}>{modal.data.head.name}</h6>
                          <p style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{modal.data.head.title}</p>
                          <p style={{ fontSize:11, color:'#475569', marginTop:6, lineHeight:1.5 }}>{modal.data.head.bio}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}