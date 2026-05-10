"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';

export default function Participation() {
  const [lang, setLang] = useState('ar');
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
      criteriaTitle: 'معايير التقييم',
      criteria: [
        'أن يقدم البحث حلاً أو دراسة واقعية لتحديات العمل الطبي في وقت الأزمات.',
        'أن يعتمد أسلوباً علمياً رصيناً وفق المعايير العالمية المعتمدة.',
        'أن تكون ورقة العمل أو العرض بصيغة PDF فقط.',
      ],
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
      criteriaTitle: 'Evaluation Criteria',
      criteria: [
        'The research must provide a solution or a realistic study of medical work challenges during crises.',
        'It must adopt a rigorous scientific method according to approved international standards.',
        'The abstract or presentation must be in PDF format only.',
      ],
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
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      setStatus(t.errorFile);
      setStatusType('error');
      return;
    }
    setLoading(true);
    setStatus('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('authorName', formData.authorName);
    data.append('email', formData.email);
    data.append('file', formData.file);

    try {
      const res = await fetch('/api/abstracts', { method: 'POST', body: data });
      const resData = await res.json();
      if (res.ok) {
        setStatus(t.successMsg);
        setStatusType('success');
        setFormData({ title: '', authorName: '', email: '', file: null });
        if (fileRef.current) fileRef.current.value = '';
      } else {
        setStatus(`${resData.error || t.errorMsg}`);
        setStatusType('error');
      }
    } catch {
      setStatus(t.errorMsg);
      setStatusType('error');
    }
    setLoading(false);
  };

  return (
    <div style={{
      direction: t.dir,
      fontFamily: isRTL ? "'Noto Sans Arabic', 'Inter', sans-serif" : "'Inter', 'Segoe UI', sans-serif",
      background: '#F4F7F9',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');

        .ecg-line{stroke-dasharray:1200;stroke-dashoffset:1200;animation:ecg 3.5s linear infinite}
        @keyframes ecg{to{stroke-dashoffset:0}}

        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

        .card-hover:hover{border-color:#D4AF37!important;transform:translateY(-4px);box-shadow:0 12px 28px rgba(27,54,93,0.12)!important}
        .btn-pri:hover{background:#a80d24!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,16,46,0.3)}
        .btn-sec:hover{background:rgba(27,54,93,0.04)!important;transform:translateY(-2px)}

        .file-zone:hover, .file-zone.dragging{border-color:#D4AF37!important;background:rgba(212,175,55,0.05)!important}

        .status-success{background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.25);color:#00a86b;border-radius:12px;padding:14px 18px;text-align:center;font-size:14px;animation:slideUp 0.4s ease}
        .status-error{background:rgba(200,16,46,0.08);border:1px solid rgba(200,16,46,0.25);color:#C8102E;border-radius:12px;padding:14px 18px;text-align:center;font-size:14px;animation:slideUp 0.4s ease}

        .spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;margin-inline-end:8px}
        @keyframes spin{to{transform:rotate(360deg)}}

        input:focus, textarea:focus{border-color:#D4AF37!important;box-shadow:0 0 0 3px rgba(212,175,55,0.15)!important;outline:none}
      `}</style>

      <div style={{
        backgroundColor: '#F4F7F9',
        minHeight: 'calc(100vh - 70px)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px',
      }}>

        {/* ECG Line */}
        <div style={{
          width: '100%',
          maxWidth: '900px',
          height: '60px',
          marginTop: '30px',
          position: 'relative',
          zIndex: 10,
        }}>
          <svg width="100%" height="60" viewBox="0 0 900 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={R} stopOpacity="0" />
                <stop offset="10%" stopColor={R} stopOpacity="1" />
                <stop offset="90%" stopColor={R} stopOpacity="1" />
                <stop offset="100%" stopColor={R} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="ecg-line"
              d="M0 30 L100 30 L120 10 L140 50 L160 30 L250 30 L270 5 L300 55 L330 30 L450 30 L470 10 L490 50 L510 30 L600 30 L620 5 L650 55 L680 30 L900 30"
              fill="none"
              stroke="url(#ecgGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Content Container */}
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '20px 0 40px',
        }}>

          {/* ═══ HERO PANEL ═══ */}
          <div className="card-hover" style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(200,200,200,0.3)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(27,54,93,0.06)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative top line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, transparent, ${G}, ${R}, transparent)`,
            }} />

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(200,16,46,0.08)',
              border: '1px solid rgba(200,16,46,0.2)',
              borderRadius: '50px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: '700',
              color: R,
              marginBottom: '16px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: R,
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              {t.badge}
            </div>

            <h1 style={{
              fontSize: isRTL ? '2.2rem' : '1.9rem',
              fontWeight: '900',
              color: B,
              margin: '0 0 12px 0',
              lineHeight: 1.2,
            }}>
              {t.headerTitle}
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#64748b',
              lineHeight: '1.7',
              maxWidth: '600px',
              margin: 0,
              fontWeight: '500',
            }}>
              {t.headerDesc}
            </p>
          </div>

          {/* ═══ CRITERIA PANEL ═══ */}
          <div className="card-hover" style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(200,200,200,0.3)',
            borderRadius: '20px',
            padding: '36px 40px',
            boxShadow: '0 8px 32px rgba(27,54,93,0.06)',
            transition: 'all 0.3s ease',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${B}, #0f2140)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: G,
                fontSize: '18px',
              }}>
                📋
              </div>
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                color: B,
                margin: 0,
              }}>
                {t.criteriaTitle}
              </h2>
              <div style={{
                flex: 1,
                height: '1px',
                background: `linear-gradient(90deg, ${G}, transparent)`,
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {t.criteria.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px 18px',
                  background: 'rgba(27,54,93,0.03)',
                  border: '1px solid rgba(27,54,93,0.08)',
                  borderRadius: '14px',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(27,54,93,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(27,54,93,0.15)';
                  e.currentTarget.style.transform = isRTL ? 'translateX(-4px)' : 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(27,54,93,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(27,54,93,0.08)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                >
                  <div style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${B}, #0f2140)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '700',
                    flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: B,
                    lineHeight: '1.6',
                    paddingTop: '4px',
                    fontWeight: '500',
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ FORM PANEL ═══ */}
          <div className="card-hover" style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(200,200,200,0.3)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(27,54,93,0.06)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Bottom decorative line */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, transparent, ${G}, ${R}, transparent)`,
              opacity: 0.5,
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${R}, #a80d24)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
              }}>
                📝
              </div>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: '800',
                color: B,
                margin: 0,
              }}>
                {t.formTitle}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Research Title */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  marginBottom: '8px',
                }}>
                  {t.labelTitle}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.placeholders.title}
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  style={{
                    width: '100%',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    color: B,
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'all 0.25s ease',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Author Name */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  marginBottom: '8px',
                }}>
                  {t.labelName}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.placeholders.name}
                  value={formData.authorName}
                  onChange={e => setFormData(p => ({ ...p, authorName: e.target.value }))}
                  style={{
                    width: '100%',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    color: B,
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'all 0.25s ease',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  marginBottom: '8px',
                }}>
                  {t.labelEmail}
                </label>
                <input
                  type="email"
                  required
                  placeholder={t.placeholders.email}
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  style={{
                    width: '100%',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    color: B,
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'all 0.25s ease',
                    outline: 'none',
                  }}
                />
              </div>

              {/* File Upload */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  marginBottom: '8px',
                }}>
                  {t.labelFile}
                </label>
                <div
                  className={`file-zone${dragging ? ' dragging' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  style={{
                    width: '100%',
                    background: '#fff',
                    border: `2px dashed ${dragging ? G : '#e2e8f0'}`,
                    borderRadius: '14px',
                    padding: '32px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    onChange={e => handleFileChange(e.target.files[0])}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <div style={{ fontSize: '32px', marginBottom: '10px', display: 'block' }}>
                    {formData.file ? '📄' : '☁️'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {formData.file ? (
                      <div style={{ color: '#00a86b', fontWeight: '700', wordBreak: 'break-all' }}>
                        ✓ {formData.file.name}
                      </div>
                    ) : (
                      <>
                        {t.fileDrop}
                        <br />
                        <small style={{ color: '#94a3b8', fontSize: '12px' }}>{t.fileHint}</small>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-pri"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: `linear-gradient(135deg, ${R} 0%, #a80d24 100%)`,
                  border: 'none',
                  borderRadius: '14px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading && <span className="spinner" />}
                {loading ? t.sending : t.submitBtn}
              </button>

              {/* Status Message */}
              {status && (
                <div className={statusType === 'success' ? 'status-success' : 'status-error'} style={{ marginTop: '18px' }}>
                  {status}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          padding: '28px 40px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '13px',
          background: '#F8FAFC',
          width: '100%',
          marginTop: 'auto',
        }}>
          {t.footer}
        </footer>
      </div>
    </div>
  );
}