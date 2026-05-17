"use client";
/**
 * صفحة داشبورد الدكتور — إدارة المكتبة الرقمية
 * المسار المقترح: app/dashboard/library/page.jsx
 *
 * الجديد: خيار رفع ملف مباشر من الجهاز أو إدخال رابط URL
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const B = '#1B365D', R = '#C8102E', G = '#D4AF37';
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || '';

const TYPE_OPTIONS = [
  { value: 'book',      label: 'كتاب',       icon: '📗' },
  { value: 'reference', label: 'مرجع',       icon: '📖' },
  { value: 'paper',     label: 'ورقة بحثية', icon: '📄' },
  { value: 'guide',     label: 'دليل',       icon: '📋' },
  { value: 'other',     label: 'أخرى',       icon: '📁' },
];

const CATEGORY_SUGGESTIONS = [
  'طب الباطنة', 'طب الطوارئ', 'الأمراض المزمنة', 'القلب والأوعية',
  'الجهاز الهضمي', 'الكلى', 'الرئة', 'السكري', 'أمراض الدم', 'General',
];

const EMPTY_FORM = {
  title: '', author: '', category: '', type: 'book',
  fileUrl: '', description: '', year: new Date().getFullYear(), published: true,
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

/* ─── Toggle رابط / رفع ─── */
function FileSourceToggle({ mode, onChange }) {
  return (
    <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: `2px solid ${B}20`, width: '100%' }}>
      {[
        { val: 'url',    icon: '🔗', label: 'رابط URL' },
        { val: 'upload', icon: '📤', label: 'رفع من الجهاز' },
      ].map(opt => (
        <button
          key={opt.val}
          type="button"
          onClick={() => onChange(opt.val)}
          style={{
            flex: 1, padding: '11px 0', border: 'none', cursor: 'pointer',
            fontFamily: "'Cairo',sans-serif", fontSize: 13, fontWeight: 700,
            background: mode === opt.val ? B : '#F8FAFC',
            color:      mode === opt.val ? '#fff' : '#94a3b8',
            transition: 'all .2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>{opt.icon}</span> {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Drop Zone ─── */
function DropZone({ file, onChange }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);
  const accepted = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip';

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
            اسحب الملف هنا أو{' '}
            <span style={{ color: B, textDecoration: 'underline' }}>اضغط للاختيار</span>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            PDF, Word, PowerPoint, Excel, ZIP — حتى 20 MB
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ percent }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${percent}%`,
          background: `linear-gradient(90deg,${B},${R})`,
          borderRadius: 99, transition: 'width .3s',
        }} />
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'center' }}>
        📤 {percent}% — جاري رفع الملف...
      </div>
    </div>
  );
}

/* ─── Modal إضافة / تعديل ─── */
function ItemModal({ item, onClose, onSaved }) {
  const [form, setForm]             = useState(item ? { ...item } : { ...EMPTY_FORM });
  const [fileMode, setFileMode]     = useState('url');
  const [uploadFile, setUploadFile] = useState(null);
  const [progress, setProgress]     = useState(0);
  const [saving, setSaving]         = useState(false);
  const [catInput, setCatInput]     = useState(false);
  const isEdit = !!item?.id;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* رفع الملف عبر XHR لدعم شريط التقدم */
  const uploadFileToServer = (file) =>
    new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/library/upload');
      xhr.setRequestHeader('x-admin-token', ADMIN_TOKEN);
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText).url);
        } else {
          reject(new Error('فشل رفع الملف'));
        }
      };
      xhr.onerror = () => reject(new Error('خطأ في الشبكة'));
      xhr.send(fd);
    });

  const handleSubmit = async () => {
    if (!form.title.trim()) { alert('العنوان مطلوب'); return; }
    setSaving(true);
    let finalUrl = form.fileUrl;
    try {
      if (fileMode === 'upload' && uploadFile) {
        finalUrl = await uploadFileToServer(uploadFile);
      }
      const res = await fetch('/api/library', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
        body: JSON.stringify({
          ...(isEdit ? { id: item.id } : {}),
          ...form,
          fileUrl: finalUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ');
      onSaved(data.item, isEdit);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
      setProgress(0);
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
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
        maxHeight: '92vh', overflowY: 'auto',
        fontFamily: "'Cairo',sans-serif", direction: 'rtl',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
      }}>

        {/* رأس */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
          borderRadius: '20px 20px 0 0',
        }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: B }}>
            {isEdit ? '✏️ تعديل المرجع' : '➕ إضافة مرجع جديد'}
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

          {/* العنوان */}
          <div>
            <label style={labelStyle}>العنوان <span style={{ color: R }}>*</span></label>
            <input
              style={inputStyle}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="عنوان الكتاب أو المرجع"
            />
          </div>

          {/* المؤلف */}
          <div>
            <label style={labelStyle}>المؤلف / المحرر</label>
            <input
              style={inputStyle}
              value={form.author}
              onChange={e => set('author', e.target.value)}
              placeholder="اسم المؤلف"
            />
          </div>

          {/* النوع */}
          <div>
            <label style={labelStyle}>نوع المرجع</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('type', t.value)}
                  style={{
                    padding: '7px 14px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                    background: form.type === t.value ? B : '#F1F5F9',
                    color:      form.type === t.value ? '#fff' : '#64748b',
                    border:     form.type === t.value ? `2px solid ${B}` : '2px solid transparent',
                    fontFamily: "'Cairo',sans-serif", fontWeight: 600, transition: 'all .15s',
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* التصنيف */}
          <div>
            <label style={labelStyle}>التصنيف</label>
            {!catInput ? (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORY_SUGGESTIONS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('category', c)}
                    style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                      background: form.category === c ? G : '#F1F5F9',
                      color:      form.category === c ? '#fff' : '#64748b',
                      border:     form.category === c ? `2px solid ${G}` : '2px solid transparent',
                      fontFamily: "'Cairo',sans-serif", fontWeight: 600, transition: 'all .15s',
                    }}
                  >
                    {c}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCatInput(true)}
                  style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                    background: '#F1F5F9', color: '#64748b',
                    border: '2px dashed #e2e8f0', fontFamily: "'Cairo',sans-serif",
                  }}
                >
                  + أخرى
                </button>
              </div>
            ) : (
              <input
                style={inputStyle}
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="أدخل تصنيفاً مخصصاً"
                autoFocus
              />
            )}
          </div>

          {/* ─── قسم الملف ─── */}
          <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '16px', border: '1px solid #e2e8f0' }}>
            <label style={{ ...labelStyle, marginBottom: 12 }}>
              الملف
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginRight: 8 }}>
                (اختر طريقة الإضافة)
              </span>
            </label>

            <FileSourceToggle
              mode={fileMode}
              onChange={m => { setFileMode(m); setUploadFile(null); set('fileUrl', ''); }}
            />

            <div style={{ marginTop: 14 }}>
              {fileMode === 'url' ? (
                <>
                  <input
                    style={{ ...inputStyle, direction: 'ltr', textAlign: 'left', background: '#fff' }}
                    value={form.fileUrl}
                    onChange={e => set('fileUrl', e.target.value)}
                    placeholder="https://drive.google.com/... أو رابط PDF مباشر"
                  />
                  <div style={{
                    fontSize: 11, color: '#94a3b8', marginTop: 6,
                    display: 'flex', gap: 10, flexWrap: 'wrap',
                  }}>
                    <span>✅ Google Drive</span>
                    <span>✅ Dropbox</span>
                    <span>✅ OneDrive</span>
                    <span>✅ رابط PDF مباشر</span>
                  </div>
                </>
              ) : (
                <>
                  <DropZone file={uploadFile} onChange={setUploadFile} />
                  {progress > 0 && progress < 100 && <ProgressBar percent={progress} />}
                  {uploadFile && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                      سيتم رفع الملف تلقائياً عند الضغط على "إضافة"
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* السنة */}
          <div>
            <label style={labelStyle}>سنة النشر</label>
            <input
              style={{ ...inputStyle, width: 130 }}
              type="number"
              min="1900"
              max="2099"
              value={form.year}
              onChange={e => set('year', e.target.value)}
            />
          </div>

          {/* الوصف */}
          <div>
            <label style={labelStyle}>
              وصف مختصر{' '}
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>(اختياري)</span>
            </label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="وصف موجز عن المرجع..."
            />
          </div>

          {/* Toggle النشر */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            background: form.published ? 'rgba(16,185,129,0.05)' : '#F8FAFC',
            borderRadius: 12,
            border: `1px solid ${form.published ? 'rgba(16,185,129,0.2)' : '#e2e8f0'}`,
            transition: 'all .2s',
          }}>
            <button
              type="button"
              onClick={() => set('published', !form.published)}
              style={{
                width: 50, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: form.published ? '#10b981' : '#e2e8f0',
                position: 'relative', transition: 'background .2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 4, width: 20, height: 20, borderRadius: '50%',
                background: '#fff', transition: 'right .2s',
                right: form.published ? 4 : 26,
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: form.published ? '#10b981' : '#94a3b8' }}>
                {form.published ? '✅ منشور (مرئي للزوار)' : '🔒 مخفي (مسودة)'}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {form.published
                  ? 'سيظهر في صفحة البرنامج للجميع'
                  : 'لن يظهر للزوار حتى تنشره'}
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الحفظ */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #f1f5f9',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
          position: 'sticky', bottom: 0, background: '#fff',
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
            {saving
              ? (progress > 0 ? `📤 ${progress}%` : '⏳ جاري الحفظ...')
              : (isEdit ? '💾 حفظ التعديلات' : '➕ إضافة')
            }
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
  const [modal, setModal]           = useState(null);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('all');
  const [confirmDel, setConfirmDel] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchItems = useCallback(() => {
    setLoading(true);
    fetch('/api/library', { headers: { 'x-admin-token': ADMIN_TOKEN } })
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => showToast('فشل تحميل البيانات', false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSaved = (item, isEdit) => {
    setItems(prev => isEdit
      ? prev.map(i => i.id === item.id ? item : i)
      : [...prev, item]);
    setModal(null);
    showToast(isEdit ? 'تم تحديث المرجع بنجاح' : 'تمت الإضافة بنجاح ✨');
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/library?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': ADMIN_TOKEN },
      });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('تم الحذف');
    } catch {
      showToast('فشل الحذف', false);
    } finally {
      setConfirmDel(null);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const res = await fetch('/api/library', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
        body: JSON.stringify({ id: item.id, published: !item.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setItems(prev => prev.map(i => i.id === item.id ? data.item : i));
      showToast(data.item.published ? 'تم النشر' : 'تم الإخفاء');
    } catch {
      showToast('فشلت العملية', false);
    }
  };

  const categories = [
    'all',
    ...Array.from(new Set(items.map(i => i.category).filter(Boolean))),
  ];
  const filtered = items.filter(i => {
    const matchCat    = filterCat === 'all' || i.category === filterCat;
    const matchSearch = !search
      || i.title.includes(search)
      || i.author?.includes(search);
    return matchCat && matchSearch;
  });

  const typeIcon = { book: '📗', reference: '📖', paper: '📄', guide: '📋', other: '📁' };

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
          <div style={{ fontSize: 20, fontWeight: 900 }}>📚 داشبورد المكتبة الرقمية</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>مؤتمر الصمود — مستشفى ناصر</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 10 }}>
            🔐 وضع المسؤول
          </div>
          <button
            type="button"
            onClick={() => setModal('add')}
            style={{
              padding: '10px 20px', background: G, color: B, border: 'none',
              borderRadius: 10, fontWeight: 900, fontSize: 14, cursor: 'pointer',
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            ➕ إضافة مرجع
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: 14, marginBottom: 24,
        }}>
          {[
            { label: 'إجمالي المراجع', value: items.length,                                    icon: '📚', color: B },
            { label: 'منشور',          value: items.filter(i => i.published !== false).length,  icon: '✅', color: '#10b981' },
            { label: 'مخفي',           value: items.filter(i => i.published === false).length,  icon: '🔒', color: '#94a3b8' },
            { label: 'التصنيفات',      value: new Set(items.map(i => i.category)).size,         icon: '🏷️', color: G },
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

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 بحث بالعنوان أو المؤلف..."
            style={{
              flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 14,
              fontFamily: "'Cairo',sans-serif", direction: 'rtl', background: '#fff',
            }}
          />
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 14,
              fontFamily: "'Cairo',sans-serif", background: '#fff', color: B,
            }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'كل التصنيفات' : c}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 16 }}>
            ⏳ جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 60,
            background: '#fff', borderRadius: 16,
            border: '1px dashed #e2e8f0', color: '#94a3b8',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700 }}>لا توجد مراجع</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(item => (
              <div key={item.id} style={{
                background: '#fff', border: '1px solid #e8edf2',
                borderRadius: 14, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: item.published === false ? 0.65 : 1,
                transition: 'all .2s',
              }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>
                  {typeIcon[item.type] || '📁'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: B, marginBottom: 3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 12, color: '#64748b',
                    display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
                  }}>
                    {item.author && <span>✍️ {item.author}</span>}
                    {item.category && (
                      <span style={{
                        background: 'rgba(27,54,93,0.07)', color: B,
                        padding: '1px 8px', borderRadius: 10,
                      }}>
                        {item.category}
                      </span>
                    )}
                    {item.year && <span>• {item.year}</span>}
                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: R, textDecoration: 'none', fontWeight: 600 }}
                      >
                        {item.fileUrl.startsWith('/uploads/') ? '📁 ملف محلي ↗' : '🔗 رابط ↗'}
                      </a>
                    )}
                  </div>
                </div>
                <div style={{
                  display: 'flex', gap: 8, flexShrink: 0,
                  flexWrap: 'wrap', justifyContent: 'flex-end',
                }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: item.published !== false
                        ? 'rgba(16,185,129,0.1)'
                        : 'rgba(148,163,184,0.1)',
                      color: item.published !== false ? '#10b981' : '#94a3b8',
                      fontSize: 12, fontWeight: 700, fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    {item.published !== false ? '✅ منشور' : '🔒 مخفي'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal(item)}
                    style={{
                      padding: '6px 12px', borderRadius: 8,
                      border: `1px solid ${B}`, background: '#fff', color: B,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDel(item.id)}
                    style={{
                      padding: '6px 12px', borderRadius: 8,
                      border: `1px solid ${R}`, background: '#fff', color: R,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {(modal === 'add' || (modal && modal !== 'add')) && (
        <ItemModal
          item={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
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
              تأكيد الحذف
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              هل أنت متأكد من حذف هذا المرجع؟ لا يمكن التراجع.
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
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}