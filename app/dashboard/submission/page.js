"use client";

import { useEffect, useState } from 'react';
import { Download, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';

export default function SubmissionReviewPage() {
  const [lang, setLang] = useState('ar');
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

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

  const updateStatus = async (id, newStatus) => {
    try {
      setSelectedId(id);
      const res = await fetch('/api/abstracts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
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

  const filteredAbstracts = filter === 'all' ? abstracts : abstracts.filter(a => a.status === filter);
  const stats = {
    total: abstracts.length,
    pending: abstracts.filter(a => a.status === 'pending').length,
    accepted: abstracts.filter(a => a.status === 'accepted').length,
    rejected: abstracts.filter(a => a.status === 'rejected').length,
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#FEF3C7', text: '#92400E', icon: Clock },
      accepted: { bg: '#D1FAE5', text: '#065F46', icon: CheckCircle },
      rejected: { bg: '#FEE2E2', text: '#7F1D1D', icon: XCircle },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return {
      style: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', backgroundColor: badge.bg, color: badge.text, fontWeight: 'bold', fontSize: '12px' },
      text: t[`status${status.charAt(0).toUpperCase() + status.slice(1)}`],
      icon: Icon
    };
  };

  return (
    <div style={{ direction: t.dir, backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', 'IBM Plex Sans Arabic', sans-serif" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f8fafc; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        table tr:hover { background: #f1f5f9; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        button:not(:disabled):hover { transform: translateY(-2px); }
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
                      <td style={{ padding: '16px', color: '#94a3b8' }}>{new Date(abstract.submittedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}><div style={badge.style}><Icon size={14} /> {badge.text}</div></td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {abstract.filepath && <a href={abstract.filepath} download style={{ padding: '8px', background: '#eff6ff', borderRadius: '6px', color: colors.primary }} title={t.download}><Download size={14} /></a>}
                          <button onClick={() => updateStatus(abstract.id, 'accepted')} disabled={selectedId === abstract.id || abstract.status === 'accepted'} style={{ padding: '8px', background: '#dcfce7', borderRadius: '6px', color: colors.success, border: 'none', cursor: 'pointer' }}><CheckCircle size={14} /></button>
                          <button onClick={() => updateStatus(abstract.id, 'rejected')} disabled={selectedId === abstract.id || abstract.status === 'rejected'} style={{ padding: '8px', background: '#fee2e2', borderRadius: '6px', color: colors.danger, border: 'none', cursor: 'pointer' }}><XCircle size={14} /></button>
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

      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', borderTop: '1px solid #e2e8f0' }}>© 2026 المؤتمر العلمي الثاني عشر لأمراض الباطنة</div>
    </div>
  );
}