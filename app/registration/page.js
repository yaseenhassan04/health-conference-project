"use client";
import { useState } from 'react';

export default function Registration() {
  const [formData, setFormData] = useState({ fullName: '', email: '', profession: '', country: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('جاري التسجيل...');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('تم التسجيل بنجاح! شكراً لك.');
        setFormData({ fullName: '', email: '', profession: '', country: '' });
      } else {
        setStatus(`خطأ: ${data.error}`);
      }
    } catch (err) {
      setStatus('حدث خطأ في الاتصال بالسيرفر.');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="glass-panel text-center mb-4">
        <h1 className="mb-2" style={{ color: 'var(--primary)' }}>التسجيل في المؤتمر</h1>
        <p style={{ color: 'var(--text-muted)' }}>سجل الآن لتصلك التحديثات، ولتتمكن من الحصول على الشهادة وبطاقة الحضور لاحقاً.</p>
      </div>

      <form className="glass-panel" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">الاسم الكامل</label>
          <input type="text" className="form-input" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">البريد الإلكتروني</label>
          <input type="email" className="form-input" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">المهنة/التخصص</label>
          <input type="text" className="form-input" required value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">الدولة</label>
          <input type="text" className="form-input" required value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'الرجاء الانتظار...' : 'تأكيد التسجيل'}
        </button>
        {status && <p className="text-center mt-4" style={{ color: status.includes('نجاح') ? 'var(--success)' : 'var(--danger)' }}>{status}</p>}
      </form>
    </div>
  );
}
