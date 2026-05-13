"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
import { useLang } from '@/context/LangContext';


/* ─── hook ─── */
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

/* ─── Particles Background ─── */
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
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.5,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.45 + 0.1,
      color: Math.random() > 0.5 ? '#D4AF37' : '#1B365D',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      // draw connecting lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = '#D4AF37';
            ctx.globalAlpha = (1 - dist / 110) * 0.12;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0, opacity: 0.6,
    }} />
  );
}

export default function Home() {
  const { lang, setLang } = useLang();
  const [modal, setModal]         = useState(null);
  const [counts, setCounts]       = useState({ speakers:0, sessions:0, attendees:0, countries:0 });
  const [visible, setVisible]     = useState({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging]   = useState(false);
  const [dragStart, setDragStart]     = useState(0);
  const [dragDelta, setDragDelta]     = useState(0);
  const [videoOpen, setVideoOpen]     = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredNews, setHoveredNews] = useState(null);
  const [hoveredLeader, setHoveredLeader] = useState(null);
  const [hoveredCommittee, setHoveredCommittee] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [modalReady, setModalReady]   = useState(false);

  const statsRef  = useRef(null);
  const animated  = useRef(false);
  const sliderRef = useRef(null);
  const autoPlay  = useRef(null);

  const bp       = useBreakpoint();
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';

  const targets = { speakers:20, sessions:15, attendees:1000, countries:5 };
  const B = '#1B365D', R = '#C8102E', G = '#D4AF37';

  const mediaItems = [
    { src:'/hospital-side.jpg' },
    { src:'/gallery/img2.jpg' },
    { src:'/gallery/img3.jpg' },
    { src:'/gallery/img4.jpg' },
    { src:'/gallery/img5.jpg' },
  ];

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated.current) {
        animated.current = true;
        const dur = 1800, t0 = performance.now();
        const step = (now) => {
          const p = Math.min((now-t0)/dur,1), ease = 1-Math.pow(1-p,3);
          setCounts({ speakers:Math.round(targets.speakers*ease), sessions:Math.round(targets.sessions*ease), attendees:Math.round(targets.attendees*ease), countries:Math.round(targets.countries*ease) });
          if (p<1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    },{ threshold:0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  },[]);

  useEffect(() => {
    animated.current = false;
    setVisible({});
    const tm = setTimeout(() => {
      setVisible(p => ({ ...p, hero:true, stats:true, gallery:true }));
      const els = document.querySelectorAll('[data-reveal]');
      const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ setVisible(p=>({...p,[e.target.getAttribute('data-reveal')]:true})); } }),{ threshold:0.1 });
      els.forEach(el=>obs.observe(el));
      return () => obs.disconnect();
    },100);
    return () => clearTimeout(tm);
  },[lang]);

  useEffect(() => {
    autoPlay.current = setInterval(()=>setActiveSlide(p=>(p+1)%mediaItems.length),5000);
    return () => clearInterval(autoPlay.current);
  },[]);

  // modal open with animation delay
  useEffect(() => {
    if (modal) { setModalReady(false); setTimeout(() => setModalReady(true), 20); }
    else { setModalReady(false); }
  }, [modal]);

  const goTo = (idx) => {
    setActiveSlide((idx+mediaItems.length)%mediaItems.length);
    clearInterval(autoPlay.current);
    autoPlay.current = setInterval(()=>setActiveSlide(p=>(p+1)%mediaItems.length),5000);
  };

  const onDragStart = x => { setIsDragging(true); setDragStart(x); setDragDelta(0); };
  const onDragMove  = x => { if(!isDragging) return; setDragDelta(x-dragStart); };
  const onDragEnd   = () => {
    if(!isDragging) return; setIsDragging(false);
    if(dragDelta<-60) goTo(activeSlide+1);
    else if(dragDelta>60) goTo(activeSlide-1);
    setDragDelta(0);
  };

  const isRtl = lang === 'ar';

  const t = isRtl ? {
    dir:'rtl', langTxt:'English',
    conferenceTitle:'المؤتمر الطبي الدولي الثاني عشر',
    conferenceSub:'للصمود والاستدامة في الطوارئ والاستجابة الإنسانية',
    btnReg:'قدم بحثك الآن', btnProg:'البرنامج العلمي', watchVideo:'شاهد الفيلم التعريفي',
    statsLbls:['متحدث دولي','جلسة علمية','مشترك متوقع','دولة مشاركة'],
    newsTitle:'أخبار المؤتمر',
    membersLbl:'رئيس اللجنة', expertiseLbl:'التخصصات', emailLbl:'البريد', phoneLbl:'الهاتف',
    galleryTitle:'معرض الوسائط', gallerySub:'لقطات من فعاليات المؤتمر',
    leadersTitle:'قيادة المؤتمر',
    committeesTitle:'لجان المؤتمر',
    presidentQuoteLabel:'كلمة رئيس المؤتمر',
    presidentQuote:'قال تعالى: {وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ}.\n\nالزملاء الأعزاء، بعد ثلاث سنوات من قهر العدوان، نعود لنوقد شعلة العلم. ننحني إجلالاً لشهدائنا وأسرانا وجرحانا من الكوادر الطبية الذين جسدوا أسمى معاني التضحية. شكراً لكل يدٍ ستبني نجاح مؤتمرنا الباطني الثاني عشر.\n\nوفقكم الله لما يحب ويرضى.',
    presidentFooter:'رئيس المؤتمر الطبي الدولي · 2026',
    mediaCaptions:[{caption:'مجمع ميران الطبي',tag:'مستشفى'},{caption:'حفل الافتتاح',tag:'فعاليات'},{caption:'ورشة عمل طبية',tag:'ورش'},{caption:'المتحدثون الدوليون',tag:'متحدثون'},{caption:'جلسة التحكيم',tag:'جلسات'}],
    president:{ name:'د. أحمد جمعة الروبي', role:'رئيس المؤتمر', title:'مدير قسم الباطنة — استشاري الأمراض الباطنية', bio:'طبيب استشاري متخصص في الأمراض الباطنية، يشغل منصب مدير قسم الباطنة، وله خبرة واسعة في إدارة الحالات الطبية المعقدة والإشراف على البحث العلمي.', email:'rubai@medical.edu', phone:'+970-8-2816-1010', image:'/Mohamed_El_Rouby.jpg', expertise:['الأمراض الباطنية','إدارة الأقسام','البحث العلمي'] },
    supervisor:{ name:'د. عمرو الأسطل', role:'المشرف العام', title:'استشاري الأمراض الرئوية والعناية المركزة — أمريكا', bio:'استشاري دولي في الأمراض الرئوية والعناية المركزة، متمرس في المستشفيات الأمريكية، ويُشرف على الجانب العلمي والتنظيمي للمؤتمر.', email:'astal@medical.edu', phone:'+1-555-000-1234', image:'/Amr_Al_Astal.jpg', expertise:['الأمراض الرئوية','العناية المركزة','الطب الدولي'] },
    committees:[
      {name:'اللجنة التحضيرية',icon:'🏗️',desc:'تشرف على التخطيط العام للمؤتمر وتنسيق الجدول الزمني.',members:['د. محمد خطاب قنديل'],head:{ name:'د. محمد خطاب قنديل', title:'استشاري طب الطوارئ والحالات الحرجة', bio:'استشاري طب الطوارئ والحالات الحرجة، يعمل حاليا في غزة وسابقا في الدوحة. حاصل على البورد العربي والزمالة البريطانية في تخصصه.', email:'khatab@medical.edu', phone:'+970-8-2816-2020', image:'/Mohamed_Khattab_Qandil.jpg', expertise:['طب الطوارئ','الحالات الحرجة','التعليم الطبي'] }},
      {name:'اللجنة العلمية',icon:'🔬',desc:'مسؤولة عن مراجعة الأبحاث وتحديد المحاور العلمية.',members:['د. محمود الشيخ علي'],head:{ name:'د. محمود الشيخ علي', title:'استشاري الطب الباطني والمناظير', bio:'استشاري الطب الباطني والمناظير مع خبرة عميقة في مجاله. حاصل على الزمالة البريطانية في الطب الباطني.', email:'drmnali@gmail.com', phone:'+972-56-703-3314', image:'/Mahmoud_Al_Sheikh_Ali.jpg', expertise:['الطب الباطني','المناظير','تقييم الأبحاث'] }},
      {name:'اللجنة الإعلامية',icon:'📢',desc:'تتولى التغطية الصحفية وإدارة منصات التواصل والموقع.',members:['د. مازن سليمان صافي'],head:{ name:'د. مازن سليمان صافي', title:'رئيس قسم الأدوية المخدرة والمراقبة — مجمع ناصر الطبي', bio:'رئيس قسم الأدوية المخدرة والمراقبة بمجمع ناصر الطبي، نائب مدير الصيدلية. متخصص في الإعلام الطبي وكاتب محتوى احترافي دولي.', email:'mazen@nasermedical.edu', phone:'+970-8-2822-2222', image:'/Mazen_Suleiman_Safi.jpg', expertise:['الأدوية المخدرة','إدارة الصيدلية','الإعلام الطبي','القيادة والتدريب'] }},
    ],
    news:[
      {title:'فتح باب استقبال الأبحاث',date:'١ مايو ٢٠٢٦',icon:'📋',content:'نعلمكم أنه تم فتح باب استقبال الأبحاث العلمية ابتداءً من 1/5/2026 وحتى 30/6/2026.'},
      {title:'تأكيد مشاركة متحدثين دوليين',date:'٢٠ أبريل ٢٠٢٦',icon:'🌍',content:'يسعدنا الإعلان عن تأكيد مشاركة متحدثين دوليين من أوروبا وأمريكا.'},
      {title:'موعد المؤتمر ٤-٥ ديسمبر ٢٠٢٦',date:'١ أبريل ٢٠٢٦',icon:'📅',content:'يُعقد المؤتمر في مجمع ميران الطبي، غزة، بتاريخ 4-5 ديسمبر 2026.'},
    ],
    footer:'© 2026 مؤتمر الصمود والاستدامة الطبي',
    execCommittee:'لجنة تنفيذية',
    presidentBadge:'رئيس المؤتمر', supervisorBadge:'مشرف عام',
  } : {
    dir:'ltr', langTxt:'العربية',
    conferenceTitle:'12th International Medical Conference',
    conferenceSub:'Resilience & Sustainability in Emergency & Humanitarian Response',
    btnReg:'Register Now', btnProg:'Scientific Program', watchVideo:'Watch Promo Video',
    statsLbls:['International Speakers','Scientific Sessions','Expected Attendees','Participating Countries'],
    newsTitle:'Conference News',
    membersLbl:'Committee Head', expertiseLbl:'Expertise', emailLbl:'Email', phoneLbl:'Phone',
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
  };

  const statVals = [
    counts.speakers===targets.speakers?`${targets.speakers}+`:String(counts.speakers),
    counts.sessions===targets.sessions?`${targets.sessions}+`:String(counts.sessions),
    counts.attendees===targets.attendees?'1K+':String(counts.attendees),
    counts.countries===targets.countries?`${targets.countries}+`:String(counts.countries),
  ];

  const statIcons  = ['🎤','🔬','👥','🌍'];
  const statColors = [R, B, '#0e7490', '#047857'];

  const rev = (id, delay=0) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? 'translateY(0)' : 'translateY(32px)',
    transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  const slideTranslate = `translateX(calc(${isRtl?'+':'-'}${activeSlide*100}% + ${isRtl?-dragDelta:dragDelta}px))`;

  const NAV_H    = isMobile ? 64 : isTablet ? 90 : 130;
  const STICKY_TOP = NAV_H + 38 + 8;
  const SLIDE_H = isMobile ? 220 : isTablet ? 300 : 400;

  const Avatar = ({ src, name, size=64, border=3, float=false }) => (
    <div style={{
      width:size, height:size, borderRadius:'50%', overflow:'hidden',
      border:`${border}px solid ${G}`, boxShadow:`0 4px 16px rgba(27,54,93,0.12)`,
      background:'#eef2f7', flexShrink:0,
      animation: float ? 'float-avatar 3.5s ease-in-out infinite' : 'none',
    }}>
      <img src={src||'/president.png'} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
        onError={e=>{ e.currentTarget.onerror=null; e.currentTarget.src=`https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=300&name=${encodeURIComponent(name)}`; }}/>
    </div>
  );

  const SidebarRight = () => (
    <>
      {/* LOGO CARD */}
      <div style={{
        background:`linear-gradient(160deg,#FAFBFD,#F2F6FB,#EBF0F8)`, borderRadius:18, overflow:'hidden',
        boxShadow:`0 4px 24px rgba(27,54,93,0.1),0 0 0 1px ${G}35`, border:`1px solid ${G}30`, position:'relative',
      }}>
        {/* shimmer gold border top */}
        <div style={{ height:5, background:`linear-gradient(90deg,${R},${G},${R})`, backgroundSize:'200% 100%', animation:'shimmer-border 2.5s linear infinite' }}/>
        <div style={{ padding:'20px 18px', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${G},#b8941f)`, color:'#1a1000', fontSize:11, fontWeight:900, padding:'4px 16px', borderRadius:30, marginBottom:14, letterSpacing:'1px' }}>
            {isRtl ? '• المؤتمر الثاني عشر •' : '• 12th EDITION •'}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Link href="/participation" style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px',
              background:`linear-gradient(135deg,${R},#a80d24)`, color:'#fff', borderRadius:11,
              fontFamily:"'Cairo',sans-serif", fontSize:14, fontWeight:800, textDecoration:'none',
              boxShadow:`0 4px 14px ${R}40`,
              transition:'transform 0.22s, box-shadow 0.22s',
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow=`0 8px 22px ${R}55`; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`0 4px 14px ${R}40`; }}>
              🎫 {t.btnReg}
            </Link>
            <Link href="/program" style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px',
              background:'#fff', color:B, borderRadius:11, fontFamily:"'Cairo',sans-serif",
              fontSize:13.5, fontWeight:700, textDecoration:'none', border:`1.5px solid ${B}25`,
              transition:'transform 0.22s, border-color 0.22s',
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor=G; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.borderColor=`${B}25`; }}>
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
          { data:t.president,  badge:t.presidentBadge,  bc:R },
          { data:t.supervisor, badge:t.supervisorBadge, bc:'#9A7A10' },
        ].map(({ data, badge, bc }, idx) => (
          <div key={idx}
            onClick={() => setModal({ type:'person', data })}
            onMouseEnter={() => setHoveredLeader(idx)}
            onMouseLeave={() => setHoveredLeader(null)}
            style={{
              display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
              borderBottom:idx===0?`1px solid ${B}08`:'none', cursor:'pointer',
              background: hoveredLeader===idx ? `linear-gradient(135deg,${G}06,${B}04)` : '#fff',
              transition:'background 0.25s, transform 0.25s',
              transform: hoveredLeader===idx ? 'translateX(3px)' : 'translateX(0)',
            }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <Avatar src={data.image} name={data.name} size={isMobile?52:64} border={3} float={hoveredLeader===idx} />
              <div style={{ position:'absolute', bottom:-2, [isRtl?'left':'right']:-2, width:18, height:18, borderRadius:'50%', background:bc, border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff', fontWeight:900 }}>✓</div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, fontWeight:800, color:bc, marginBottom:3, background:`${bc}12`, padding:'2px 8px', borderRadius:20, display:'inline-block' }}>{badge}</div>
              <div style={{ fontSize:13, fontWeight:900, color:B, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.name}</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data.title.split('—')[0].trim()}</div>
            </div>
            <span style={{ color: hoveredLeader===idx ? G : '#cbd5e1', fontSize:14, flexShrink:0, transition:'color 0.2s' }}>{isRtl?'‹':'›'}</span>
          </div>
        ))}
      </div>

      {/* COMMITTEES */}
      <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${G}28`, overflow:'hidden', boxShadow:'0 3px 14px rgba(27,54,93,0.07)' }}>
        <div style={{ padding:'12px 16px', background:`linear-gradient(135deg,${B}06,${G}08)`, borderBottom:`1px solid ${B}0c`, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>🏛️</span>
          <span style={{ fontSize:14, fontWeight:900, color:B }}>{t.committeesTitle}</span>
        </div>
        {t.committees.map((c,i) => (
          <button key={i}
            onClick={() => setModal({ type:'committee', data:c })}
            onMouseEnter={() => setHoveredCommittee(i)}
            onMouseLeave={() => setHoveredCommittee(null)}
            style={{
              display:'flex', alignItems:'center', gap:12, width:'100%', padding:'13px 16px',
              background: hoveredCommittee===i ? `linear-gradient(135deg,${G}08,${B}04)` : '#fff',
              border:'none', borderBottom:i<t.committees.length-1?`1px solid ${B}07`:'none',
              cursor:'pointer', fontFamily:"'Cairo',sans-serif", color:B,
              textAlign:isRtl?'right':'left',
              transition:'background 0.25s, transform 0.22s',
              transform: hoveredCommittee===i ? 'translateX(3px)' : 'translateX(0)',
            }}>
            <div style={{
              width:38, height:38, borderRadius:10,
              background: hoveredCommittee===i ? `linear-gradient(135deg,${G}25,${B}20)` : `linear-gradient(135deg,${B}08,${G}12)`,
              border:`1px solid ${G}25`, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, flexShrink:0,
              transition:'background 0.25s, transform 0.25s',
              transform: hoveredCommittee===i ? 'rotate(8deg) scale(1.1)' : 'rotate(0) scale(1)',
            }}>{c.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:800, color:B, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.members[0]}</div>
            </div>
            <span style={{ color: hoveredCommittee===i ? G : '#cbd5e1', fontSize:14, flexShrink:0, transition:'color 0.2s' }}>{isRtl?'‹':'›'}</span>
          </button>
        ))}
      </div>
    </>
  );

  const SidebarLeft = () => (
    <>
      <PresidentQuoteSlide t={t} isRtl={isRtl} B={B} R={R} G={G} president={t.president} />

      {/* NEWS */}
      <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${B}12`, overflow:'hidden', boxShadow:'0 3px 14px rgba(27,54,93,0.07)' }}>
        <div style={{ padding:'12px 16px', background:`linear-gradient(135deg,${B}06,${R}05)`, borderBottom:`1px solid ${B}0c`, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:R, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>📰</div>
          <span style={{ fontSize:14, fontWeight:900, color:B }}>{t.newsTitle}</span>
          <div style={{ marginLeft:'auto', width:8, height:8, borderRadius:'50%', background:'#22c55e', animation:'pulse-dot 1.2s ease-in-out infinite' }}/>
        </div>
        {t.news.map((n,i) => (
          <div key={i}
            onClick={() => setModal({ type:'news', data:n })}
            onMouseEnter={() => setHoveredNews(i)}
            onMouseLeave={() => setHoveredNews(null)}
            style={{
              padding:'14px 16px', borderBottom:i<t.news.length-1?`1px solid ${B}08`:'none',
              cursor:'pointer',
              background: hoveredNews===i ? `${[R,G,B][i]}07` : '#fff',
              [isRtl?'borderRight':'borderLeft']:`3px solid ${[R,G,B][i]}`,
              transition:'background 0.25s, transform 0.22s',
              transform: hoveredNews===i ? 'translateX(4px)' : 'translateX(0)',
            }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
              <div style={{
                width:28, height:28, borderRadius:7, background:`${[R,G,B][i]}12`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0,
                transition:'transform 0.25s',
                transform: hoveredNews===i ? 'scale(1.15) rotate(-5deg)' : 'scale(1)',
              }}>{n.icon}</div>
              <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8' }}>{n.date}</span>
            </div>
            <div style={{ fontSize:13.5, fontWeight:800, color:B, lineHeight:1.5 }}>{n.title}</div>
            <div style={{ fontSize:12, color:'#94a3b8', marginTop:3, lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{n.content}</div>
          </div>
        ))}
      </div>

      {/* QUICK LINKS */}
      <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${B}12`, overflow:'hidden', boxShadow:'0 3px 14px rgba(27,54,93,0.07)' }}>
        <div style={{ padding:'12px 16px', background:`linear-gradient(135deg,${B}06,${G}06)`, borderBottom:`1px solid ${B}0c`, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:17 }}>🔗</span>
          <span style={{ fontSize:14, fontWeight:900, color:B }}>{isRtl?'روابط سريعة':'Quick Links'}</span>
        </div>
        {[
          { icon:'🖥️', label:isRtl?'شاشات تفاعلية':'Interactive Screens', href:'/media' },
          { icon:'📄', label:isRtl?'تقديم الأبحاث':'Research Submission', href:'/participation' },
          { icon:'🌍', label:isRtl?'بث مباشر':'Live Stream', href:'/live' },
          { icon:'📋', label:isRtl?'جدول المؤتمر':'Schedule', href:'/program' },
        ].map((link,i) => (
          <Link key={i} href={link.href}
            onMouseEnter={() => setHoveredLink(i)}
            onMouseLeave={() => setHoveredLink(null)}
            style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
              borderBottom:i<3?`1px solid ${B}07`:'none', textDecoration:'none',
              background: hoveredLink===i ? `${B}05` : '#fff', color:B,
              transition:'background 0.22s, transform 0.22s',
              transform: hoveredLink===i ? 'translateX(4px)' : 'translateX(0)',
            }}>
            <div style={{
              width:34, height:34, borderRadius:9, background: hoveredLink===i ? `${G}20` : `${B}08`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0,
              transition:'background 0.22s, transform 0.25s',
              transform: hoveredLink===i ? 'rotate(-8deg) scale(1.1)' : '',
            }}>{link.icon}</div>
            <span style={{ fontSize:13, fontWeight:700 }}>{link.label}</span>
            <span style={{ marginLeft:'auto', fontSize:13, color: hoveredLink===i ? G : '#cbd5e1', transition:'color 0.2s' }}>{isRtl?'‹':'›'}</span>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <div style={{ direction:t.dir, fontFamily:"'Cairo',sans-serif", background:'#F0F4F9', minHeight:'100vh', position:'relative' }}>
      {/* Particles */}
      <ParticlesBackground />

      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ecg-line{stroke-dasharray:1400;stroke-dashoffset:1400;animation:ecg 3.5s linear infinite;}
        @keyframes ecg{to{stroke-dashoffset:0;}}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.7)}}
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
        @keyframes slide-up{from{opacity:0;transform:translateY(28px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes quote-slide{from{max-height:0;opacity:0}to{max-height:900px;opacity:1}}
        @keyframes progress-bar{from{width:0%}to{width:100%}}

        /* ── NEW ANIMATIONS ── */
        @keyframes float-avatar{
          0%,100%{transform:translateY(0px);}
          50%{transform:translateY(-6px);}
        }
        @keyframes shimmer-border{
          0%{background-position:200% center;}
          100%{background-position:-200% center;}
        }
        @keyframes glow-gold{
          0%,100%{box-shadow:0 0 8px 2px rgba(212,175,55,0.25);}
          50%{box-shadow:0 0 22px 6px rgba(212,175,55,0.55), 0 0 40px 10px rgba(212,175,55,0.18);}
        }
        @keyframes shimmer-card{
          0%{background-position:-200% center;}
          100%{background-position:200% center;}
        }
        @keyframes slide-in-right{
          from{opacity:0;transform:translateX(40px);}
          to{opacity:1;transform:translateX(0);}
        }
        @keyframes slide-in-left{
          from{opacity:0;transform:translateX(-40px);}
          to{opacity:1;transform:translateX(0);}
        }
        @keyframes scale-in{
          from{opacity:0;transform:scale(0.88);}
          to{opacity:1;transform:scale(1);}
        }
        @keyframes hero-fade{
          from{opacity:0;transform:scale(1.03);}
          to{opacity:1;transform:scale(1);}
        }
        @keyframes slide-caption{
          from{opacity:0;transform:translateY(18px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes stat-pop{
          0%{transform:scale(1);}
          50%{transform:scale(1.08);}
          100%{transform:scale(1);}
        }

        .stat-card:hover{
          transform:translateY(-8px) scale(1.04)!important;
          box-shadow:0 16px 40px rgba(27,54,93,0.14)!important;
        }
        .stat-card{transition:transform 0.28s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.28s!important;}

        .slide-track{display:flex;transition:transform 0.5s cubic-bezier(0.25,0.8,0.25,1);will-change:transform;}
        .slide-track.drag{transition:none!important;}
        .slider-arrow{
          position:absolute;top:50%;transform:translateY(-50%);
          background:rgba(27,54,93,0.45);backdrop-filter:blur(6px);
          border:1px solid rgba(212,175,55,0.3);border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;color:#fff;z-index:10;
          transition:all .22s;
        }
        .slider-arrow:hover{
          background:rgba(200,16,46,0.75)!important;
          transform:translateY(-50%) scale(1.12)!important;
          border-color:rgba(212,175,55,0.7)!important;
        }
        .thumb-item{cursor:pointer;transition:all .22s;opacity:.5;border:2px solid transparent;border-radius:8px;overflow:hidden;flex-shrink:0;width:80px;height:52px;background:#dde3ec;position:relative;}
        .thumb-item:hover{opacity:.8;transform:scale(1.07);}
        .thumb-item.active{opacity:1;border-color:#D4AF37;box-shadow:0 0 8px #D4AF3755;}
        .modal-box{animation:scale-in .3s cubic-bezier(.34,1.56,.64,1);}

        /* gold glow on sidebar card borders */
        .gold-glow-card{animation:glow-gold 3s ease-in-out infinite;}

        @media(max-width:1099px){
          .main-layout{flex-direction:column;gap:16px;}
          .sidebar-r,.sidebar-l{width:100%;position:static!important;}
        }
        @media(max-width:639px){
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important;}
          .thumb-item{width:60px!important;height:42px!important;}
          .slider-arrow{width:36px!important;height:36px!important;font-size:18px!important;}
        }
        .main-layout{display:flex;align-items:flex-start;gap:22px;}
        .sidebar-r,.sidebar-l{display:flex;flex-direction:column;gap:16px;width:300px;flex-shrink:0;}
      `}</style>

      {/* ECG */}
      <div style={{ height:38, background:`linear-gradient(90deg,#EBF0F7,#F0F4F9,#EBF0F7)`, overflow:'hidden', position:'relative', borderBottom:`1px solid ${G}30`, zIndex:2 }}>
        <svg width="100%" height="38" viewBox="0 0 1200 38" preserveAspectRatio="none" style={{ position:'absolute', top:0 }}>
          <path className="ecg-line" d="M0 19 L70 19 L86 4 L102 34 L118 19 L230 19 L246 2 L266 36 L282 19 L460 19 L476 4 L492 34 L508 19 L660 19 L676 2 L696 36 L712 19 L860 19 L876 4 L892 34 L908 19 L1200 19" fill="none" stroke={B} strokeWidth="1.8" vectorEffect="non-scaling-stroke" opacity="0.25"/>
          <path className="ecg-line" d="M0 19 L70 19 L86 4 L102 34 L118 19 L230 19 L246 2 L266 36 L282 19 L460 19 L476 4 L492 34 L508 19 L660 19 L676 2 L696 36 L712 19 L860 19 L876 4 L892 34 L908 19 L1200 19" fill="none" stroke={R} strokeWidth="1.4" vectorEffect="non-scaling-stroke" opacity="0.35" style={{ animationDelay:'0.4s' }}/>
        </svg>
        <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', gap:6, direction:'ltr' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', animation:'pulse-dot 1s ease-in-out infinite' }}/>
          <span style={{ fontSize:10, fontWeight:700, color:'#64748b' }}>LIVE</span>
        </div>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="main-layout" style={{ maxWidth:1560, margin:'0 auto', padding: isMobile ? '14px 12px 0' : '22px 18px 0', position:'relative', zIndex:1 }}>

        {/* ════ RIGHT SIDEBAR ════ */}
        <aside className="sidebar-r gold-glow-card" style={{
          position: (!isMobile && !isTablet) ? 'sticky' : 'static', top: STICKY_TOP,
          borderRadius:18,
          animation: 'slide-in-right 0.7s cubic-bezier(0.22,1,0.36,1) both',
        }}>
          <SidebarRight />
        </aside>

        {/* ════ CENTER ════ */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* HERO */}
          <div style={{
            ...rev('hero',0),
            borderRadius: isMobile ? 14 : 22, overflow:'hidden',
            marginBottom: isMobile ? 14 : 22,
            boxShadow:`0 0 0 3px ${G}50,0 12px 40px rgba(27,54,93,0.15)`,
            position:'relative',
            animation: visible['hero'] ? 'hero-fade 1s cubic-bezier(0.22,1,0.36,1) both' : 'none',
          }}>
            <img src="/hero-banner.png" alt={isRtl?'شعار المؤتمر':'Conference Banner'}
              style={{ width:'100%', display:'block', objectFit:'cover', objectPosition:'center top', minHeight: isMobile ? 180 : 260, maxHeight: isMobile ? 220 : isTablet ? 300 : 360 }}
              onError={e => {
                e.currentTarget.style.display='none';
                const p=e.currentTarget.parentElement;
                p.style.background=`linear-gradient(135deg,${G}18,#EBF0F8)`;
                p.style.minHeight=isMobile?'180px':'280px';
                p.style.display='flex'; p.style.alignItems='center'; p.style.justifyContent='center';
                const d=document.createElement('div');
                d.style.cssText='text-align:center;padding:40px;';
                d.innerHTML=`<div style="font-size:60px;margin-bottom:14px">🏥</div><div style="font-size:17px;font-weight:900;color:${B}">${isRtl?'المؤتمر الطبي الدولي الثاني عشر':'12th International Medical Conference'}</div>`;
                p.appendChild(d);
              }}/>
            {/* animated top stripe */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:5, background:`linear-gradient(90deg,${R},${G},${R})`, backgroundSize:'200% 100%', animation:'shimmer-border 2.5s linear infinite' }}/>
          </div>

          {/* STATS */}
          <div ref={statsRef} data-reveal="stats" className="stats-grid"
            style={{ ...rev('stats',0.05), display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 14 : 22 }}>
            {statIcons.map((ico,i) => (
              <div key={i} className="stat-card"
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                style={{
                  background:'#fff', borderRadius: isMobile ? 12 : 16,
                  padding: isMobile ? '14px 10px' : '22px 16px',
                  border:`1px solid ${statColors[i]}18`,
                  boxShadow: hoveredStat===i
                    ? `0 12px 32px ${statColors[i]}30, 0 0 0 2px ${statColors[i]}25`
                    : `0 3px 14px rgba(27,54,93,0.06)`,
                  position:'relative', overflow:'hidden', textAlign:'center',
                  animationDelay:`${i*0.1}s`,
                }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${statColors[i]},${statColors[i]}55)`, backgroundSize:'200% 100%', animation: hoveredStat===i ? 'shimmer-border 1.5s linear infinite' : 'none' }}/>
                {/* shimmer overlay */}
                <div style={{
                  position:'absolute', inset:0,
                  background:'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.5) 50%,transparent 60%)',
                  backgroundSize:'200% 100%',
                  animation: hoveredStat===i ? 'shimmer-card 0.8s ease' : 'none',
                  pointerEvents:'none',
                }}/>
                <div style={{ fontSize: isMobile ? 24 : 32, marginBottom:6, display:'inline-block', transition:'transform 0.3s', transform: hoveredStat===i ? 'scale(1.2) rotate(-8deg)' : 'scale(1)' }}>{ico}</div>
                <div style={{ fontSize: isMobile ? 26 : 36, fontWeight:900, color:statColors[i], lineHeight:1, marginBottom:6, direction:'ltr', letterSpacing:'-1px' }}>{statVals[i]}</div>
                <div style={{ fontSize: isMobile ? 10 : 12, color:'#64748b', fontWeight:700, lineHeight:1.4 }}>{t.statsLbls[i]}</div>
              </div>
            ))}
          </div>

          {/* GALLERY */}
          <div data-reveal="gallery" style={{ ...rev('gallery',0.05), background:'#fff', borderRadius: isMobile ? 14 : 22, overflow:'hidden', marginBottom: isMobile ? 14 : 32, boxShadow:'0 4px 24px rgba(27,54,93,0.09)', border:`1px solid ${G}30` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding: isMobile ? '10px 14px' : '14px 20px', borderBottom:`1px solid ${B}0c`, background:'#FAFBFD', flexWrap:'wrap', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius:10, background:`${G}15`, border:`1px solid ${G}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize: isMobile ? 16 : 18 }}>🎞️</div>
                <div>
                  <div style={{ fontSize: isMobile ? 13 : 15, fontWeight:900, color:B }}>{t.galleryTitle}</div>
                  {!isMobile && <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{t.gallerySub}</div>}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={()=>setVideoOpen(true)}
                  style={{ display:'flex', alignItems:'center', gap:5, padding: isMobile ? '5px 12px' : '7px 16px', background:`linear-gradient(135deg,${R},#a80d24)`, border:'none', borderRadius:20, cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize: isMobile ? 11 : 12.5, fontWeight:800, color:'#fff', transition:'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.06)'; e.currentTarget.style.boxShadow=`0 6px 18px ${R}50`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                  ▶ {isRtl?'فيديو':'Video'}
                </button>
                <div style={{ fontSize:11, fontWeight:700, color:'#9A7A10', background:`${G}15`, border:`1px solid ${G}30`, padding:'4px 12px', borderRadius:20, direction:'ltr' }}>{activeSlide+1}/{mediaItems.length}</div>
              </div>
            </div>

            <div ref={sliderRef} style={{ position:'relative', overflow:'hidden', userSelect:'none' }}
              onMouseDown={e=>onDragStart(e.clientX)} onMouseMove={e=>onDragMove(e.clientX)} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
              onTouchStart={e=>onDragStart(e.touches[0].clientX)} onTouchMove={e=>{e.preventDefault();onDragMove(e.touches[0].clientX);}} onTouchEnd={onDragEnd}>

              <div className={`slide-track${isDragging?' drag':''}`} style={{ transform:slideTranslate }}>
                {mediaItems.map((item,i) => {
                  const meta = t.mediaCaptions[i]||{ caption:'', tag:'' };
                  return (
                    <div key={i} style={{ minWidth:'100%', height:SLIDE_H, position:'relative', flexShrink:0, background:`linear-gradient(135deg,${G}12,#EBF0F8)` }}>
                      <img src={item.src} alt={meta.caption} draggable={false}
                        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', pointerEvents:'none', transition:'transform 0.8s ease' }}
                        onError={e=>{
                          e.currentTarget.style.display='none';
                          const p=e.currentTarget.parentElement;
                          const d=document.createElement('div');
                          d.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';
                          d.innerHTML=`<span style="font-size:48px">🏥</span><span style="color:${B};font-size:15px;font-weight:700;">${meta.caption}</span>`;
                          p.appendChild(d);
                        }}/>
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 50%,rgba(27,54,93,0.6))', pointerEvents:'none' }}/>
                      <div style={{ position:'absolute', top:12, [isRtl?'right':'left']:12, background:G, color:B, fontSize:11, fontWeight:900, padding:'4px 12px', borderRadius:30 }}>{meta.tag}</div>
                      <div style={{
                        position:'absolute', bottom:0, left:0, right:0,
                        padding: isMobile ? '20px 16px 12px' : '32px 26px 18px', pointerEvents:'none',
                        animation: i===activeSlide ? 'slide-caption 0.55s cubic-bezier(0.22,1,0.36,1) both' : 'none',
                      }}>
                        <div style={{ fontSize: isMobile ? 13 : 16, fontWeight:800, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>{meta.caption}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                          {mediaItems.map((_,di) => (
                            <div key={di} style={{ width:di===i?18:6, height:6, borderRadius:4, background:di===i?G:'rgba(255,255,255,0.4)', transition:'all .35s' }}/>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {[{s:'left',d:isRtl?+1:-1,c:'‹'},{s:'right',d:isRtl?-1:+1,c:'›'}].map(btn => (
                <button key={btn.s} className="slider-arrow" onClick={()=>goTo(activeSlide+btn.d)}
                  style={{ [btn.s]: isMobile ? 8 : 16, width: isMobile ? 36 : 48, height: isMobile ? 36 : 48, fontSize: isMobile ? 20 : 24 }}>{btn.c}</button>
              ))}

              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:4, background:`${B}15`, zIndex:5 }}>
                <div key={activeSlide} style={{ height:'100%', background:`linear-gradient(90deg,${G},${R})`, animation:'progress-bar 5s linear' }}/>
              </div>
            </div>

            {!isMobile && (
              <div style={{ display:'flex', gap:8, padding:'12px 16px', overflowX:'auto', background:'#F4F6FA', scrollbarWidth:'none', borderTop:`1px solid ${B}08` }}>
                {mediaItems.map((item,i) => {
                  const meta = t.mediaCaptions[i]||{};
                  return (
                    <div key={i} className={`thumb-item${i===activeSlide?' active':''}`} onClick={()=>goTo(i)}>
                      <img src={item.src} alt={meta.caption||''} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', pointerEvents:'none' }} onError={e=>{e.currentTarget.style.display='none';}}/>
                      {i===activeSlide && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:G }}/>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {(isMobile || isTablet) && (
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:20 }}>
              <SidebarLeft />
            </div>
          )}
        </div>

        {/* ════ LEFT SIDEBAR ════ */}
        {!isMobile && !isTablet && (
          <aside className="sidebar-l" style={{
            position:'sticky', top:STICKY_TOP,
            animation:'slide-in-left 0.7s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <SidebarLeft />
          </aside>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ padding: isMobile ? '16px 14px' : '22px 36px', borderTop:`1px solid ${G}25`, textAlign:'center', background:'#fff', color:'#94a3b8', fontSize: isMobile ? 11 : 13, fontWeight:600, marginTop:32, position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, flexWrap:'wrap' }}>
          <span>{t.footer}</span>
          <span style={{ color:'#e2e8f0' }}>|</span>
          <span style={{ direction:'ltr', color:'#cbd5e1', fontSize: isMobile ? 10 : 13 }}>Nasser Medical Complex · Gaza · 4–5 Dec 2026</span>
        </div>
      </footer>

      {/* VIDEO LIGHTBOX */}
      {videoOpen && (
        <div onClick={()=>setVideoOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, animation:'fade-in .2s', padding: isMobile ? 12 : 20 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ position:'relative', width:'100%', maxWidth:900, borderRadius:18, overflow:'hidden', boxShadow:`0 30px 100px rgba(0,0,0,0.5)`, animation:'scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${R},${G},${R})`, backgroundSize:'200% 100%', animation:'shimmer-border 2s linear infinite', zIndex:10 }}/>
            <button onClick={()=>setVideoOpen(false)}
              style={{ position:'absolute', top:12, right:12, background:R, border:'none', borderRadius:'50%', width:38, height:38, color:'#fff', fontSize:16, cursor:'pointer', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s', }}
              onMouseEnter={e=>e.currentTarget.style.transform='rotate(90deg) scale(1.1)'}
              onMouseLeave={e=>e.currentTarget.style.transform=''}>✕</button>
            <video src="/promo-video.mp4" controls autoPlay playsInline poster="/hospital-side.jpg"
              style={{ width:'100%', display:'block', background:'#000', maxHeight:'80vh' }}
              onError={e=>{
                e.currentTarget.style.display='none';
                const p=e.currentTarget.parentElement;
                const d=document.createElement('div');
                d.style.cssText=`padding:60px;text-align:center;background:#F0F4F9;font-family:'Cairo',sans-serif;`;
                d.innerHTML=`<div style="font-size:50px;margin-bottom:14px">▶️</div><div style="font-size:16px;font-weight:700;color:${B}">${isRtl?'سيتم تحميل الفيديو قريباً':'Video will be available soon'}</div>`;
                p.appendChild(d);
              }}/>
          </div>
        </div>
      )}

      {/* MODALS */}
      {modal && (
        <div onClick={()=>setModal(null)}
          style={{ position:'fixed', inset:0, background:'rgba(27,54,93,0.65)', display:'flex', alignItems:'flex-start', justifyContent:'center', zIndex:999, backdropFilter:'blur(10px)', animation:'fade-in .2s', overflowY:'auto', padding: isMobile ? '80px 12px 40px' : `${STICKY_TOP+16}px 20px 40px` }}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}
            style={{ background:'#fff', borderRadius: isMobile ? 18 : 24, width:'100%', maxWidth: isMobile ? '100%' : 520, position:'relative', boxShadow:`0 28px 70px rgba(27,54,93,0.25), 0 0 0 2px ${G}30`, borderTop:`5px solid ${modal.type==='news'?R:G}`, maxHeight:'85vh', overflowY:'auto' }}>
            <button onClick={()=>setModal(null)}
              style={{ position:'absolute', top:14, [isRtl?'left':'right']:14, background:'#f1f5f9', border:'none', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:15, color:'#64748b', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.25s, background 0.2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='rotate(90deg) scale(1.1)'; e.currentTarget.style.background=`${R}15`; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.background='#f1f5f9'; }}>✕</button>

            {modal.type==='person' && (()=>{ const d=modal.data; return (
              <div style={{ direction:t.dir, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'flex-start', background:`linear-gradient(135deg,${B},#2a4a7a,#1a3060)`, padding: isMobile ? '24px 18px 20px' : '32px 28px 24px', position:'relative', overflow:'hidden', gap:0 }}>
                  <div style={{ position:'absolute', top:-40, left:-40, width:180, height:180, borderRadius:'50%', background:`${G}12`, pointerEvents:'none' }}/>
                  <div style={{ position:'relative', flexShrink:0, zIndex:2 }}>
                    <div style={{ width: isMobile ? 100 : 150, height: isMobile ? 100 : 150, borderRadius:16, overflow:'hidden', border:`4px solid ${G}`, boxShadow:`0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px ${G}50`, animation:'glow-gold 3s ease-in-out infinite' }}>
                      <img src={d.image||'/president.png'} alt={d.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top', animation:'float-avatar 4s ease-in-out infinite' }}
                        onError={e=>{e.currentTarget.src=`https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=300&name=${encodeURIComponent(d.name)}`;}}/>
                    </div>
                    <div style={{ position:'absolute', bottom:-8, right:-8, width:30, height:30, borderRadius:'50%', background:R, border:'3px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', fontWeight:900 }}>✓</div>
                  </div>
                  <div style={{ flex:1, [isRtl?'marginRight':'marginLeft']: isMobile ? 14 : 20, zIndex:2 }}>
                    <div style={{ fontSize:10, fontWeight:800, color:G, background:`${G}20`, border:`1px solid ${G}40`, padding:'3px 10px', borderRadius:20, display:'inline-block', marginBottom:8 }}>{d.role}</div>
                    <div style={{ fontSize: isMobile ? 15 : 20, fontWeight:900, color:'#fff', lineHeight:1.3, marginBottom:6 }}>{d.name}</div>
                    <div style={{ fontSize: isMobile ? 11 : 12, color:'rgba(255,255,255,0.75)', lineHeight:1.6, marginBottom:10 }}>{d.title}</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'rgba(255,255,255,0.8)' }}><span>📧</span><span style={{ direction:'ltr' }}>{d.email}</span></div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'rgba(255,255,255,0.8)' }}><span>📞</span><span style={{ direction:'ltr' }}>{d.phone}</span></div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: isMobile ? '18px 16px' : '24px 28px' }}>
                  <p style={{ color:'#475569', fontSize: isMobile ? 13 : 14, lineHeight:2, marginBottom:18, background:'#F8FAFC', padding:'14px 16px', borderRadius:12, border:`1px solid ${B}10`, [isRtl?'borderRight':'borderLeft']:`3px solid ${B}` }}>{d.bio}</p>
                  <div style={{ background:'linear-gradient(135deg,#fef9ee,#fff8e6)', borderRadius:14, border:`1px solid ${G}35`, padding:'16px 18px' }}>
                    <div style={{ fontSize:12, fontWeight:900, color:B, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:26, height:26, borderRadius:7, background:G, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🎓</span>
                      {t.expertiseLbl}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                      {d.expertise.map((exp,i) => (
                        <span key={i} style={{ background:'#fff', padding:'7px 14px', borderRadius:20, border:`1.5px solid ${G}50`, fontSize:12, fontWeight:700, color:B, transition:'all 0.2s', cursor:'default' }}
                          onMouseEnter={e=>{ e.currentTarget.style.background=`${G}15`; e.currentTarget.style.borderColor=G; e.currentTarget.style.transform='scale(1.05)'; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor=`${G}50`; e.currentTarget.style.transform=''; }}>
                          ✓ {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ); })()}

            {modal.type==='committee' && (()=>{ const c=modal.data; return (
              <div style={{ direction:t.dir }}>
                {c.head ? (
                  <div style={{ overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', background:`linear-gradient(135deg,${B},#2a4a7a)`, padding: isMobile ? '24px 18px 20px' : '32px 28px 24px', position:'relative', overflow:'hidden', gap:0 }}>
                      <div style={{ position:'relative', flexShrink:0, zIndex:2 }}>
                        <div style={{ width: isMobile ? 100 : 150, height: isMobile ? 100 : 150, borderRadius:16, overflow:'hidden', border:`4px solid ${G}`, animation:'glow-gold 3s ease-in-out infinite' }}>
                          <img src={c.head.image||'/president.png'} alt={c.head.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top', animation:'float-avatar 4s ease-in-out infinite' }}
                            onError={e=>{e.currentTarget.src=`https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=300&name=${encodeURIComponent(c.head.name)}`;}}/>
                        </div>
                        <div style={{ position:'absolute', bottom:-8, right:-8, width:30, height:30, borderRadius:'50%', background:G, border:'3px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:B, fontWeight:900 }}>✓</div>
                      </div>
                      <div style={{ flex:1, [isRtl?'marginRight':'marginLeft']: isMobile ? 14 : 20, zIndex:2 }}>
                        <div style={{ fontSize:10, fontWeight:800, color:G, background:`${G}20`, border:`1px solid ${G}40`, padding:'3px 10px', borderRadius:20, display:'inline-block', marginBottom:8 }}>{c.name}</div>
                        <div style={{ fontSize: isMobile ? 15 : 20, fontWeight:900, color:'#fff', lineHeight:1.3, marginBottom:6 }}>{c.head.name}</div>
                        <div style={{ fontSize: isMobile ? 11 : 12, color:'rgba(255,255,255,0.75)', lineHeight:1.6, marginBottom:10 }}>{c.head.title}</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'rgba(255,255,255,0.8)' }}><span>📧</span><span style={{ direction:'ltr' }}>{c.head.email}</span></div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'rgba(255,255,255,0.8)' }}><span>📞</span><span style={{ direction:'ltr' }}>{c.head.phone}</span></div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: isMobile ? '18px 16px' : '24px 28px' }}>
                      <p style={{ color:'#475569', fontSize: isMobile ? 13 : 14, lineHeight:2, marginBottom:18, background:'#F8FAFC', padding:'14px 16px', borderRadius:12, border:`1px solid ${B}10`, [isRtl?'borderRight':'borderLeft']:`3px solid ${B}` }}>{c.head.bio}</p>
                      <div style={{ background:'linear-gradient(135deg,#fef9ee,#fff8e6)', borderRadius:14, border:`1px solid ${G}35`, padding:'16px 18px' }}>
                        <div style={{ fontSize:12, fontWeight:900, color:B, marginBottom:12 }}>🎓 {t.expertiseLbl}</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                          {c.head.expertise.map((exp,i) => (
                            <span key={i} style={{ background:'#fff', padding:'7px 14px', borderRadius:20, border:`1.5px solid ${G}50`, fontSize:12, fontWeight:700, color:B, transition:'all 0.2s', cursor:'default' }}
                              onMouseEnter={e=>{ e.currentTarget.style.background=`${G}15`; e.currentTarget.style.transform='scale(1.05)'; }}
                              onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.transform=''; }}>
                              ✓ {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: isMobile ? '30px 20px' : '40px 30px', textAlign:'center' }}>
                    <div style={{ width:72, height:72, borderRadius:18, background:`${B}10`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 14px', animation:'float-avatar 3s ease-in-out infinite' }}>{c.icon}</div>
                    <div style={{ fontSize:20, fontWeight:900, color:B, marginBottom:4 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:R, background:`${R}0e`, padding:'4px 14px', borderRadius:30, display:'inline-block', marginBottom:14 }}>{t.execCommittee}</div>
                    <p style={{ color:'#475569', fontSize:14, lineHeight:1.9, background:'#F8FAFC', padding:'14px 16px', borderRadius:12, border:'1px solid #e8edf2', marginBottom:16, textAlign:isRtl?'right':'left' }}>{c.desc}</p>
                    <div style={{ background:'#fef9ee', borderRadius:12, border:`1px solid ${G}35`, padding:'14px 16px' }}>
                      <div style={{ fontSize:13, fontWeight:900, color:B, marginBottom:10 }}>👥 {t.membersLbl}</div>
                      {c.members.map((m,i) => (
                        <div key={i} style={{ background:'#fff', padding:'10px 14px', borderRadius:10, [isRtl?'borderRight':'borderLeft']:`3px solid ${G}`, fontSize:13, fontWeight:700, color:B, border:'1px solid #e8edf2', marginBottom:i<c.members.length-1?8:0 }}>✓ {m}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ); })()}

            {modal.type==='news' && (
              <div style={{ padding: isMobile ? '30px 20px' : '40px 30px', textAlign:'center', direction:t.dir }}>
                <div style={{ fontSize:40, marginBottom:14, display:'inline-flex', alignItems:'center', justifyContent:'center', width:80, height:80, background:`${R}0e`, borderRadius:18, animation:'float-avatar 3s ease-in-out infinite' }}>{modal.data.icon}</div>
                <div style={{ fontSize: isMobile ? 17 : 21, fontWeight:900, color:B, marginBottom:5 }}>{modal.data.title}</div>
                <div style={{ fontSize:12, color:'#94a3b8', fontWeight:600, marginBottom:12 }}>{modal.data.date}</div>
                <div style={{ width:40, height:3, background:`linear-gradient(90deg,${R},${G})`, borderRadius:3, margin:'0 auto 14px', backgroundSize:'200% 100%', animation:'shimmer-border 2s linear infinite' }}/>
                <div style={{ background:'#F8FAFC', borderRadius:12, padding:'16px 18px', fontSize: isMobile ? 13 : 15, color:'#475569', lineHeight:2, border:'1px solid #e8edf2', textAlign:isRtl?'right':'left' }}>{modal.data.content}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PresidentQuoteSlide({ t, isRtl, B, R, G, president }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${G}35`, overflow:'hidden', boxShadow:'0 4px 18px rgba(27,54,93,0.07)' }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background: open?`linear-gradient(135deg,${B}06,${G}10)`:'#fff', border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", borderBottom: open?`1px solid ${G}22`:'none', transition:'background 0.3s' }}>
        <div style={{
          width:48, height:48, borderRadius:'50%', overflow:'hidden',
          border:`3px solid ${open?G:'#e2e8f0'}`, flexShrink:0,
          transition:'border-color .3s, box-shadow .3s',
          boxShadow: open ? `0 0 16px 4px ${G}45` : 'none',
          animation: open ? 'float-avatar 3.5s ease-in-out infinite' : 'none',
        }}>
          <img src={president.image} alt={president.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            onError={e=>{e.currentTarget.src=`https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=200&name=${encodeURIComponent(president.name)}`;}}/>
        </div>
        <div style={{ flex:1, textAlign:isRtl?'right':'left' }}>
          <div style={{ fontSize:13, fontWeight:900, color:B, display:'flex', alignItems:'center', gap:6 }}>
            <span>💬</span>{t.presidentQuoteLabel}
          </div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{president.name}</div>
        </div>
        <div style={{ width:28, height:28, borderRadius:'50%', background: open?G:`${G}15`, border:`1px solid ${G}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color: open?B:'#9A7A10', transition:'all .35s', transform: open?'rotate(180deg)':'rotate(0)', flexShrink:0, fontWeight:900 }}>▼</div>
      </button>
      {open && (
        <div style={{ overflow:'hidden', animation:'slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{ padding:'16px 16px 18px' }}>
            <div style={{ position:'relative', fontSize:13, color:'#374151', lineHeight:2.1, background:`linear-gradient(135deg,#F8FAFC,#fef9ee)`, borderRadius:12, border:`1px solid ${G}22`, [isRtl?'borderRight':'borderLeft']:`3px solid ${G}`, padding:'14px 18px' }}>
              <span style={{ fontSize:44, color:`${G}28`, fontFamily:'serif', lineHeight:0, position:'absolute', top:24, [isRtl?'right':'left']:8, pointerEvents:'none' }}>"</span>
              <div style={{ [isRtl?'paddingRight':'paddingLeft']:26 }}>
                {t.presidentQuote.split('\n\n').map((para,i,arr) => (
                  <span key={i} style={{ display:'block', marginBottom: i<arr.length-1?12:0 }}>{para}</span>
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