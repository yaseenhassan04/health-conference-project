"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default function Home() {
  const [lang, setLang]           = useState('ar');
  const [modal, setModal]         = useState(null);
  const [counts, setCounts]       = useState({ speakers:0, sessions:0, attendees:0, countries:0 });
  const [visible, setVisible]     = useState({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging]   = useState(false);
  const [dragStart, setDragStart]     = useState(0);
  const [dragDelta, setDragDelta]     = useState(0);
  const [videoOpen, setVideoOpen]     = useState(false);

  const statsRef  = useRef(null);
  const animated  = useRef(false);
  const sliderRef = useRef(null);
  const autoPlay  = useRef(null);

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
      {name:'اللجنة التحضيرية',icon:'🏗️',desc:'تشرف على التخطيط العام للمؤتمر وتنسيق الجدول الزمني.',members:['د. محمد خطاب قنديل'],head:{ name:'د. محمد خطاب قنديل', title:'استشاري طب الطوارئ والحالات الحرجة', bio:'استشاري طب الطوارئ والحالات الحرجة، يعمل حاليا في غزة وسابقا في الدوحة. حاصل على البورد العربي والزمالة البريطانية في تخصصه. مدرس في كليات الطب بغزة وباحث أكاديمي متخصص بعدة أبحاث محكمة.', email:'khatab@medical.edu', phone:'+970-8-2816-2020', image:'/Mohamed_Khattab_Qandil.jpg', expertise:['طب الطوارئ','الحالات الحرجة','التعليم الطبي'] }},
      {name:'اللجنة العلمية',icon:'🔬',desc:'مسؤولة عن مراجعة الأبحاث وتحديد المحاور العلمية.',members:['د. محمود الشيخ علي'],head:{ name:'د. محمود الشيخ علي', title:'استشاري الطب الباطني والمناظير', bio:'استشاري الطب الباطني والمناظير مع خبرة عميقة في مجاله. حاصل على الزمالة البريطانية في الطب الباطني. رئيس اللجنة العلمية لمؤتمر الطب الباطني الثاني عشر المسؤول عن مراجعة وتقييم الأبحاث العلمية.', email:'drmnali@gmail.com', phone:'+972-56-703-3314', image:'/Mahmoud_Al_Sheikh_Ali.jpg', expertise:['الطب الباطني','المناظير','تقييم الأبحاث'] }},
      {name:'اللجنة الإعلامية',icon:'📢',desc:'تتولى التغطية الصحفية وإدارة منصات التواصل والموقع.',members:['د. مازن سليمان صافي'],head:{ name:'د. مازن سليمان صافي', title:'رئيس قسم الأدوية المخدرة والمراقبة — مجمع ناصر الطبي', bio:'رئيس قسم الأدوية المخدرة والمراقبة بمجمع ناصر الطبي، نائب مدير الصيدلية. حاصل على دبلوم دولي في القيادة وتدريب المدربين، وحاصل على الرخصة الدولية لقيادات الحاسوب. خريج جامعة العلوم التطبيقية قسم الصيدلة عام 1997. متخصص في الإعلام الطبي وكاتب محتوى احترافي دولي. عضو فعال في عدة لجان علمية وإدارية وقيادية بالمجمع.', email:'mazen@nasermedical.edu', phone:'+970-8-2822-2222', image:'/Mazen_Suleiman_Safi.jpg', expertise:['الأدوية المخدرة','إدارة الصيدلية','الإعلام الطبي','القيادة والتدريب'] }},
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
    presidentQuote:"It is my honor to welcome you to the International Medical Conference on Resilience and Sustainability.\n\nThis scientific forum embodies our noble mission: advancing healthcare standards and exchanging medical knowledge even in the most challenging of times. We invite all physicians and researchers to participate actively.",
    presidentFooter:'Conference President · International Medical Conference 2026',
    mediaCaptions:[{caption:'Nasser Medical Complex',tag:'Hospital'},{caption:'Opening Ceremony',tag:'Events'},{caption:'Medical Workshop',tag:'Workshops'},{caption:"Int'l Speakers",tag:'Speakers'},{caption:'Review Session',tag:'Sessions'}],
    president:{ name:'Dr. Ahmed Jumaa Al-Rubai', role:'Conference President', title:'Head of Internal Medicine — Consultant Internist', bio:'Consultant specialist in internal medicine, serving as Head of the Internal Medicine Department, with extensive experience in complex case management and scientific research oversight.', email:'rubai@medical.edu', phone:'+970-8-2816-1010', image:'/Mohamed_El_Rouby.jpg', expertise:['Internal Medicine','Department Management','Scientific Research'] },
    supervisor:{ name:'Dr. Omar Al-Astal', role:'General Supervisor', title:'Pulmonology & Critical Care — USA', bio:'International consultant in pulmonology and critical care, experienced in American hospitals, overseeing the scientific and organizational aspects of the conference.', email:'astal@medical.edu', phone:'+1-555-000-1234', image:'/Amr_Al_Astal.jpg', expertise:['Pulmonology','Critical Care',"Int'l Medicine"] },
    committees:[
      {name:'Preparatory Committee',icon:'🏗️',desc:'Oversees general planning and timeline coordination.',members:['Dr. Mohammad Qandil'],head:{ name:'Dr. Mohammed Khatab Qandil', title:'Emergency Medicine & Critical Care Consultant', bio:'Consultant in Emergency Medicine and Critical Care, currently working in Gaza and previously in Doha. Holds the Arab Board and British Fellowship in his specialty. Teacher at Gaza Medical Schools and academic researcher with multiple published peer-reviewed papers.', email:'khatab@medical.edu', phone:'+970-8-2816-2020', image:'//Mohamed_Khattab_Qandil.jpg', expertise:['Emergency Medicine','Critical Care','Medical Education'] }},
      {name:'Scientific Committee',icon:'🔬',desc:'Reviews abstracts, sets themes, and selects speakers.',members:['Dr. Mahmoud Al-Sheikh Ali'],head:{ name:'Dr. Mahmoud Al-Sheikh Ali', title:'Consultant Internal Medicine & Endoscopy', bio:'Consultant in Internal Medicine and Endoscopy with deep expertise in his field. Holds the British Fellowship in Internal Medicine. Head of the Scientific Committee for the 12th Internal Medicine Conference, responsible for reviewing and evaluating scientific research.', email:'sheikh@medical.edu', phone:'+970-8-2816-3030', image:'/Mahmoud_Al_Sheikh_Ali.jpg', expertise:['Internal Medicine','Endoscopy','Research Evaluation'] }},
      {name:'Media Committee',icon:'📢',desc:'Handles press coverage and social media management.',members:['Dr. Mazen Soliman Safi'],head:{ name:'Dr. Mazen Soliman Safi', title:'Head of Controlled Medications Department — Nasser Medical Complex', bio:'Head of Controlled Medications and Monitoring Department at Nasser Medical Complex, Deputy Pharmacy Manager. Holds international diploma in leadership and trainer training. International certified in computer leadership. Pharmacy graduate from Applied Science University 1997. Specialist in medical media and international professional content writer. Active member of multiple scientific, administrative and leadership committees.', email:'mazen@nasermedical.edu', phone:'+970-8-2822-2222', image:'/Mazen_Suleiman_Safi.jpg', expertise:['Controlled Medications','Pharmacy Management','Medical Media','Leadership & Training'] }},
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

  const statIcons = ['🎤','🔬','👥','🌍'];
  const statColors = [R, B, '#0e7490', '#047857'];

  const rev = (id, delay=0) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  const slideTranslate = `translateX(calc(${isRtl?'+':'-'}${activeSlide*100}% + ${isRtl?-dragDelta:dragDelta}px))`;

  // ── NAVBAR HEIGHT=60, ECG=38 → top=98 ──
  const STICKY_TOP = 120;

  const Avatar = ({ src, name, size=64, border=3 }) => (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', border:`${border}px solid ${G}`, boxShadow:`0 4px 16px rgba(27,54,93,0.12)`, background:'#eef2f7', flexShrink:0 }}>
      <img src={src||'/president.png'} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
        onError={e=>{ e.currentTarget.onerror=null; e.currentTarget.src=`https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=300&name=${encodeURIComponent(name)}`; }}/>
    </div>
  );

  return (
    <div style={{ direction:t.dir, fontFamily:"'Cairo',sans-serif", background:'#F0F4F9', minHeight:'100vh' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .ecg-line{stroke-dasharray:1400;stroke-dashoffset:1400;animation:ecg 3.5s linear infinite;}
        @keyframes ecg{to{stroke-dashoffset:0;}}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.7)}}
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
        @keyframes slide-up{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes quote-slide{from{max-height:0;opacity:0;transform:translateY(-8px)}to{max-height:900px;opacity:1;transform:translateY(0)}}
        @keyframes progress-bar{from{width:0%}to{width:100%}}
        @keyframes hero-glow{0%,100%{box-shadow:0 4px 24px rgba(212,175,55,0.18),0 8px 32px rgba(27,54,93,0.1)}50%{box-shadow:0 6px 32px rgba(212,175,55,0.28),0 10px 36px rgba(27,54,93,0.14)}}

        .stat-card{transition:all .3s;cursor:default;}
        .stat-card:hover{transform:translateY(-6px) scale(1.03)!important;}
        .person-card:hover{transform:translateY(-4px)!important;box-shadow:0 14px 32px rgba(27,54,93,0.13)!important;}
        .news-item:hover{background:linear-gradient(135deg,#fffbf0,#fff)!important;transform:translateX(${isRtl?'-':''}3px)!important;}
        .comm-row:hover{background:#f8f9ff!important;}
        .btn-pri:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(200,16,46,0.35)!important;}
        .modal-box{animation:slide-up .32s cubic-bezier(.34,1.56,.64,1);}
        .modal-close:hover{background:#fee2e2!important;color:${R}!important;}

        .slide-track{display:flex;transition:transform 0.5s cubic-bezier(0.25,0.8,0.25,1);will-change:transform;}
        .slide-track.drag{transition:none!important;}
        .slider-arrow{position:absolute;top:50%;transform:translateY(-50%);background:rgba(27,54,93,0.45);backdrop-filter:blur(6px);border:1px solid rgba(212,175,55,0.3);border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;color:#fff;z-index:10;transition:all .22s;}
        .slider-arrow:hover{background:rgba(200,16,46,0.75)!important;}
        .thumb-item{cursor:pointer;transition:all .22s;opacity:.5;border:2px solid transparent;border-radius:8px;overflow:hidden;flex-shrink:0;width:80px;height:52px;background:#dde3ec;position:relative;}
        .thumb-item:hover{opacity:.8;}
        .thumb-item.active{opacity:1;border-color:${G};box-shadow:0 0 8px ${G}55;}

        @media(max-width:1100px){
          .layout-3col{flex-direction:column!important;}
          .sidebar-r,.sidebar-l{width:100%!important;position:static!important;}
        }
        @media(max-width:700px){
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;}
        }

        /* ========== HOVER EFFECTS PROFESSIONAL ========== */
        /* 1. بطاقات احترافية - للكروت والبطاقات */
        .pro-card {
          transition: all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1) !important;
          position: relative;
          overflow: hidden;
        }
        .pro-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent);
          transition: left 0.6s ease;
          z-index: 0;
          pointer-events: none;
        }
        .pro-card:hover::before {
          left: 100%;
        }
        .pro-card:hover {
          transform: translateY(-5px) scale(1.01) !important;
          box-shadow: 0 20px 35px -12px rgba(27,54,93,0.25), 0 0 0 1px rgba(212,175,55,0.3) !important;
        }

        /* 2. أزرار احترافية */
        .pro-btn {
          transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1) !important;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        .pro-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          transform: translate(-50%, -50%);
          transition: width 0.5s ease, height 0.5s ease;
          z-index: -1;
        }
        .pro-btn:hover::before {
          width: 300px;
          height: 300px;
        }
        .pro-btn:hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 22px rgba(200,16,46,0.35) !important;
        }

        /* 3. روابط احترافية */
        .pro-link {
          position: relative;
          transition: all 0.3s ease;
        }
        .pro-link::after {
          content: '';
          position: absolute;
          bottom: -3px;
          right: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #C8102E, #D4AF37);
          transition: width 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .pro-link:hover {
          transform: translateX(4px);
          color: #C8102E !important;
        }
        .pro-link:hover::after {
          width: 100%;
          left: 0;
          right: auto;
        }

        /* 4. أيقونات احترافية */
        .pro-icon {
          transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .pro-icon:hover {
          transform: scale(1.1) rotate(5deg);
          filter: drop-shadow(0 4px 8px rgba(212,175,55,0.4));
        }

        /* 5. صور احترافية */
        .pro-image {
          transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.2);
          overflow: hidden;
        }
        .pro-image:hover {
          transform: scale(1.03);
          filter: brightness(1.02) contrast(1.05);
        }

        /* 6. بطاقات الأخبار */
        .pro-news {
          transition: all 0.32s ease-out;
          position: relative;
          border-left: 3px solid transparent;
        }
        .pro-news:hover {
          transform: translateX(6px);
          border-left-color: #D4AF37 !important;
          background: linear-gradient(135deg, #FFFBEB, #FFFFFF) !important;
          box-shadow: 0 8px 22px -12px rgba(0,0,0,0.12);
        }

        /* 7. تأثير نبض للمؤشرات */
        @keyframes pro-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(212,175,55,0); }
        }
        .pro-pulse:hover {
          animation: pro-pulse 0.8s ease-out;
        }

        /* 8. تأثير زئبقي للكاروسيل */
        .pro-slide-arrow {
          transition: all 0.25s ease;
        }
        .pro-slide-arrow:hover {
          background: #C8102E !important;
          transform: translateY(-50%) scale(1.12) !important;
          box-shadow: 0 4px 14px rgba(200,16,46,0.45);
        }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav style={{ height:60, background:'rgba(27,54,93,0.97)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:400, boxShadow:`0 2px 16px rgba(27,54,93,0.25)` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:9, height:9, borderRadius:'50%', background:R, animation:'pulse-dot 1.4s ease-in-out infinite' }}/>
          <div style={{ width:1, height:20, background:'rgba(255,255,255,0.15)', margin:'0 4px' }}/>
          <span style={{ fontSize:14, fontWeight:800, color:'rgba(255,255,255,0.92)', letterSpacing:'0.3px' }}>
            {isRtl ? 'مؤتمر الصمود الطبي الدولي ٢٠٢٦' : 'International Medical Resilience Conference 2026'}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ fontSize:12.5, fontWeight:700, color:G, background:`${G}18`, border:`1px solid ${G}35`, padding:'4px 14px', borderRadius:20, direction:'ltr' }}>4–5 Dec 2026</div>
          <button onClick={()=>setLang(lang==='ar'?'en':'ar')}
            style={{ padding:'7px 18px', border:`1.5px solid rgba(255,255,255,0.3)`, borderRadius:40, background:'transparent', color:'#fff', fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .2s', display:'flex', alignItems:'center', gap:6 }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.12)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
            🌐 {t.langTxt}
          </button>
        </div>
      </nav>

      {/* ══ ECG STRIP ══ */}
      <div style={{ height:38, background:`linear-gradient(90deg,#EBF0F7,#F0F4F9,#EBF0F7)`, overflow:'hidden', position:'relative', borderBottom:`1px solid ${G}30` }}>
        <svg width="100%" height="38" viewBox="0 0 1200 38" preserveAspectRatio="none" style={{ position:'absolute', top:0 }}>
          <path className="ecg-line" d="M0 19 L70 19 L86 4 L102 34 L118 19 L230 19 L246 2 L266 36 L282 19 L460 19 L476 4 L492 34 L508 19 L660 19 L676 2 L696 36 L712 19 L860 19 L876 4 L892 34 L908 19 L1200 19" fill="none" stroke={B} strokeWidth="1.8" vectorEffect="non-scaling-stroke" opacity="0.25"/>
          <path className="ecg-line" d="M0 19 L70 19 L86 4 L102 34 L118 19 L230 19 L246 2 L266 36 L282 19 L460 19 L476 4 L492 34 L508 19 L660 19 L676 2 L696 36 L712 19 L860 19 L876 4 L892 34 L908 19 L1200 19" fill="none" stroke={R} strokeWidth="1.4" vectorEffect="non-scaling-stroke" opacity="0.35" style={{ animationDelay:'0.4s' }}/>
        </svg>
        <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', gap:6, direction:'ltr' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', animation:'pulse-dot 1s ease-in-out infinite' }}/>
          <span style={{ fontSize:10.5, fontWeight:700, color:'#64748b', letterSpacing:'0.5px' }}>LIVE MONITORING</span>
        </div>
      </div>

      {/* ══ MAIN 3-COL LAYOUT ══ */}
      <div className="layout-3col" style={{ display:'flex', alignItems:'flex-start', maxWidth:1560, margin:'0 auto', padding:'22px 18px 0', gap:22 }}>

        {/* ════ RIGHT SIDEBAR ════ */}
        <aside className="sidebar-r" style={{ width:320, flexShrink:0, position:'sticky', top:STICKY_TOP, display:'flex', flexDirection:'column', gap:16 }}>

          {/* ── LOGO CARD ── */}
          <div style={{
            background:`linear-gradient(160deg,#FAFBFD 0%,#F2F6FB 60%,#EBF0F8 100%)`,
            borderRadius:18, overflow:'hidden',
            boxShadow:`0 4px 24px rgba(27,54,93,0.1), 0 0 0 1px ${G}35`,
            border:`1px solid ${G}30`,
            position:'relative', animation:'hero-glow 4s ease-in-out infinite'
          }}>
            <div style={{ height:5, background:`linear-gradient(90deg,${R},${G},${R})` }}/>
            <div style={{ position:'absolute', top:-30, right:-30, width:130, height:130, borderRadius:'50%', background:`${G}10`, pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:-20, left:-20, width:90, height:90, borderRadius:'50%', background:`${R}06`, pointerEvents:'none' }}/>

            <div style={{ padding:'24px 20px', textAlign:'center', position:'relative', zIndex:1 }}>
              <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${G},#b8941f)`, color:'#1a1000', fontSize:12, fontWeight:900, padding:'5px 18px', borderRadius:30, marginBottom:16, letterSpacing:'1px', boxShadow:`0 3px 10px ${G}35` }}>
                {isRtl ? '• المؤتمر الثاني عشر •' : '• 12th EDITION •'}
              </div>

             

             

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <Link href="/registration" className="btn-pri pro-btn"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:`linear-gradient(135deg,${R},#a80d24)`, color:'#fff', borderRadius:11, fontFamily:"'Cairo',sans-serif", fontSize:14.5, fontWeight:800, textDecoration:'none', transition:'all .22s', boxShadow:`0 4px 14px ${R}40` }}>
                  🎫 {t.btnReg}
                </Link>
                <Link href="/participation" className="pro-btn"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', background:'#fff', color:B, borderRadius:11, fontFamily:"'Cairo',sans-serif", fontSize:14, fontWeight:700, textDecoration:'none', transition:'all .22s', border:`1.5px solid ${B}25` }}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${B}08`;}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#fff';}}>
                  🎓 {t.btnProg}
                </Link>
              </div>
            </div>
          </div>

          {/* ── PRESIDENT & SUPERVISOR ── */}
          <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${G}28`, overflow:'hidden', boxShadow:'0 3px 14px rgba(27,54,93,0.07)' }}>
            <div style={{ padding:'12px 16px', background:`linear-gradient(135deg,${B}06,${G}08)`, borderBottom:`1px solid ${B}0c`, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>👥</span>
              <span style={{ fontSize:14, fontWeight:900, color:B }}>{t.leadersTitle}</span>
            </div>
            {[
              { data:t.president,  badge:t.presidentBadge,  bc:R,     bt:'#fff' },
              { data:t.supervisor, badge:t.supervisorBadge, bc:'#9A7A10', bt:'#fff' },
            ].map(({ data, badge, bc, bt }, idx) => (
              <div key={idx} className="person-card"
                onClick={() => setModal({ type:'person', data })}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 16px', borderBottom:idx===0?`1px solid ${B}08`:'none', cursor:'pointer', transition:'all .25s', background:'#fff', border:'1px solid transparent' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <Avatar src={data.image} name={data.name} size={64} border={3}/>
                  <div style={{ position:'absolute', bottom:-2, [isRtl?'left':'right']:-2, width:20, height:20, borderRadius:'50%', background:bc, border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:bt, fontWeight:900 }}>✓</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:bc, marginBottom:4, background:`${bc}12`, padding:'3px 10px', borderRadius:20, display:'inline-block' }}>{badge}</div>
                  <div style={{ fontSize:14, fontWeight:900, color:B, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:2 }}>{data.name}</div>
                  <div style={{ fontSize:11, color:'#64748b', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{data.title.split('—')[0].trim()}</div>
                </div>
                <span style={{ color:'#cbd5e1', fontSize:16, flexShrink:0 }}>{isRtl?'‹':'›'}</span>
              </div>
            ))}
          </div>

          {/* ── COMMITTEES ── */}
          <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${G}28`, overflow:'hidden', boxShadow:'0 3px 14px rgba(27,54,93,0.07)' }}>
            <div style={{ padding:'12px 16px', background:`linear-gradient(135deg,${B}06,${G}08)`, borderBottom:`1px solid ${B}0c`, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>🏛️</span>
              <span style={{ fontSize:14, fontWeight:900, color:B }}>{t.committeesTitle}</span>
            </div>
            {t.committees.map((c,i) => (
              <button key={i} className="comm-row"
                onClick={() => setModal({ type:'committee', data:c })}
                style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'14px 16px', background:'#fff', border:'none', borderBottom:i<t.committees.length-1?`1px solid ${B}07`:'none', cursor:'pointer', transition:'all .22s', fontFamily:"'Cairo',sans-serif", color:B, textAlign:isRtl?'right':'left' }}>
                <div style={{ width:40, height:40, borderRadius:11, background:`linear-gradient(135deg,${B}08,${G}12)`, border:`1px solid ${G}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:800, color:B, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize:11.5, color:'#94a3b8', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.members[0]}</div>
                </div>
                <span style={{ color:'#cbd5e1', fontSize:16, flexShrink:0 }}>{isRtl?'‹':'›'}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* ════ CENTER COLUMN ════ */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* ── HERO — IMAGE ONLY ── */}
          <div style={{
            ...rev('hero', 0),
            borderRadius:22, overflow:'hidden', marginBottom:22,
            boxShadow:`0 0 0 3px ${G}50, 0 12px 40px rgba(27,54,93,0.15)`,
            position:'relative',
          }}>
            <img
              src="/hero-banner.png"
              alt={isRtl ? 'شعار المؤتمر' : 'Conference Banner'}
              className="pro-image"
              style={{ width:'100%', display:'block', objectFit:'cover', objectPosition:'center top', minHeight:320, maxHeight:360 }}
              onError={e => {
                e.currentTarget.style.display='none';
                const p=e.currentTarget.parentElement;
                p.style.background=`linear-gradient(135deg,${G}18,#EBF0F8)`;
                p.style.minHeight='320px';
                p.style.maxHeight='360px';
                p.style.display='flex';
                p.style.alignItems='center';
                p.style.justifyContent='center';
                const d=document.createElement('div');
                d.style.cssText='text-align:center;padding:40px;';
                d.innerHTML=`<div style="font-size:72px;margin-bottom:18px">🏥</div><div style="font-size:20px;font-weight:900;color:${B}">${isRtl?'المؤتمر الطبي الدولي الثاني عشر':'12th International Medical Conference'}</div>`;
                p.appendChild(d);
              }}
            />
            <div style={{ position:'absolute', top:0, left:0, right:0, height:5, background:`linear-gradient(90deg,${R},${G},${R})` }}/>
          </div>

          {/* ── STATS ── */}
          <div ref={statsRef} data-reveal="stats"
            className="stats-grid"
            style={{ ...rev('stats',0.05), display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
            {statIcons.map((ico, i) => (
              <div key={i} className="stat-card pro-card"
                style={{ background:'#fff', borderRadius:16, padding:'22px 16px', border:`1px solid ${statColors[i]}18`, boxShadow:`0 3px 14px rgba(27,54,93,0.06)`, position:'relative', overflow:'hidden', textAlign:'center' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${statColors[i]},${statColors[i]}55)` }}/>
                <div style={{ position:'absolute', bottom:-8, [isRtl?'left':'right']:-4, fontSize:58, fontWeight:900, color:`${statColors[i]}07`, lineHeight:1, pointerEvents:'none', direction:'ltr' }}>{statVals[i]}</div>
                <div style={{ fontSize:32, marginBottom:8 }} className="pro-icon">{ico}</div>
                <div style={{ fontSize:36, fontWeight:900, color:statColors[i], lineHeight:1, marginBottom:8, direction:'ltr', letterSpacing:'-1px' }}>{statVals[i]}</div>
                <div style={{ fontSize:12, color:'#64748b', fontWeight:700, lineHeight:1.4 }}>{t.statsLbls[i]}</div>
              </div>
            ))}
          </div>

          {/* ── GALLERY ── */}
          <div data-reveal="gallery" style={{ ...rev('gallery',0.05), background:'#FFFFFF', borderRadius:22, overflow:'hidden', marginBottom:32, boxShadow:'0 4px 24px rgba(27,54,93,0.09)', border:`1px solid ${G}30` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:`1px solid ${B}0c`, background:'#FAFBFD' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`${G}15`, border:`1px solid ${G}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎞️</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:900, color:B }}>{t.galleryTitle}</div>
                  <div style={{ fontSize:11.5, color:'#94a3b8', marginTop:2 }}>{t.gallerySub}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button className="btn-pri" onClick={()=>setVideoOpen(true)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', background:`linear-gradient(135deg,${R},#a80d24)`, border:'none', borderRadius:20, cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:12.5, fontWeight:800, color:'#fff', transition:'all .2s' }}>
                  ▶ {isRtl?'الفيديو':'Video'}
                </button>
                <div style={{ fontSize:12.5, fontWeight:700, color:'#9A7A10', background:`${G}15`, border:`1px solid ${G}30`, padding:'4px 14px', borderRadius:20, direction:'ltr' }}>{activeSlide+1} / {mediaItems.length}</div>
              </div>
            </div>

            <div ref={sliderRef} style={{ position:'relative', overflow:'hidden', userSelect:'none' }}
              onMouseDown={e=>onDragStart(e.clientX)} onMouseMove={e=>onDragMove(e.clientX)} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
              onTouchStart={e=>onDragStart(e.touches[0].clientX)} onTouchMove={e=>{e.preventDefault();onDragMove(e.touches[0].clientX);}} onTouchEnd={onDragEnd}>

              <div className={`slide-track${isDragging?' drag':''}`} style={{ transform:slideTranslate }}>
                {mediaItems.map((item,i) => {
                  const meta = t.mediaCaptions[i]||{ caption:'', tag:'' };
                  return (
                    <div key={i} style={{ minWidth:'100%', height:400, position:'relative', flexShrink:0, background:`linear-gradient(135deg,${G}12,#EBF0F8)` }}>
                      <img src={item.src} alt={meta.caption} draggable={false}
                        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', pointerEvents:'none' }}
                        onError={e=>{
                          e.currentTarget.style.display='none';
                          const p=e.currentTarget.parentElement;
                          const d=document.createElement('div');
                          d.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';
                          d.innerHTML=`<span style="font-size:64px">🏥</span><span style="color:${B};font-size:17px;font-weight:700;">${meta.caption}</span>`;
                          p.appendChild(d);
                        }}/>
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 50%,rgba(27,54,93,0.6))', pointerEvents:'none' }}/>
                      <div style={{ position:'absolute', top:16, [isRtl?'right':'left']:16, background:G, color:B, fontSize:12, fontWeight:900, padding:'5px 16px', borderRadius:30, boxShadow:`0 2px 8px ${G}50` }}>{meta.tag}</div>
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'32px 26px 18px', pointerEvents:'none' }}>
                        <div style={{ fontSize:16, fontWeight:800, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>{meta.caption}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:8 }}>
                          {mediaItems.map((_,di) => (
                            <div key={di} style={{ width:di===i?22:7, height:7, borderRadius:4, background:di===i?G:'rgba(255,255,255,0.4)', transition:'all .35s' }}/>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {[{s:'left',d:isRtl?+1:-1,c:'‹'},{s:'right',d:isRtl?-1:+1,c:'›'}].map(btn => (
                <button key={btn.s} className="slider-arrow pro-slide-arrow" onClick={()=>goTo(activeSlide+btn.d)} style={{ [btn.s]:16 }}>{btn.c}</button>
              ))}

              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:4, background:`${B}15`, zIndex:5 }}>
                <div key={activeSlide} style={{ height:'100%', background:`linear-gradient(90deg,${G},${R})`, animation:'progress-bar 5s linear' }}/>
              </div>
            </div>

            {/* Thumbnails */}
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
          </div>
        </div>

        {/* ════ LEFT SIDEBAR ════ */}
        <aside className="sidebar-l" style={{ width:300, flexShrink:0, position:'sticky', top:STICKY_TOP, display:'flex', flexDirection:'column', gap:16 }}>

          <PresidentQuoteSlide t={t} isRtl={isRtl} B={B} R={R} G={G} president={t.president} />

          {/* ── NEWS ── */}
          <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${B}12`, overflow:'hidden', boxShadow:'0 3px 14px rgba(27,54,93,0.07)' }}>
            <div style={{ padding:'12px 16px', background:`linear-gradient(135deg,${B}06,${R}05)`, borderBottom:`1px solid ${B}0c`, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:R, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>📰</div>
              <span style={{ fontSize:14, fontWeight:900, color:B }}>{t.newsTitle}</span>
              <div style={{ marginLeft:'auto', width:9, height:9, borderRadius:'50%', background:'#22c55e', animation:'pulse-dot 1.2s ease-in-out infinite' }}/>
            </div>
            {t.news.map((n,i) => (
              <div key={i} className="news-item pro-news"
                onClick={() => setModal({ type:'news', data:n })}
                style={{
                  padding:'16px 16px',
                  borderBottom:i<t.news.length-1?`1px solid ${B}08`:'none',
                  cursor:'pointer', transition:'all .22s',
                  [isRtl?'borderRight':'borderLeft']:`3px solid ${[R,G,B][i]}`,
                  background:'#fff'
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:6 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:`${[R,G,B][i]}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{n.icon}</div>
                  <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8' }}>{n.date}</span>
                  <span style={{ marginLeft:'auto', fontSize:12, color:'#cbd5e1' }}>→</span>
                </div>
                <div style={{ fontSize:14, fontWeight:800, color:B, lineHeight:1.5 }}>{n.title}</div>
                <div style={{ fontSize:12, color:'#94a3b8', marginTop:4, lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{n.content}</div>
              </div>
            ))}
          </div>

          {/* ── QUICK LINKS ── */}
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
              <Link key={i} href={link.href} className="pro-link"
                style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:i<3?`1px solid ${B}07`:'none', textDecoration:'none', transition:'all .2s', background:'#fff', color:B }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${G}08`; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; }}>
                <div style={{ width:36, height:36, borderRadius:9, background:`${B}08`, border:`1px solid ${B}10`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }} className="pro-icon">{link.icon}</div>
                <span style={{ fontSize:13.5, fontWeight:700 }}>{link.label}</span>
                <span style={{ marginLeft:'auto', fontSize:14, color:'#cbd5e1' }}>{isRtl?'‹':'›'}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding:'22px 36px', borderTop:`1px solid ${G}25`, textAlign:'center', background:'#fff', color:'#94a3b8', fontSize:13, fontWeight:600, marginTop:32 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
          <span>{t.footer}</span>
          <span style={{ color:'#e2e8f0' }}>|</span>
          <span style={{ direction:'ltr', color:'#cbd5e1' }}>Nasser Medical Complex · Gaza · 4–5 Dec 2026</span>
        </div>
      </footer>

      {/* ══ VIDEO LIGHTBOX ══ */}
      {videoOpen && (
        <div onClick={()=>setVideoOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, animation:'fade-in .2s', padding:20 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ position:'relative', width:'100%', maxWidth:900, borderRadius:18, overflow:'hidden', boxShadow:`0 30px 100px rgba(0,0,0,0.5)`, border:`1px solid ${G}30` }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${R},${G},${R})`, zIndex:10 }}/>
            <button onClick={()=>setVideoOpen(false)}
              style={{ position:'absolute', top:16, right:16, background:R, border:'none', borderRadius:'50%', width:42, height:42, color:'#fff', fontSize:18, cursor:'pointer', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}>✕</button>
            <video src="/promo-video.mp4" controls autoPlay playsInline poster="/hospital-side.jpg"
              style={{ width:'100%', display:'block', background:'#000', maxHeight:'80vh' }}
              onError={e=>{
                e.currentTarget.style.display='none';
                const p=e.currentTarget.parentElement;
                const d=document.createElement('div');
                d.style.cssText=`padding:70px;text-align:center;background:#F0F4F9;font-family:'Cairo',sans-serif;`;
                d.innerHTML=`<div style="font-size:60px;margin-bottom:18px">▶️</div><div style="font-size:18px;font-weight:700;color:${B}">${isRtl?'سيتم تحميل الفيديو قريباً':'Video will be available soon'}</div>`;
                p.appendChild(d);
              }}/>
          </div>
        </div>
      )}

      {/* ══ MODALS ══ */}
      {modal && (
        <div onClick={()=>setModal(null)}
          style={{ position:'fixed', inset:0, background:'rgba(27,54,93,0.6)', display:'flex', alignItems:'flex-start', justifyContent:'center', zIndex:999, backdropFilter:'blur(8px)', animation:'fade-in .2s', overflowY:'auto', padding:`${STICKY_TOP + 16}px 20px 40px` }}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}
            style={{ background:'#fff', borderRadius:24, width:'100%', maxWidth:520, position:'relative', boxShadow:`0 28px 70px rgba(27,54,93,0.2), 0 0 0 1px ${G}20`, borderTop:`5px solid ${modal.type==='news'?R:G}`, maxHeight:'82vh', overflowY:'auto' }}>
            <button onClick={()=>setModal(null)} className="modal-close"
              style={{ position:'absolute', top:16, [isRtl?'left':'right']:16, background:'#f1f5f9', border:'none', borderRadius:'50%', width:38, height:38, cursor:'pointer', fontSize:16, color:'#64748b', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s' }}>✕</button>

            {modal.type==='person' && (()=>{ const d=modal.data; return (
  <div style={{ direction:t.dir, overflow:'hidden' }}>
    {/* ── Header مع صورة كبيرة ── */}
    <div style={{ 
      display:'flex', alignItems:'flex-start', gap:0,
      background:`linear-gradient(135deg,${B} 0%,#2a4a7a 60%,#1a3060 100%)`,
      padding:'32px 28px 24px', position:'relative', overflow:'hidden'
    }}>
      {/* خلفية زخرفية */}
      <div style={{ position:'absolute', top:-40, left:-40, width:200, height:200, borderRadius:'50%', background:`${G}12`, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:-30, right:-30, width:150, height:150, borderRadius:'50%', background:`${R}10`, pointerEvents:'none' }}/>
      
      {/* الصورة الكبيرة */}
      <div style={{ position:'relative', flexShrink:0, zIndex:2 }}>
        <div style={{ 
          width:150, height:150, borderRadius:20,
          overflow:'hidden', border:`4px solid ${G}`,
          boxShadow:`0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px ${G}40`
        }}>
          <img src={d.image||'/president.png'} alt={d.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}
            onError={e=>{e.currentTarget.src=`https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=300&name=${encodeURIComponent(d.name)}`;}}/>
        </div>
        {/* شارة التحقق */}
        <div style={{ position:'absolute', bottom:-8, right:-8, width:36, height:36, borderRadius:'50%', background:R, border:'3px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#fff', fontWeight:900, boxShadow:'0 3px 10px rgba(0,0,0,0.3)' }}>✓</div>
      </div>

      {/* المعلومات الأساسية بجانب الصورة */}
      <div style={{ flex:1, [isRtl?'marginRight':'marginLeft']:20, zIndex:2 }}>
        <div style={{ fontSize:11, fontWeight:800, color:G, background:`${G}20`, border:`1px solid ${G}40`, padding:'4px 12px', borderRadius:20, display:'inline-block', marginBottom:10, letterSpacing:'0.5px' }}>
          {d.role}
        </div>
        <div style={{ fontSize:20, fontWeight:900, color:'#fff', lineHeight:1.3, marginBottom:8 }}>{d.name}</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', lineHeight:1.6, marginBottom:12 }}>{d.title}</div>
        {/* شريط ذهبي */}
        <div style={{ width:40, height:3, background:G, borderRadius:3, marginBottom:14 }}/>
        {/* معلومات الاتصال السريع */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:11.5, color:'rgba(255,255,255,0.8)' }}>
            <span style={{ fontSize:13 }}>📧</span>
            <span style={{ direction:'ltr' }}>{d.email}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:11.5, color:'rgba(255,255,255,0.8)' }}>
            <span style={{ fontSize:13 }}>📞</span>
            <span style={{ direction:'ltr' }}>{d.phone}</span>
          </div>
        </div>
      </div>
    </div>

    {/* ── Body المحتوى ── */}
    <div style={{ padding:'24px 28px' }}>
      {/* السيرة الذاتية */}
      <p style={{ color:'#475569', fontSize:14, lineHeight:2, marginBottom:20, background:'#F8FAFC', padding:'16px 18px', borderRadius:12, border:`1px solid ${B}10`, textAlign:isRtl?'right':'left', borderRight: isRtl?`3px solid ${B}`:'none', borderLeft: isRtl?'none':`3px solid ${B}` }}>{d.bio}</p>

      {/* التخصصات */}
      <div style={{ background:`linear-gradient(135deg,#fef9ee,#fff8e6)`, borderRadius:14, border:`1px solid ${G}35`, padding:'18px 20px' }}>
        <div style={{ fontSize:13, fontWeight:900, color:B, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:28, height:28, borderRadius:8, background:G, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🎓</span>
          {t.expertiseLbl}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {d.expertise.map((exp,i) => (
            <span key={i} style={{ background:'#fff', padding:'8px 16px', borderRadius:20, border:`1.5px solid ${G}50`, fontSize:13, fontWeight:700, color:B, boxShadow:`0 2px 6px ${G}20` }}>✓ {exp}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
); })()}

            {modal.type==='committee' && (()=>{ const c=modal.data; return (
              <div style={{ padding:'40px 30px', textAlign:'center', direction:t.dir }}>
                {c.head ? (
  <div style={{ direction:t.dir, overflow:'hidden' }}>
    <div style={{ 
      display:'flex', alignItems:'flex-start', gap:0,
      background:`linear-gradient(135deg,${B} 0%,#2a4a7a 60%,#1a3060 100%)`,
      padding:'32px 28px 24px', position:'relative', overflow:'hidden'
    }}>
      <div style={{ position:'absolute', top:-40, left:-40, width:200, height:200, borderRadius:'50%', background:`${G}12`, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:-30, right:-30, width:150, height:150, borderRadius:'50%', background:`${R}10`, pointerEvents:'none' }}/>
      
      <div style={{ position:'relative', flexShrink:0, zIndex:2 }}>
        <div style={{ width:150, height:150, borderRadius:20, overflow:'hidden', border:`4px solid ${G}`, boxShadow:`0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px ${G}40` }}>
          <img src={c.head.image||'/president.png'} alt={c.head.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}
            onError={e=>{e.currentTarget.src=`https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=300&name=${encodeURIComponent(c.head.name)}`;}}/>
        </div>
        <div style={{ position:'absolute', bottom:-8, right:-8, width:36, height:36, borderRadius:'50%', background:G, border:'3px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:B, fontWeight:900, boxShadow:'0 3px 10px rgba(0,0,0,0.3)' }}>✓</div>
      </div>

      <div style={{ flex:1, [isRtl?'marginRight':'marginLeft']:20, zIndex:2 }}>
        <div style={{ fontSize:11, fontWeight:800, color:G, background:`${G}20`, border:`1px solid ${G}40`, padding:'4px 12px', borderRadius:20, display:'inline-block', marginBottom:10 }}>{c.name}</div>
        <div style={{ fontSize:20, fontWeight:900, color:'#fff', lineHeight:1.3, marginBottom:8 }}>{c.head.name}</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', lineHeight:1.6, marginBottom:12 }}>{c.head.title}</div>
        <div style={{ width:40, height:3, background:G, borderRadius:3, marginBottom:14 }}/>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:11.5, color:'rgba(255,255,255,0.8)' }}>
            <span>📧</span><span style={{ direction:'ltr' }}>{c.head.email}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:11.5, color:'rgba(255,255,255,0.8)' }}>
            <span>📞</span><span style={{ direction:'ltr' }}>{c.head.phone}</span>
          </div>
        </div>
      </div>
    </div>

    <div style={{ padding:'24px 28px' }}>
      <p style={{ color:'#475569', fontSize:14, lineHeight:2, marginBottom:20, background:'#F8FAFC', padding:'16px 18px', borderRadius:12, border:`1px solid ${B}10`, textAlign:isRtl?'right':'left', borderRight: isRtl?`3px solid ${B}`:'none', borderLeft: isRtl?'none':`3px solid ${B}` }}>{c.head.bio}</p>
      <div style={{ background:`linear-gradient(135deg,#fef9ee,#fff8e6)`, borderRadius:14, border:`1px solid ${G}35`, padding:'18px 20px' }}>
        <div style={{ fontSize:13, fontWeight:900, color:B, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:28, height:28, borderRadius:8, background:G, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🎓</span>
          {t.expertiseLbl}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {c.head.expertise.map((exp,i) => (
            <span key={i} style={{ background:'#fff', padding:'8px 16px', borderRadius:20, border:`1.5px solid ${G}50`, fontSize:13, fontWeight:700, color:B, boxShadow:`0 2px 6px ${G}20` }}>✓ {exp}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
) : (
                  <>
                    <div style={{ width:80, height:80, borderRadius:20, background:`linear-gradient(135deg,${B}10,${G}15)`, border:`1px solid ${G}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 16px' }}>{c.icon}</div>
                    <div style={{ fontSize:22, fontWeight:900, color:B, marginBottom:5 }}>{c.name}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:R, marginBottom:14, background:`${R}0e`, padding:'5px 16px', borderRadius:30, display:'inline-block' }}>{t.execCommittee}</div>
                    <div style={{ width:48, height:3, background:G, borderRadius:3, margin:'0 auto 16px' }}/>
                    <p style={{ color:'#475569', fontSize:14, lineHeight:1.9, marginBottom:20, background:'#F8FAFC', padding:'16px 18px', borderRadius:12, border:'1px solid #e8edf2', textAlign:isRtl?'right':'left' }}>{c.desc}</p>
                    <div style={{ background:'#fef9ee', borderRadius:12, border:`1px solid ${G}35`, padding:'16px 18px' }}>
                      <div style={{ fontSize:13, fontWeight:900, color:B, marginBottom:12 }}>👥 {t.membersLbl}</div>
                      {c.members.map((m,i) => (
                        <div key={i} style={{ background:'#fff', padding:'12px 16px', borderRadius:10, [isRtl?'borderRight':'borderLeft']:`3px solid ${G}`, display:'flex', alignItems:'center', gap:12, fontSize:14, fontWeight:700, color:B, border:'1px solid #e8edf2', marginBottom:i<c.members.length-1?9:0 }}>
                          <span style={{ width:26, height:26, borderRadius:13, background:`${G}20`, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>✓</span>{m}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ); })()}

            {modal.type==='news' && (
              <div style={{ padding:'40px 30px', textAlign:'center', direction:t.dir }}>
                <div style={{ fontSize:48, marginBottom:16, display:'inline-flex', alignItems:'center', justifyContent:'center', width:88, height:88, background:`${R}0e`, borderRadius:20, border:`1px solid ${R}20` }}>{modal.data.icon}</div>
                <div style={{ fontSize:21, fontWeight:900, color:B, marginBottom:6 }}>{modal.data.title}</div>
                <div style={{ fontSize:12, color:'#94a3b8', fontWeight:600, marginBottom:14 }}>{modal.data.date}</div>
                <div style={{ width:48, height:3, background:R, borderRadius:3, margin:'0 auto 16px' }}/>
                <div style={{ background:'#F8FAFC', borderRadius:12, padding:'18px 20px', fontSize:15, color:'#475569', lineHeight:2, border:'1px solid #e8edf2', textAlign:isRtl?'right':'left' }}>{modal.data.content}</div>
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
    <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${G}35`, overflow:'hidden', boxShadow:'0 4px 18px rgba(27,54,93,0.07)', transition:'box-shadow .3s' }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{
          width:'100%', display:'flex', alignItems:'center', gap:14, padding:'15px 16px',
          background: open ? `linear-gradient(135deg,${B}06,${G}10)` : '#fff',
          border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif",
          transition:'background .25s', borderBottom: open ? `1px solid ${G}22` : 'none'
        }}
        onMouseEnter={e=>{ if(!open) e.currentTarget.style.background=`${G}08`; }}
        onMouseLeave={e=>{ if(!open) e.currentTarget.style.background='#fff'; }}>
        <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden', border:`3px solid ${open?G:'#e2e8f0'}`, flexShrink:0, transition:'border-color .3s', boxShadow: open?`0 0 12px ${G}35`:'none' }}>
          <img src={president.image} alt={president.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            onError={e=>{e.currentTarget.src=`https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=200&name=${encodeURIComponent(president.name)}`;}}/>
        </div>
        <div style={{ flex:1, textAlign:isRtl?'right':'left' }}>
          <div style={{ fontSize:14, fontWeight:900, color:B, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:14 }}>💬</span>
            {t.presidentQuoteLabel}
          </div>
          <div style={{ fontSize:11.5, color:'#94a3b8', marginTop:3 }}>{president.name}</div>
        </div>
        <div style={{
          width:30, height:30, borderRadius:'50%',
          background: open ? G : `${G}15`,
          border:`1px solid ${G}40`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, color: open ? B : '#9A7A10',
          transition:'all .35s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          flexShrink:0, fontWeight:900
        }}>▼</div>
      </button>

      {open && (
        <div style={{ animation:'quote-slide .4s cubic-bezier(0.34,1.1,0.64,1)', overflow:'hidden' }}>
          <div style={{ padding:'18px 18px 20px' }}>
            <div style={{ position:'relative', fontSize:14, color:'#374151', lineHeight:2.1, background:`linear-gradient(135deg,#F8FAFC,#fef9ee)`, borderRadius:12, border:`1px solid ${G}22`, [isRtl?'borderRight':'borderLeft']:`3px solid ${G}`, padding:'16px 20px' }}>
              <span style={{ fontSize:52, color:`${G}28`, fontFamily:'serif', lineHeight:0, position:'absolute', top:26, [isRtl?'right':'left']:10, pointerEvents:'none' }}>"</span>
              <div style={{ [isRtl?'paddingRight':'paddingLeft']:28 }}>
                {t.presidentQuote.split('\n\n').map((para,i,arr) => (
                  <span key={i} style={{ display:'block', marginBottom: i<arr.length-1 ? 14 : 0 }}>{para}</span>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, paddingTop:12, borderTop:`1px solid ${B}08`, flexWrap:'wrap', gap:8 }}>
              <div>
                <div style={{ fontSize:12.5, fontWeight:800, color:B }}>{president.name}</div>
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{t.presidentFooter}</div>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:'#7a5c1a', background:`${G}12`, border:`1px solid ${G}25`, padding:'4px 12px', borderRadius:20, direction:'ltr' }}>
                📧 {president.email}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}