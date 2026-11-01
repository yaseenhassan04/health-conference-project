"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Send, Heart, Globe, Handshake, Award, Microscope,
  HeartPulse, User, Phone, Mail, Stethoscope,
} from 'lucide-react';

const ATTENDEE_STORAGE_KEY = 'live_attendee_info';

/* ── Brand identity tokens (from the visual identity board) ────────── */
const C = {
  ink: '#0D1B2A',     // deepest navy — footers / gate background
  slate: '#2C3E50',   // secondary navy — body text
  gold: '#D4AF37',    // primary accent — CTAs, crest
  goldSoft: '#F4D78B',// light gold — highlights / borders
  mist: '#F7F9FC',    // page background
  line: '#E6EBF1',    // hairlines / borders
};

/* Reusable gold hexagon crest with a centered icon ──────────────── */
function HexCrest({ size = 92, icon: Icon = HeartPulse }) {
  return (
    <div className="hex-crest" style={{ width: size, height: size * 1.12 }}>
      <svg viewBox="0 0 100 112" className="hex-svg" aria-hidden="true">
        <polygon points="50,2 98,29 98,83 50,110 2,83 2,29"
          fill="#fff" stroke={C.gold} strokeWidth="2.5" />
        <polygon points="50,12 88,34 88,78 50,100 12,78 12,34"
          fill="none" stroke={C.goldSoft} strokeWidth="1.2" />
      </svg>
      <Icon size={size * 0.4} strokeWidth={1.6} color={C.ink} className="hex-icon" />
    </div>
  );
}

/* Dashed gold divider with a center diamond (brand card motif) ───── */
function CrestDivider() {
  return (
    <div className="crest-divider" aria-hidden="true">
      <span className="cd-line" />
      <span className="cd-diamond" />
      <span className="cd-line" />
    </div>
  );
}

export default function LivePage() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ viewers: 0, questions: 0, likes: 0 });
  const [lang, setLang] = useState('ar');
  const bottomRef = useRef(null);

  const [liveSettings, setLiveSettings] = useState({ meetLink: '', isLive: false });
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [booted, setBooted] = useState(false);   // منع وميض البوابة للزائر المسجّل
  const [verified, setVerified] = useState(false);
  const [gateForm, setGateForm] = useState({ fullName: '', phone: '', email: '', specialty: '' });
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const [gateError, setGateError] = useState('');

  const content = {
    ar: {
      dir: 'rtl',
      confName: 'المؤتمر العلمي الثاني عشر لأمراض الباطنة',
      confNameEn: 'The 12th Conference of Internal Medicine',
      title: 'البث المباشر — تفاعل مباشر',
      qaTitle: 'الأسئلة والتفاعل',
      nameLabel: 'اسمك (اختياري)',
      questionLabel: 'اكتب سؤالك هنا…',
      sendBtn: 'إرسال',
      noQuestions: 'لا توجد أسئلة بعد\nكن أول من يطرح سؤالاً!',
      loadingQ: 'جاري التحميل…',
      viewers: 'مشاهد',
      questions: 'سؤال',
      likes: 'إعجاب',
      footer: '© 2026 المؤتمر العلمي الثاني عشر لأمراض الباطنة',
      liveNow: 'مباشر الآن',
      coming: 'سيبدأ البث المباشر قريباً',
      booting: 'جاري التحضير…',
      // Gate
      gateEyebrow: 'تسجيل الحضور',
      gateTitle: 'سجّل بياناتك للانضمام',
      gateDesc: 'أدخل بياناتك للوصول إلى صفحة المؤتمر والبث المباشر والتفاعل.',
      gateName: 'الاسم الكامل',
      gatePhone: 'رقم الجوال',
      gateEmail: 'البريد الإلكتروني',
      gateSpecialty: 'التخصص',
      gateBtn: 'متابعة إلى المؤتمر',
      gateBtnLoading: 'جاري التسجيل…',
      gateErrorFields: 'الرجاء تعبئة جميع الحقول',
      gateErrorServer: 'حدث خطأ، حاول مرة أخرى',
      // Join
      joinTitle: 'البث متاح الآن',
      joinDesc: 'اضغط للانضمام إلى البث المباشر عبر Google Meet',
      joinBtn: 'مشاهدة البث الآن',
      // Values
      values: [
        { icon: Globe, label: 'خبرة عالمية' },
        { icon: Handshake, label: 'شراكة طبية' },
        { icon: Award, label: 'معايير عالية' },
        { icon: Microscope, label: 'خبرة علمية' },
      ]
      
    },
    en: {
      dir: 'ltr',
      confName: 'The 12th Conference of Internal Medicine',
      confNameEn: 'المؤتمر العلمي الثاني عشر لأمراض الباطنة',
      title: 'Live Stream — Interactive Q&A',
      qaTitle: 'Questions & Interaction',
      nameLabel: 'Your Name (Optional)',
      questionLabel: 'Ask your question here…',
      sendBtn: 'Send',
      noQuestions: 'No questions yet\nBe the first to ask!',
      loadingQ: 'Loading…',
      viewers: 'Viewers',
      questions: 'Questions',
      likes: 'Likes',
      footer: '© 2026 The 12th Conference of Internal Medicine',
      liveNow: 'Live Now',
      coming: 'Live stream coming soon',
      booting: 'Preparing…',
      gateEyebrow: 'Attendee Registration',
      gateTitle: 'Register to join',
      gateDesc: 'Enter your details to access the conference page, live stream, and Q&A.',
      gateName: 'Full Name',
      gatePhone: 'Phone Number',
      gateEmail: 'Email',
      gateSpecialty: 'Specialty',
      gateBtn: 'Continue to the conference',
      gateBtnLoading: 'Registering…',
      gateErrorFields: 'Please fill in all fields',
      gateErrorServer: 'Something went wrong, please try again',
      joinTitle: 'Stream is live now',
      joinDesc: 'Click to join the live stream via Google Meet',
      joinBtn: 'Watch Live Now',
      values: [
        { icon: Globe, label: 'Global Expertise' },
        { icon: Handshake, label: 'Medical Partnership' },
        { icon: Award, label: 'High Standards' },
        { icon: Microscope, label: 'Scientific Excellence' },
      ],
      nav: { home: 'Home', program: 'Program', participation: 'Submit Research', dashboard: 'Dashboard' },
      hdReady: 'HD Ready',
    },
  };

  const t = content[lang];

  /* ── جلب الأسئلة ─────────────────────────────────────────────── */
  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
        setStats({
          viewers: Math.floor(Math.random() * 500) + 100,
          questions: data.questions.length,
          likes: data.questions.reduce((sum, q) => sum + (q.likes || 0), 0),
        });
      }
    } catch (error) {
      console.error('خطأ في جلب الأسئلة:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questions]);

  /* ── جلب إعدادات البث (رابط Google Meet وحالة التفعيل) ───────── */
  const fetchLiveSettings = async () => {
    try {
      const res = await fetch('/api/live/settings');
      const data = await res.json();
      if (data.settings) setLiveSettings(data.settings);
    } catch (error) {
      console.error('خطأ في جلب إعدادات البث:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveSettings();
    const interval = setInterval(fetchLiveSettings, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ── استرجاع بيانات المشاهد المحفوظة (بدون وميض البوابة) ──────── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ATTENDEE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setGateForm((prev) => ({ ...prev, ...parsed }));
        setVerified(true);
      }
    } catch {
      /* تجاهل بيانات محفوظة تالفة */
    } finally {
      setBooted(true);
    }
  }, []);

  /* ── تسجيل بيانات المشاهد (بوابة الدخول) ─────────────────────── */
  const handleGateSubmit = async (e) => {
    e.preventDefault();
    setGateError('');
    const { fullName, phone, email, specialty } = gateForm;
    if (!fullName.trim() || !phone.trim() || !email.trim() || !specialty.trim()) {
      setGateError(t.gateErrorFields);
      return;
    }
    setGateSubmitting(true);
    try {
      const res = await fetch('/api/live/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gateForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(ATTENDEE_STORAGE_KEY, JSON.stringify(gateForm));
      setVerified(true);
    } catch (error) {
      setGateError(t.gateErrorServer);
    } finally {
      setGateSubmitting(false);
    }
  };

  /* ── إرسال سؤال جديد ─────────────────────────────────────────── */
  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newQuestion, author: authorName || 'مجهول' }),
      });
      const data = await res.json();
      if (data.success) {
        setNewQuestion('');
        await fetchQuestions();
      }
    } catch (error) {
      console.error('خطأ في إرسال السؤال:', error);
    } finally {
      setSending(false);
    }
  };

  /* ── إضافة إعجاب ─────────────────────────────────────────────── */
  const handleLike = async (questionId) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/like`, { method: 'POST' });
      if (res.ok) await fetchQuestions();
    } catch (error) {
      console.error('خطأ في الإعجاب:', error);
    }
  };

  const styles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Montserrat:wght@500;600;700;800&family=Poppins:wght@400;500;600&family=Tajawal:wght@400;500;700&display=swap');

      * { margin: 0; padding: 0; box-sizing: border-box; }

      .lv-root {
        --ink:${C.ink}; --slate:${C.slate}; --gold:${C.gold};
        --gold-soft:${C.goldSoft}; --mist:${C.mist}; --line:${C.line};
        /* ارتفاع بانر الموقع القادم من الـlayout — عدّله ليطابق بانرك بالضبط */
        --banner-offset: 300px;
        background: var(--mist);
        font-family: 'Cairo','Tajawal',sans-serif;
        color: var(--slate);
        min-height: 100vh;
      }
      .lv-root[dir="ltr"] { font-family: 'Montserrat','Poppins',sans-serif; }

      .lv-root ::selection { background: rgba(212,175,55,0.28); }
      .lv-root :focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

      /* ── Hex crest & divider (signature) ── */
      .hex-crest { position: relative; display: inline-grid; place-items: center; }
      .hex-svg { position: absolute; inset: 0; width: 100%; height: 100%;
        filter: drop-shadow(0 8px 18px rgba(13,27,42,0.18)); }
      .hex-icon { position: relative; z-index: 1; }

      .crest-divider { display: flex; align-items: center; justify-content: center;
        gap: 12px; width: 100%; margin: 14px 0; }
      .cd-line { height: 1px; flex: 1; max-width: 90px;
        background: linear-gradient(90deg, transparent, var(--gold)); }
      .crest-divider .cd-line:last-child {
        background: linear-gradient(90deg, var(--gold), transparent); }
      .cd-diamond { width: 8px; height: 8px; background: var(--gold);
        transform: rotate(45deg); box-shadow: 0 0 0 3px rgba(212,175,55,0.18); }

      /* ── Boot splash ── */
      .boot { min-height: calc(100vh - var(--banner-offset)); display: grid; place-items: center;
        background: var(--mist); }
      .boot-inner { display: grid; place-items: center; gap: 14px;
        color: var(--slate); font-weight: 600; }
      .boot .hex-crest { animation: floaty 3s ease-in-out infinite; }
      @keyframes floaty { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-8px);} }

      /* ═══════════ GATE (entry) ═══════════ */
      .gate-overlay { position: relative; width: 100%;
        min-height: calc(100vh - var(--banner-offset));
        display: grid; place-items: center; padding: 40px 24px;
        background:
          radial-gradient(1100px 520px at 50% -10%, rgba(212,175,55,0.14), transparent 60%),
          linear-gradient(160deg, var(--ink) 0%, #0a1420 55%, var(--slate) 130%); }
      .gate-overlay::before { content:''; position:absolute; inset:0; opacity:.5;
        background-image:
          linear-gradient(rgba(212,175,55,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,175,55,0.05) 1px, transparent 1px);
        background-size: 46px 46px; -webkit-mask: radial-gradient(circle at 50% 35%, #000, transparent 75%);
        mask: radial-gradient(circle at 50% 35%, #000, transparent 75%); }

      .gate-topbar { position: absolute; top: 18px; inset-inline-end: 22px; z-index: 2; }

      .gate-card { position: relative; z-index: 1; width: min(100%, 468px);
        background: #fff; border-radius: 22px; padding: 34px 30px 0;
        box-shadow: 0 30px 70px rgba(0,0,0,0.42); border: 1px solid rgba(212,175,55,0.35);
        text-align: center; overflow: hidden; animation: cardIn .5s cubic-bezier(.2,.8,.2,1); }
      @keyframes cardIn { from{ opacity:0; transform: translateY(16px) scale(.98);} to{ opacity:1; transform:none;} }
      .gate-card .corner { position:absolute; width:26px; height:26px; border:2px solid var(--gold); opacity:.55; }
      .gate-card .corner.tl { top:14px; inset-inline-start:14px; border-inline-end:0; border-bottom:0; }
      .gate-card .corner.tr { top:14px; inset-inline-end:14px; border-inline-start:0; border-bottom:0; }

      .gate-eyebrow { font-family:'Montserrat',sans-serif; font-size:11px; font-weight:700;
        letter-spacing:2.5px; text-transform:uppercase; color: var(--gold); margin-top: 12px; }
      .gate-title { font-size: 22px; font-weight: 800; color: var(--ink); margin: 6px 0 4px; }
      .lv-root[dir="ltr"] .gate-title { font-family:'Montserrat',sans-serif; }
      .gate-desc { font-size: 13px; color: #64748b; line-height: 1.6;
        max-width: 340px; margin: 0 auto 8px; }

      .gate-form { display: flex; flex-direction: column; gap: 11px; text-align: start; margin-top: 8px; }
      .gate-field { position: relative; }
      .gate-field .fi-icon { position:absolute; top:50%; inset-inline-start:13px;
        transform: translateY(-50%); color:#94a3b8; pointer-events:none; }
      .gate-input { width:100%; padding: 13px 14px; padding-inline-start: 40px;
        border: 1.5px solid var(--line); border-radius: 12px; font: inherit; font-size: 14px;
        color: var(--slate); background: #fbfcfe; transition: border-color .18s, box-shadow .18s, background .18s; }
      .gate-input::placeholder { color:#9aa7b8; }
      .gate-input:focus { border-color: var(--gold); background:#fff;
        box-shadow: 0 0 0 4px rgba(212,175,55,0.12); outline: none; }

      .gate-error { font-size: 12.5px; color:#b0122c; text-align:center;
        background: rgba(200,16,46,0.06); border:1px solid rgba(200,16,46,0.18);
        padding: 8px; border-radius: 9px; }

      .gate-submit { margin-top: 4px; display:flex; align-items:center; justify-content:center; gap:8px;
        background: linear-gradient(135deg, var(--gold), #c69f2f); color: var(--ink);
        border:none; padding: 14px; border-radius: 12px; font: inherit; font-weight: 800; font-size: 15px;
        cursor:pointer; transition: transform .18s, box-shadow .18s, filter .18s;
        box-shadow: 0 10px 24px rgba(212,175,55,0.3); }
      .gate-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.04);
        box-shadow: 0 14px 30px rgba(212,175,55,0.42); }
      .gate-submit:disabled { opacity: .65; cursor: not-allowed; }

      /* gate footer band (navy, like the brand card) */
      .gate-footer { margin: 24px -30px 0; padding: 16px 24px 18px;
        background: linear-gradient(180deg, var(--ink), #0a1522); }
      .gate-values { display:flex; justify-content:center; gap: 22px; flex-wrap: wrap; }
      .gate-value { display:grid; place-items:center; gap:5px; color:#cbd5e1; }
      .gate-value span { font-size: 10.5px; font-weight:600; letter-spacing:.2px; }
      .gate-conf { margin-top: 12px; font-size: 11px; color: var(--gold);
        font-weight: 700; letter-spacing:.3px; }

      /* ═══════════ NAV ═══════════ */
      .navbar { background: var(--ink); padding: 15px 24px; display:flex; justify-content:center;
        gap: 30px; flex-wrap: wrap; position: sticky; top:0; z-index: 100;
        box-shadow: 0 2px 10px rgba(13,27,42,0.18);
        border-bottom: 2px solid rgba(212,175,55,0.35); }
      .navbar a { color:#e8edf3; text-decoration:none; font-weight:600; font-size:14.5px;
        position: relative; padding-bottom: 3px; transition: color .2s; }
      .navbar a::after { content:''; position:absolute; inset-inline-start:0; bottom:-2px;
        width:0; height:2px; background: var(--gold); transition: width .25s; }
      .navbar a:hover { color: var(--gold); }
      .navbar a:hover::after { width:100%; }

      /* ═══════════ PAGE ═══════════ */
      .page-container { display:flex; flex-direction: column; min-height: 100vh; padding: 26px 24px; }
      .page-wrap { max-width: 1400px; width:100%; margin: 0 auto; }

      .page-header { display:flex; align-items:center; gap:16px; margin-bottom: 22px;
        justify-content: space-between; flex-wrap: wrap; }
      .header-left { display:flex; align-items:center; gap:14px; flex-wrap: wrap; }

      .live-badge { display:flex; align-items:center; gap:8px;
        background: var(--ink); border:1px solid rgba(212,175,55,0.5); border-radius:100px;
        padding: 7px 15px; font-family:'Montserrat',monospace; font-size:12px; color: var(--gold);
        font-weight:800; letter-spacing:1px; }
      .live-dot { width:8px; height:8px; background: var(--gold); border-radius:50%;
        animation: pulse 1.5s infinite; }
      @keyframes pulse { 0%{ box-shadow:0 0 0 0 rgba(212,175,55,0.55);} 70%{ box-shadow:0 0 0 8px rgba(212,175,55,0);} 100%{} }

      .page-title { font-size: clamp(21px,4vw,30px); font-weight: 800; color: var(--ink); }
      .lv-root[dir="ltr"] .page-title { font-family:'Montserrat',sans-serif; }
      .page-title .accent { color: var(--gold); }

      .lang-btn { padding: 9px 16px; background: #fff; border:1.5px solid var(--line);
        border-radius:10px; color: var(--ink); cursor:pointer; font: inherit; font-weight:700;
        transition: all .2s; }
      .lang-btn:hover { border-color: var(--gold); color: var(--gold); transform: translateY(-2px); }

      .stats-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr));
        gap: 12px; margin-bottom: 24px; }
      .stat-card { position: relative; background:#fff; padding: 18px 16px; border-radius:14px;
        text-align:center; border:1px solid var(--line); box-shadow: 0 2px 10px rgba(13,27,42,0.05);
        overflow: hidden; }
      .stat-card::before { content:''; position:absolute; top:0; inset-inline: 0; height:3px;
        background: linear-gradient(90deg, var(--gold), var(--gold-soft)); }
      .stat-icon { color: var(--gold); margin-bottom: 6px; }
      .stat-value { font-size: 26px; font-weight: 900; color: var(--ink); line-height:1;
        font-family:'Montserrat',sans-serif; }
      .stat-label { font-size: 12px; color:#64748b; font-weight: 600; margin-top: 5px; }

      .live-layout { display:grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }
      @media (max-width:1024px){ .live-layout{ grid-template-columns: 1fr; } }

      .video-panel { background:#fff; border-radius:20px; overflow:hidden;
        box-shadow: 0 10px 26px rgba(13,27,42,0.08); border:1px solid var(--line); }
      .video-screen { width:100%; aspect-ratio:16/9; position:relative; overflow:hidden;
        display:grid; place-items:center;
        background: radial-gradient(700px 360px at 50% 0%, #16273b, #0f172a 60%, #0b1420 100%); }
      .video-screen::before { content:''; position:absolute; inset:0; opacity:.5;
        background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        animation: drift 22s linear infinite; }
      @keyframes drift { 0%{ transform:translate(0,0);} 100%{ transform:translate(60px,60px);} }

      .video-placeholder { text-align:center; color:#94a3b8; position:relative; z-index:1;
        display:grid; place-items:center; gap:14px; }
      .video-placeholder p { font-size:16px; font-weight:600; }
      .video-placeholder .hex-crest { animation: floaty 3s ease-in-out infinite; }

      .join-panel { position:relative; z-index:1; text-align:center; color:#fff;
        display:grid; place-items:center; gap:6px; padding: 12px; }
      .join-title { font-size:20px; font-weight:800; }
      .join-desc { font-size:13px; color:#cbd5e1; margin-bottom: 12px; max-width: 320px; }
      .join-btn { display:inline-flex; align-items:center; gap:8px;
        background: linear-gradient(135deg, var(--gold), #c69f2f); color: var(--ink);
        text-decoration:none; padding: 13px 26px; border-radius:12px; font-weight:800; font-size:15px;
        box-shadow: 0 10px 24px rgba(212,175,55,0.3); transition: transform .2s, box-shadow .2s; }
      .join-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(212,175,55,0.42); }

      .video-footer { padding: 12px 18px; display:flex; justify-content:space-between;
        align-items:center; background: var(--ink); color:#cbd5e1; font-size:12px; font-weight:600; }
      .video-footer .hd { display:flex; align-items:center; gap:6px; color: var(--gold);
        font-family:'Montserrat',monospace; letter-spacing:1px; }

      /* ── Q&A ── */
      .qa-panel { background:#fff; border-radius:20px; box-shadow: 0 10px 26px rgba(13,27,42,0.08);
        border:1px solid var(--line); display:flex; flex-direction:column; height: 512px; overflow:hidden; }
      .qa-header { padding: 15px 18px; border-bottom:1px solid var(--line);
        background: var(--ink); display:flex; align-items:center; gap:9px; }
      .qa-title { font-weight:800; color:#fff; font-size:14px; }
      .qa-header .qa-ic { color: var(--gold); }

      .messages-wrap { flex:1; overflow-y:auto; padding: 14px; display:flex; flex-direction:column; gap:10px; }
      .msg-bubble { background: var(--mist); border-radius:12px; padding: 12px;
        border-inline-start: 3px solid var(--gold); transition: all .2s; animation: slideIn .3s ease-out; }
      @keyframes slideIn { from{ opacity:0; transform: translateY(10px);} to{ opacity:1; transform:none;} }
      .msg-bubble:hover { box-shadow: 0 6px 16px rgba(13,27,42,0.08); transform: translateY(-2px); }
      .msg-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
      .msg-author { font-size:11.5px; font-weight:800; color: var(--ink); }
      .msg-time { font-size:9.5px; color:#94a3b8; }
      .msg-text { font-size:13px; color: var(--slate); margin-bottom:8px; line-height:1.5; }
      .msg-actions { display:flex; gap:8px; justify-content: flex-end; }
      .like-btn { display:flex; align-items:center; gap:5px; background:none;
        border:1px solid var(--line); padding: 4px 9px; border-radius:8px; cursor:pointer;
        font: inherit; font-size:11.5px; color:#64748b; transition: all .2s; }
      .like-btn:hover { border-color: var(--gold); color: var(--gold); background: rgba(212,175,55,0.06); }

      .msg-empty { text-align:center; padding: 44px 12px; color:#94a3b8; white-space: pre-line; font-size:13px; }
      .msg-empty .hex-crest { margin: 0 auto 8px; opacity:.9; }

      .qa-input-area { padding: 12px; border-top:1px solid var(--line); background:#fff;
        display:flex; flex-direction:column; gap:8px; }
      .field-input { padding: 11px 13px; border:1.5px solid var(--line); border-radius:11px;
        font: inherit; font-size:13px; color: var(--slate); background:#fbfcfe; transition: border-color .18s, box-shadow .18s; }
      .field-input:focus { border-color: var(--gold); background:#fff;
        box-shadow: 0 0 0 3px rgba(212,175,55,0.12); outline:none; }
      .send-row { display:flex; gap:8px; }
      .send-btn { display:flex; align-items:center; gap:6px;
        background: linear-gradient(135deg, var(--gold), #c69f2f); color: var(--ink);
        border:none; padding: 0 16px; border-radius:11px; font: inherit; font-weight:800; font-size:13px;
        cursor:pointer; transition: transform .2s, filter .2s; }
      .send-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.04); }
      .send-btn:disabled { opacity:.6; cursor:not-allowed; }

      .footer { text-align:center; padding: 22px; border-top:2px solid rgba(212,175,55,0.35);
        font-size:12px; color:#cbd5e1; background: var(--ink); margin-top: 26px; }

      @media (prefers-reduced-motion: reduce) {
        .lv-root * { animation: none !important; transition: none !important; }
      }
    `}</style>
  );

  /* ── حالة التحضير: منع وميض البوابة ─────────────────────────── */
  if (!booted) {
    return (
      <div className="lv-root" dir={t.dir}>
        {styles}
        <div className="boot">
          <div className="boot-inner">
            <HexCrest size={80} icon={Stethoscope} />
            <div>{t.booting}</div>
          </div>
        </div>
      </div>
    );
  }

  /* ── بوابة التسجيل: أول ما يدخل الشخص ───────────────────────── */
  if (!verified) {
    return (
      <div className="lv-root" dir={t.dir}>
        {styles}
        <div className="gate-overlay">
          <div className="gate-topbar">
            <button className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          <div className="gate-card">
            <span className="corner tl" />
            <span className="corner tr" />

            <HexCrest size={88} icon={HeartPulse} />
            <CrestDivider />

            <div className="gate-eyebrow">{t.gateEyebrow}</div>
            <h1 className="gate-title">{t.gateTitle}</h1>
            <p className="gate-desc">{t.gateDesc}</p>

            <form className="gate-form" onSubmit={handleGateSubmit}>
              <div className="gate-field">
                <User size={17} className="fi-icon" />
                <input className="gate-input" type="text" placeholder={t.gateName}
                  value={gateForm.fullName}
                  onChange={(e) => setGateForm({ ...gateForm, fullName: e.target.value })} required />
              </div>
              <div className="gate-field">
                <Phone size={17} className="fi-icon" />
                <input className="gate-input" type="tel" placeholder={t.gatePhone}
                  value={gateForm.phone}
                  onChange={(e) => setGateForm({ ...gateForm, phone: e.target.value })} required />
              </div>
              <div className="gate-field">
                <Mail size={17} className="fi-icon" />
                <input className="gate-input" type="email" placeholder={t.gateEmail}
                  value={gateForm.email}
                  onChange={(e) => setGateForm({ ...gateForm, email: e.target.value })} required />
              </div>
              <div className="gate-field">
                <Stethoscope size={17} className="fi-icon" />
                <input className="gate-input" type="text" placeholder={t.gateSpecialty}
                  value={gateForm.specialty}
                  onChange={(e) => setGateForm({ ...gateForm, specialty: e.target.value })} required />
              </div>

              {gateError && <div className="gate-error">{gateError}</div>}

              <button className="gate-submit" type="submit" disabled={gateSubmitting}>
                {gateSubmitting ? t.gateBtnLoading : (<>{t.gateBtn}</>)}
              </button>
            </form>

            <div className="gate-footer">
              <div className="gate-values">
                {t.values.map((v, i) => {
                  const Icon = v.icon;
                  return (
                    <div className="gate-value" key={i}>
                      <Icon size={20} strokeWidth={1.5} color={C.gold} />
                      <span>{v.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="gate-conf">{t.confName}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── الصفحة بعد التسجيل ──────────────────────────────────────── */
  return (
    <div className="lv-root" dir={t.dir}>
      {styles}


      <div className="page-container">
        <div className="page-wrap">
          {/* Header */}
          <div className="page-header">
            <div className="header-left">
              {liveSettings.isLive && (
                <div className="live-badge">
                  <span className="live-dot" /> {t.liveNow}
                </div>
              )}
              <h1 className="page-title">
                {lang === 'ar' ? 'البث المباشر' : 'Live Stream'}{' '}
                <span className="accent">{lang === 'ar' ? '— تفاعل مباشر' : '— Interactive Q&A'}</span>
              </h1>
            </div>
            <button className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <Globe size={20} className="stat-icon" />
              <div className="stat-value">{stats.viewers}</div>
              <div className="stat-label">{t.viewers}</div>
            </div>
            <div className="stat-card">
              <Send size={20} className="stat-icon" />
              <div className="stat-value">{stats.questions}</div>
              <div className="stat-label">{t.questions}</div>
            </div>
            <div className="stat-card">
              <Heart size={20} className="stat-icon" />
              <div className="stat-value">{stats.likes}</div>
              <div className="stat-label">{t.likes}</div>
            </div>
          </div>

          {/* Live Layout */}
          <div className="live-layout">
            {/* Video Panel */}
            <div className="video-panel">
              <div className="video-screen">
                {!settingsLoading && liveSettings.isLive ? (
                  <div className="join-panel">
                    <HexCrest size={72} icon={HeartPulse} />
                    <div className="join-title">{t.joinTitle}</div>
                    <div className="join-desc">{t.joinDesc}</div>
                    <a className="join-btn" href={liveSettings.meetLink || '#'}
                      target="_blank" rel="noopener noreferrer">
                      {t.joinBtn}
                    </a>
                  </div>
                ) : (
                  <div className="video-placeholder">
                    <HexCrest size={72} icon={Stethoscope} />
                    <p>{t.coming}</p>
                  </div>
                )}
              </div>
              <div className="video-footer">
                <span>{t.confName}</span>
                <div className="hd">{t.hdReady}</div>
              </div>
            </div>

            {/* Q&A Panel */}
            <div className="qa-panel">
              <div className="qa-header">
                <Heart size={16} className="qa-ic" />
                <div className="qa-title">{t.qaTitle}</div>
              </div>

              <div className="messages-wrap">
                {loading ? (
                  <div className="msg-empty">{t.loadingQ}</div>
                ) : questions.length === 0 ? (
                  <div className="msg-empty">
                    <HexCrest size={56} icon={Send} />
                    {t.noQuestions}
                  </div>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="msg-bubble">
                      <div className="msg-header">
                        <div className="msg-author">{q.author}</div>
                        <div className="msg-time">
                          {new Date(q.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="msg-text">{q.text}</div>
                      <div className="msg-actions">
                        <button className="like-btn" onClick={() => handleLike(q.id)}>
                          <Heart size={13} /> {q.likes || 0}
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <div className="qa-input-area">
                <input className="field-input" type="text" placeholder={t.nameLabel}
                  value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                <form className="send-row" onSubmit={handleSendQuestion}>
                  <input className="field-input" type="text" placeholder={t.questionLabel}
                    value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}
                    required style={{ flex: 1 }} />
                  <button className="send-btn" type="submit" disabled={sending}>
                    {sending ? '…' : (<><Send size={15} /> {t.sendBtn}</>)}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">{t.footer}</footer>
    </div>
  );
}