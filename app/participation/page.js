"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';

export default function Participation() {
  const { lang, setLang } = useLang();
  const [formData, setFormData] = useState({ title: '', authorName: '', email: '', file: null });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const B = '#1B365D', R = '#C8102E', G = '#D4AF37';

  const t = {
    ar: {
      dir: 'rtl', langTxt: 'English',
      nav: { home: 'الرئيسية', program: 'البرنامج العلمي', submit: 'تقديم الأبحاث', register: 'التسجيل والحضور' },
      badge: 'دعوة لتقديم الأبحاث',
      headerTitle: 'المشاركة والأبحاث',
      headerDesc: 'ندعو الأطباء والباحثين لتقديم أوراقهم العلمية (Abstracts) ليتم تقييمها بواسطة اللجنة العلمية وعرضها خلال المؤتمر.',
      criteriaTitle: 'معايير القبول والتقييم',
      criteriaGroups: [
        {
          groupTitle: 'الشروط الأساسية',
          icon: '✅',
          color: B,
          priority: false,
          items: [
            'أن يقدم البحث حلاً أو دراسة واقعية لتحديات العمل الطبي في وقت الأزمات.',
            'أن يعتمد أسلوباً علمياً رصيناً وفق المعايير العالمية المعتمدة.',
            'أن تكون ورقة العمل أو العرض بصيغة PDF فقط.',
          ]
        },
        {
          groupTitle: 'أبحاث ذات أولوية',
          icon: '⭐',
          color: G,
          priority: true,
          items: [
            'الأبحاث المنشورة في مجلة محكمة.',
            'الأبحاث المتعلقة بالحوكمة السريرية.',
            'الأبحاث التي تتناول الجديد في مجال الطب.',
          ]
        },
        {
          groupTitle: 'الصيغة المطلوبة',
          icon: '📄',
          color: R,
          priority: false,
          items: [
            'يُرفق ملخص البحث (Abstract) بصيغة PDF.',
            'يُرفق نموذج التقديم الرسمي مكتملاً.',
            'يُراعى الالتزام بالصيغة الواردة في نموذج التقديم أدناه.',
          ]
        },
      ],
      templateBtn: 'تحميل نموذج التقديم (Word)',
      formTitle: 'نموذج تقديم البحث',
      labelTitle: 'عنوان البحث',
      labelName: 'اسم الباحث الرئيسي',
      labelEmail: 'البريد الإلكتروني للباحث',
      labelFile: 'ملف البحث',
      fileDrop: 'اسحب ملف PDF هنا أو انقر للاختيار',
      fileHint: 'الصيغة المقبولة: PDF فقط',
      submitBtn: 'إرسال البحث',
      sending: 'جاري الإرسال…',
      errorFile: 'الرجاء اختيار ملف PDF',
      successMsg: '✓ تم استلام البحث بنجاح — سيصلك إشعار بالبريد الإلكتروني قريباً.',
      errorMsg: 'حدث خطأ أثناء الرفع. يرجى المحاولة مرة أخرى.',
      placeholders: {
        title: 'أدخل عنوان البحث…',
        name: 'الاسم الكامل للباحث الرئيسي…',
        email: 'researcher@hospital.org',
      },
      footer: '© 2026 مؤتمر الصمود والاستدامة الطبي',
    },
    en: {
      dir: 'ltr', langTxt: 'العربية',
      nav: { home: 'Home', program: 'Scientific Program', submit: 'Submit Research', register: 'Register & Attend' },
      badge: 'Call for Abstracts',
      headerTitle: 'Participation & Research',
      headerDesc: 'We invite doctors and researchers to submit their scientific papers (Abstracts) to be evaluated by the Scientific Committee and presented during the conference.',
      criteriaTitle: 'Acceptance & Evaluation Criteria',
      criteriaGroups: [
        {
          groupTitle: 'Basic Requirements',
          icon: '✅',
          color: B,
          priority: false,
          items: [
            'The research must address a real challenge in medical work during crises.',
            'It must follow a rigorous scientific methodology per international standards.',
            'The abstract or presentation must be submitted in PDF format only.',
          ]
        },
        {
          groupTitle: 'Priority Research',
          icon: '⭐',
          color: G,
          priority: true,
          items: [
            'Research published in a peer-reviewed journal.',
            'Research related to clinical governance.',
            'Research addressing innovations in medicine.',
          ]
        },
        {
          groupTitle: 'Required Format',
          icon: '📄',
          color: R,
          priority: false,
          items: [
            'Attach the research abstract in PDF format.',
            'Submit the official submission form fully completed.',
            'Follow the format provided in the submission template below.',
          ]
        },
      ],
      templateBtn: 'Download Submission Template (Word)',
      formTitle: 'Abstract Submission Form',
      labelTitle: 'Research Title',
      labelName: 'Lead Author Name',
      labelEmail: 'Author Email',
      labelFile: 'Research File',
      fileDrop: 'Drop your PDF here or click to browse',
      fileHint: 'Accepted format: PDF only',
      submitBtn: 'Submit Research',
      sending: 'Uploading…',
      errorFile: 'Please select a PDF file',
      successMsg: '✓ Research received successfully — You will receive an email confirmation soon.',
      errorMsg: 'An error occurred during upload. Please try again.',
      placeholders: {
        title: 'Enter research title…',
        name: 'Full name of lead author…',
        email: 'researcher@hospital.org',
      },
      footer: '© 2026 Medical Resilience & Sustainability Conference',
    },
  }[lang];

  const isRTL = lang === 'ar';

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setStatus(t.errorFile);
      setStatusType('error');
      return;
    }
    setStatus('');
    setFormData(prev => ({ ...prev, file }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) { setStatus(t.errorFile); setStatusType('error'); return; }
    setLoading(true); setStatus('');
    const data = new FormData();
    data.append('title', formData.title);
    data.append('authorName', formData.authorName);
    data.append('email', formData.email);
    data.append('file', formData.file);
    try {
      const res = await fetch('/api/abstracts', { method: 'POST', body: data });
      const resData = await res.json();
      if (res.ok) {
        setStatus(t.successMsg); setStatusType('success');
        setFormData({ title: '', authorName: '', email: '', file: null });
        if (fileRef.current) fileRef.current.value = '';
      } else {
        setStatus(resData.error || t.errorMsg); setStatusType('error');
      }
    } catch { setStatus(t.errorMsg); setStatusType('error'); }
    setLoading(false);
  };

  const cardAccentBg = (group) => {
    if (group.priority) return `linear-gradient(135deg, ${G}, #b8952a)`;
    if (group.color === R) return `linear-gradient(135deg, ${R}, #a80d24)`;
    return `linear-gradient(135deg, ${B}, #0f2140)`;
  };

  return (
    <div style={{
      direction: t.dir,
      fontFamily: isRTL ? "'Noto Sans Arabic','Inter',sans-serif" : "'Inter','Segoe UI',sans-serif",
      background: '#F4F7F9', minHeight: '100vh', overflowX: 'hidden',
    }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .ecg-line{stroke-dasharray:1200;stroke-dashoffset:1200;animation:ecg 3.5s linear infinite}
        @keyframes ecg{to{stroke-dashoffset:0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .card-hover:hover{border-color:#D4AF37!important;transform:translateY(-4px);box-shadow:0 12px 28px rgba(27,54,93,0.12)!important}
        .criteria-card{transition:all 0.3s ease}
        .criteria-card:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(27,54,93,0.15)!important}
        .btn-pri:hover{background:#a80d24!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,16,46,0.3)}
        .btn-word:hover{background:rgba(27,54,93,0.08)!important;border-color:#1B365D!important;transform:translateY(-2px)}
        .file-zone:hover,.file-zone.dragging{border-color:#D4AF37!important;background:rgba(212,175,55,0.05)!important}
        .status-success{background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.25);color:#00a86b;border-radius:12px;padding:14px 18px;text-align:center;font-size:14px;animation:slideUp 0.4s ease}
        .status-error{background:rgba(200,16,46,0.08);border:1px solid rgba(200,16,46,0.25);color:#C8102E;border-radius:12px;padding:14px 18px;text-align:center;font-size:14px;animation:slideUp 0.4s ease}
        .spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;margin-inline-end:8px}
        @keyframes spin{to{transform:rotate(360deg)}}
        input:focus,textarea:focus{border-color:#D4AF37!important;box-shadow:0 0 0 3px rgba(212,175,55,0.15)!important;outline:none}
        .citem{display:flex;align-items:flex-start;gap:10px;padding:11px 0;border-bottom:1px solid rgba(0,0,0,0.06)}
        .citem:last-child{border-bottom:none;padding-bottom:0}
        @media(max-width:680px){.cgrid{flex-direction:column!important}}
      `}</style>

      <div style={{ backgroundColor: '#F4F7F9', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>

        {/* ECG */}
        <div style={{ width: '100%', maxWidth: '900px', height: '60px', marginTop: '30px' }}>
          <svg width="100%" height="60" viewBox="0 0 900 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={R} stopOpacity="0" />
                <stop offset="10%" stopColor={R} stopOpacity="1" />
                <stop offset="90%" stopColor={R} stopOpacity="1" />
                <stop offset="100%" stopColor={R} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="ecg-line" d="M0 30 L100 30 L120 10 L140 50 L160 30 L250 30 L270 5 L300 55 L330 30 L450 30 L470 10 L490 50 L510 30 L600 30 L620 5 L650 55 L680 30 L900 30" fill="none" stroke="url(#ecgGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px 0 40px' }}>

          {/* HERO */}
          <div className="card-hover" style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', border: '1px solid rgba(200,200,200,0.3)', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 32px rgba(27,54,93,0.06)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg,transparent,${G},${R},transparent)` }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: '50px', padding: '6px 16px', fontSize: '12px', fontWeight: '700', color: R, marginBottom: '16px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: R, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
              {t.badge}
            </div>
            <h1 style={{ fontSize: isRTL ? '2.2rem' : '1.9rem', fontWeight: '900', color: B, margin: '0 0 12px 0', lineHeight: 1.2 }}>{t.headerTitle}</h1>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.7', maxWidth: '600px', margin: 0, fontWeight: '500' }}>{t.headerDesc}</p>
          </div>

          {/* CRITERIA */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', border: '1px solid rgba(200,200,200,0.3)', borderRadius: '20px', padding: '36px 40px', boxShadow: '0 8px 32px rgba(27,54,93,0.06)' }}>
            {/* section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg,${B},#0f2140)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G, fontSize: '18px' }}>📋</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: B, margin: 0 }}>{t.criteriaTitle}</h2>
              <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg,${G},transparent)` }} />
            </div>

            {/* 3 cards */}
            <div className="cgrid" style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
              {t.criteriaGroups.map((group, gi) => (
                <div key={gi} className="criteria-card" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 18px rgba(27,54,93,0.08)', border: `1px solid ${group.priority ? 'rgba(212,175,55,0.3)' : 'rgba(27,54,93,0.09)'}` }}>
                  {/* header */}
                  <div style={{ background: cardAccentBg(group), padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px' }}>{group.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: group.priority ? '#1a1a1a' : '#fff', lineHeight: 1.3 }}>{group.groupTitle}</span>
                  </div>
                  {/* body */}
                  <div style={{ padding: '16px 20px', background: group.priority ? 'rgba(212,175,55,0.03)' : '#fff' }}>
                    {group.items.map((item, ii) => (
                      <div key={ii} className="citem">
                        <div style={{ minWidth: '22px', height: '22px', borderRadius: '6px', background: group.priority ? 'rgba(212,175,55,0.18)' : group.color === R ? 'rgba(200,16,46,0.1)' : 'rgba(27,54,93,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: group.priority ? '#9a7b1a' : group.color === R ? R : B, flexShrink: 0, marginTop: '1px' }}>
                          {ii + 1}
                        </div>
                        <span style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', fontWeight: group.priority ? '600' : '400' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* download btn */}
            <div style={{ marginTop: '28px' }}>
              <a href="/Conferance_abstract_.docx" download="Conferance_abstract_.docx" className="btn-word"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '13px 22px', background: 'rgba(27,54,93,0.04)', border: '1.5px solid rgba(27,54,93,0.2)', borderRadius: '12px', color: B, fontSize: '14px', fontWeight: '700', textDecoration: 'none', transition: 'all 0.3s ease' }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                {t.templateBtn}
              </a>
            </div>
          </div>

          {/* FORM */}
          <div className="card-hover" style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', border: '1px solid rgba(200,200,200,0.3)', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 32px rgba(27,54,93,0.06)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg,transparent,${G},${R},transparent)`, opacity: 0.5 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg,${R},#a80d24)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}>📝</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: B, margin: 0 }}>{t.formTitle}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              {[
                { label: t.labelTitle, key: 'title', type: 'text', ph: t.placeholders.title },
                { label: t.labelName, key: 'authorName', type: 'text', ph: t.placeholders.name },
                { label: t.labelEmail, key: 'email', type: 'email', ph: t.placeholders.email },
              ].map(({ label, key, type, ph }) => (
                <div key={key} style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>{label}</label>
                  <input type={type} required placeholder={ph} value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', color: B, fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.25s ease', outline: 'none' }} />
                </div>
              ))}

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>{t.labelFile}</label>
                <div className={`file-zone${dragging ? ' dragging' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
                  style={{ width: '100%', background: '#fff', border: `2px dashed ${dragging ? G : '#e2e8f0'}`, borderRadius: '14px', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
                  <input ref={fileRef} type="file" accept="application/pdf" onChange={e => handleFileChange(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>{formData.file ? '📄' : '☁️'}</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {formData.file
                      ? <div style={{ color: '#00a86b', fontWeight: '700', wordBreak: 'break-all' }}>✓ {formData.file.name}</div>
                      : <>{t.fileDrop}<br /><small style={{ color: '#94a3b8', fontSize: '12px' }}>{t.fileHint}</small></>}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-pri" style={{ width: '100%', padding: '16px 24px', background: `linear-gradient(135deg,${R} 0%,#a80d24 100%)`, border: 'none', borderRadius: '14px', color: '#fff', fontSize: '15px', fontWeight: '800', letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading && <span className="spinner" />}
                {loading ? t.sending : t.submitBtn}
              </button>

              {status && <div className={statusType === 'success' ? 'status-success' : 'status-error'} style={{ marginTop: '18px' }}>{status}</div>}
            </form>
          </div>
        </div>

        <footer style={{ padding: '28px 40px', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: '13px', background: '#F8FAFC', width: '100%', marginTop: 'auto' }}>
          {t.footer}
        </footer>
      </div>
    </div>
  );
}