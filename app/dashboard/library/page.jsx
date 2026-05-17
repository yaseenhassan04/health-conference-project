"use client";
/**
 * صفحة داشبورد الدكتور — إدارة المكتبة الرقمية (نسخة مطابقة للسيرفر السحابي)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const B = '#1B365D', R = '#C8102E', G = '#D4AF37';

const EMPTY_FORM = {
  title: '', 
  author: '', 
  category: 'General',
};

/* ─── Toast ─── */
function Toast({ msg, ok }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: ok ? '#10b981' : R, color: '#fff',
      padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 9999,
      fontFamily: "'Cairo',sans-serif", whiteSpace: 'nowrap',
      animation: 'fadeInUp .25s ease',
    }}>
      {ok ? '✅' : '❌'} {msg}
    </div>
  );
}

/* ─── Drop Zone ─── */
function DropZone({ file, onChange }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);
  const accepted = '.pdf';

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      style={{
        border: `2.5px dashed ${drag ? B : file ? '#10b981' : '#cbd5e1'}`,
        borderRadius: 14, padding: '28px 16px', textAlign: 'center',
        cursor: 'pointer',
        background: drag ? `${B}08` : file ? 'rgba(16,185,129,0.05)' : '#F8FAFC',
        transition: 'all .2s',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accepted}
        style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onChange(e.target.files[0])}
      />

      {file ? (
        <>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
            {file.name}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(null); }}
            style={{
              fontSize: 12, color: R, background: 'none',
              border: `1px solid ${R}`, borderRadius: 8,
              padding: '4px 12px', cursor: 'pointer',
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            ✕ إزالة الملف
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.35 }}>📤</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
            اسحب ملف الـ PDF هنا أو{' '}
            <span style={{ color: B, textDecoration: 'underline' }}>اضغط للاختيار</span>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            يدعم ملفات PDF فقط — حتى 20 MB
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Modal إضافة ─── */
function ItemModal({ onClose, onSaved }) {
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [uploadFile, setUploadFile] = useState(null);
  const [saving, setSaving]         = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { alert('العنوان مطلوب'); return; }
    if (!uploadFile) { alert('الرجاء اختيار ملف PDF لرفعه للمكتبة'); return; }
    
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('author', form.author || 'اللجنة العلمية');
      fd.append('file', uploadFile);

      const res = await fetch('/api/library', {
        method: 'POST',
        body: fd,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ أثناء الرفع');
      
      onSaved(data.data, false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14,
    fontFamily: "'Cairo',sans-serif", color: B, outline: 'none',
    background: '#F8FAFC', direction: 'rtl', transition: 'border-color .2s',
  };
  const labelStyle = {
    fontSize: 13, fontWeight: 700, color: B,
    marginBottom: 7, display: 'block',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
        fontFamily: "'Cairo',sans-serif", direction: 'rtl',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
      }}>

        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: B }}>
            ➕ إضافة ملف أو بحث مطور للمكتبة
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>العنوان <span style={{ color: R }}>*</span></label>
            <input
              style={inputStyle}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="عنوان الكتاب أو البحث المطوّر"
            />
          </div>

          <div>
            <label style={labelStyle}>المؤلف / الدكتور</label>
            <input
              style={inputStyle}
              value={form.author}
              onChange={e => set('author', e.target.value)}
              placeholder="اسم الدكتور أو الباحث"
            />
          </div>

          <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '16px', border: '1px solid #e2e8f0' }}>
            <label style={labelStyle}>ملف الـ PDF المرفق</label>
            <DropZone file={uploadFile} onChange={setUploadFile} />
          </div>
        </div>

        <div style={{
          padding: '16px 24px', borderTop: '1px solid #f1f5f9',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
          borderRadius: '0 0 20px 20px',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: 10,
              border: '1px solid #e2e8f0', background: '#fff',
              fontSize: 14, cursor: 'pointer',
              fontFamily: "'Cairo',sans-serif", color: '#64748b',
            }}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '10px 28px', borderRadius: 10,
              background: saving ? '#94a3b8' : B,
              color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Cairo',sans-serif",
              display: 'flex', alignItems: 'center', gap: 8, transition: 'background .2s',
            }}
          >
            {saving ? '⏳ جاري الرفع والحفظ...' : '➕ إضافة للمكتبة'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── الداشبورد الرئيسي ─── */
export default function LibraryDashboard() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchItems = useCallback(() => {
    setLoading(true);
    fetch('/api/library')
      .then(r => r.json())
      .then(d => setItems(d.books || []))
      .catch(() => showToast('فشل تحميل بيانات المكتبة', false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSaved = (item) => {
    setItems(prev => [item, ...prev]);
    setModal(false);
    showToast('تم إضافة الملف للمكتبة الرقمية بنجاح! ✨');
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('تم حذف الملف من المكتبة بنجاح');
    } catch {
      showToast('فشل الحذف من قاعدة البيانات', false);
    } finally {
      setConfirmDel(null);
    }
  };

  const filtered = items.filter(i => {
    return !search || i.title.includes(search) || i.author?.includes(search);
  });

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo',sans-serif", background: '#F4F7F9', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: B, color: '#fff',
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>📚 إدارة المكتبة الرقمية العامة</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>مؤتمر الصمود والاستدامة — الأرشيف العام للملفات والكتب</div>
        </div>
        <button
          type="button"
          onClick={() => setModal(true)}
          style={{
            padding: '10px 20px', background: G, color: B, border: 'none',
            borderRadius: 10, fontWeight: 900, fontSize: 14, cursor: 'pointer',
            fontFamily: "'Cairo',sans-serif",
          }}
        >
          ➕ رفع ملف جديد للكل
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
          gap: 14, marginBottom: 24,
        }}>
          {[
            { label: 'إجمالي المواد المتاحة للجميع', value: items.length, icon: '📚', color: B },
            { label: 'تحديث فوري عبر السحابة', value: 'نشط الآن', icon: '☁️', color: '#10b981' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: '16px 18px',
              border: '1px solid #e8edf2',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 بحث سريع في أرشيف المكتبة..."
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 14,
              fontFamily: "'Cairo',sans-serif", direction: 'rtl', background: '#fff',
            }}
          />
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 16 }}>
            ⏳ جاري جلب مراجع المكتبة من السيرفر السحابي...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 60,
            background: '#fff', borderRadius: 16,
            border: '1px dashed #e2e8f0', color: '#94a3b8',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700 }}>المكتبة فارغة حالياً</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(item => (
              <div key={item.id} style={{
                background: '#fff', border: '1px solid #e8edf2',
                borderRadius: 14, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'all .2s',
              }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>📗</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: B, marginBottom: 3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 12, color: '#64748b',
                    display: 'flex', gap: 12, alignItems: 'center',
                  }}>
                    {item.author && <span>✍️ الدكتور: {item.author}</span>}
                    {item.pdfUrl && (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: R, textDecoration: 'none', fontWeight: 600 }}
                      >
                        📥 استعراض وتحميل الملف المعني ↗
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setConfirmDel(item.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 8,
                      border: `1px solid ${R}`, background: '#fff', color: R,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    🗑️ حذف نهائي
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal إضافة */}
      {modal && (
        <ItemModal
          onClose={() => setModal(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 1001, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28,
            maxWidth: 360, width: '100%', textAlign: 'center',
            fontFamily: "'Cairo',sans-serif", direction: 'rtl',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: B, marginBottom: 8 }}>
              تأكيد حذف الملف السحابي
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              هل أنت متأكد من حذف هذا الملف من قاعدة البيانات والمكتبة العامة للزوار؟
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setConfirmDel(null)}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  border: '1px solid #e2e8f0', background: '#fff',
                  fontSize: 14, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                }}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDel)}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: R, color: '#fff', border: 'none',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                نعم، احذفه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}