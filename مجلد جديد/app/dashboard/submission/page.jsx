"use client";

import { useEffect, useState } from 'react';
import { Download, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';

export default function SubmissionReviewPage() {
  const [lang, setLang] = useState('ar');
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  // ── كارد كتابة رسالة القبول/الرفض ──
  const [modal, setModal] = useState(null); // { abstract, status } أو null
  const [note, setNote] = useState('');

  const colors = {
    primary: '#1B365D',
    accent: '#D4AF37',
    danger: '#C8102E',
    success: '#10B981',
    warning: '#F59E0B',
  };

  const content = {
    ar: {
      dir: 'rtl',
      title: 'لوحة تحكم الأبحاث المقدمة',
      subtitle: 'إدارة وتدقيق الأبحاث العلمية',
      total: 'إجمالي الأبحاث',
      pending: 'قيد التدقيق',
      accepted: 'المقبولة',
      rejected: 'المرفوضة',
      table: ['الباحث', 'عنوان البحث', 'البريد', 'التاريخ', 'الحالة', 'الإجراءات'],
      loading: 'جاري تحميل البيانات...',
      empty: 'لا توجد أبحاث مقدمة حتى الآن',
      accept: 'قبول',
      reject: 'رفض',
      download: 'تحميل',
      statusPending: 'قيد التدقيق',
      statusAccepted: 'مقبول',
      statusRejected: 'مرفوض',
      switchBtn: 'English',
      successUpdate: 'تم تحديث الحالة بنجاح',
      errorUpdate: 'فشل تحديث الحالة',
      // نصوص الكارد
      modalAcceptTitle: 'قبول البحث',
      modalRejectTitle: 'رفض البحث',
      modalDesc: 'اكتب رسالة توضّح سبب القرار — سترسل للباحث ضمن الإيميل. (اختياري، اتركها فارغة لإرسال الرسالة الافتراضية)',
      notePlaceholder: 'مثال: تم قبول بحثك لجودته العلمية العالية وملاءمته لمحاور المؤتمر...',
      cancel: 'إلغاء',
      confirmAccept: 'تأكيد القبول وإرسال',
      confirmReject: 'تأكيد الرفض وإرسال',
      sending: 'جاري الإرسال...',
    },
    en: {
      dir: 'ltr',
      title: 'Research Submissions Dashboard',
      subtitle: 'Manage and Review Scientific Papers',
      total: 'Total Submissions',
      pending: 'Under Review',
      accepted: 'Accepted',
      rejected: 'Rejected',
      table: ['Author', 'Research Title', 'Email', 'Date', 'Status', 'Actions'],
      loading: 'Loading data...',
      empty: 'No submissions yet',
      accept: 'Accept',
      reject: 'Reject',
      download: 'Download',
      statusPending: 'Under Review',
      statusAccepted: 'Accepted',
      statusRejected: 'Rejected',
      switchBtn: 'العربية',
      successUpdate: 'Status updated successfully',
      errorUpdate: 'Failed to update status',
      // modal texts
      modalAcceptTitle: 'Accept Submission',
      modalRejectTitle: 'Reject Submission',
      modalDesc: 'Write a message explaining the decision — it will be sent to the author in the email. (Optional, leave empty to send the default message)',
      notePlaceholder: 'e.g. Your research was accepted for its high scientific quality and relevance to the conference topics...',
      cancel: 'Cancel',
      confirmAccept: 'Confirm & Send',
      confirmReject: 'Confirm & Send',
      sending: 'Sending...',
    },
  };

  const t = content[lang];

  useEffect(() => {
    fetchAbstracts();
  }, []);

  const fetchAbstracts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/abstracts');
      const data = await res.json();
      if (data.success && data.abstracts) {
        setAbstracts(data.abstracts);
      } else {
        setAbstracts([]);
      }
    } catch (err) {
      console.error(err);
      setAbstracts([]);
    } finally {
      setLoading(false);
    }
  };

  // يستقبل الآن رسالة اختيارية (note) وترسل للباك إند مع الحالة
  const updateStatus = async (id, newStatus, message = '') => {
    try {
      setSelectedId(id);
      const res = await fetch('/api/abstracts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, note: message })
      });
      const data = await res.json();
      if (data.success) {
        setAbstracts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        alert(t.successUpdate);
      } else {
        alert(t.errorUpdate);
      }
    } catch (error) {
      console.error(error);
      alert(t.errorUpdate);
    } finally {
      setSelectedId(null);
    }
  };

  // فتح الكارد عند الضغط على قبول/رفض
  const openModal = (abstract, status) => {
    setNote('');
    setModal({ abstract, status });
  };

  const closeModal = () => {
    setModal(null);
    setNote('');
  };

  // تأكيد الإجراء من داخل الكارد
  const confirmAction = async () => {
    if (!modal) return;
    await updateStatus(modal.abstract.id, modal.status, note);
    setModal(null);
    setNote('');
  };

  // تصفية تدعم الأحرف الكبيرة والصغيرة القادمة من الباك إند
  const filteredAbstracts = filter === 'all'
    ? abstracts
    : abstracts.filter(a => a.status?.toLowerCase() === filter.toLowerCase());

  // عدّادات علوية تدعم الحالات الكبيرة والصغيرة معاً
  const stats = {
    total: abstracts.length,
    pending: abstracts.filter(a => a.status === 'pending' || a.status === 'PENDING').length,
    accepted: abstracts.filter(a => a.status === 'accepted' || a.status === 'ACCEPTED').length,
    rejected: abstracts.filter(a => a.status === 'rejected' || a.status === 'REJECTED').length,
  };

  const getStatusBadge = (status) => {
    const currentStatus = status?.toLowerCase() || 'pending';

    const badges = {
      pending: { bg: '#FEF3C7', text: '#92400E', icon: Clock },
      accepted: { bg: '#D1FAE5', text: '#065F46', icon: CheckCircle },
      rejected: { bg: '#FEE2E2', text: '#7F1D1D', icon: XCircle },
    };

    const badge = badges[currentStatus] || badges.pending;
    const Icon = badge.icon;

    const statusKey = `status${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}`;

    return {
      style: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', backgroundColor: badge.bg, color: badge.text, fontWeight: 'bold', fontSize: '12px' },
      text: t[statusKey] || t.statusPending,
      icon: Icon
    };
  };

  return (
    <div style={{ direction: t.dir, backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', 'IBM Plex Sans Arabic', sans-serif" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f8fafc; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        table tr:hover { background: #f1f5f9; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        button:not(:disabled):hover { transform: translateY(-2px); }
        textarea:focus { border-color: ${colors.primary} !important; background: #fff !important; }
      `}</style>

      <div style={{ background: colors.primary, color: 'white', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>{t.subtitle}</p>
        </div>
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
          <Globe size={16} /> {t.switchBtn}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '30px 40px' }}>
        {[
          { label: t.total, value: stats.total, color: colors.primary },
          { label: t.pending, value: stats.pending, color: colors.warning },
          { label: t.accepted, value: stats.accepted, color: colors.success },
          { label: t.rejected, value: stats.rejected, color: colors.danger },
        ].map((stat, i) => (
          <div key={i} className="fade-in" style={{ background: 'white', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${stat.color}` }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 40px 20px', display: 'flex', gap: '10px' }}>
        {['all', 'pending', 'accepted', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: filter === f ? colors.primary : 'white', color: filter === f ? 'white' : colors.primary, cursor: 'pointer', fontWeight: '600' }}>
            {t[f === 'all' ? 'total' : f]}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 40px 40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>{t.loading}</div>
        ) : filteredAbstracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#94a3b8' }}>{t.empty}</div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: t.dir === 'rtl' ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: colors.primary, color: 'white' }}>
                  {t.table.map((header, i) => <th key={i} style={{ padding: '16px' }}>{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredAbstracts.map(abstract => {
                  const badge = getStatusBadge(abstract.status);
                  const Icon = badge.icon;
                  return (
                    <tr key={abstract.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px', fontWeight: '600', color: colors.primary }}>{abstract.authorName}</td>
                      <td style={{ padding: '16px', color: '#334155' }}>{abstract.title}</td>
                      <td style={{ padding: '16px', color: '#64748b' }}>{abstract.email}</td>
                      <td style={{ padding: '16px', color: '#94a3b8' }}>
                        {abstract.createdAt ? new Date(abstract.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') : ''}
                      </td>
                      <td style={{ padding: '16px' }}><div style={badge.style}><Icon size={14} /> {badge.text}</div></td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {abstract.pdfUrl && (
                            <a
                              href={abstract.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '8px',
                                background: '#eff6ff',
                                borderRadius: '6px',
                                color: colors.primary,
                                border: '1px solid #bfdbfe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              title={t.download}
                            >
                              <Download size={14} />
                            </a>
                          )}

                          {/* الأزرار الآن تفتح الكارد بدل التنفيذ المباشر */}
                          <button
                            onClick={() => openModal(abstract, 'accepted')}
                            disabled={selectedId === abstract.id || abstract.status === 'accepted' || abstract.status === 'ACCEPTED'}
                            title={t.accept}
                            style={{ padding: '8px', background: '#dcfce7', borderRadius: '6px', color: colors.success, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <CheckCircle size={14} />
                          </button>

                          <button
                            onClick={() => openModal(abstract, 'rejected')}
                            disabled={selectedId === abstract.id || abstract.status === 'rejected' || abstract.status === 'REJECTED'}
                            title={t.reject}
                            style={{ padding: '8px', background: '#fee2e2', borderRadius: '6px', color: colors.danger, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── كارد كتابة رسالة القبول/الرفض ─── */}
      {modal && (() => {
        const isAccept = modal.status === 'accepted';
        const sending = selectedId === modal.abstract.id;
        return (
          <div
            onClick={closeModal}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(15,23,42,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20, direction: t.dir,
              animation: 'overlayIn 0.2s ease',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
                animation: 'cardIn 0.25s ease',
              }}
            >
              {/* رأس الكارد */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isAccept ? '#dcfce7' : '#fee2e2',
                  color: isAccept ? colors.success : colors.danger,
                }}>
                  {isAccept ? <CheckCircle size={22} /> : <XCircle size={22} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: colors.primary }}>
                    {isAccept ? t.modalAcceptTitle : t.modalRejectTitle}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {modal.abstract.authorName} — {modal.abstract.title}
                  </div>
                </div>
              </div>

              {/* جسم الكارد */}
              <div style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: 13, color: '#475569', marginBottom: 12, lineHeight: 1.7 }}>{t.modalDesc}</p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={t.notePlaceholder}
                  rows={5}
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit',
                    resize: 'vertical', outline: 'none', color: '#334155', lineHeight: 1.7,
                    background: '#f8fafc', direction: t.dir,
                  }}
                />
              </div>

              {/* أزرار الكارد */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={closeModal}
                  disabled={sending}
                  style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: 13, cursor: sending ? 'not-allowed' : 'pointer' }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={confirmAction}
                  disabled={sending}
                  style={{
                    padding: '10px 20px', borderRadius: 10, border: 'none',
                    background: isAccept ? colors.success : colors.danger,
                    color: '#fff', fontWeight: 700, fontSize: 13,
                    cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {sending ? t.sending : (isAccept ? t.confirmAccept : t.confirmReject)}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', borderTop: '1px solid #e2e8f0' }}>© 2026 المؤتمر العلمي الثاني عشر لأمراض الباطنة</div>
    </div>
  );
}