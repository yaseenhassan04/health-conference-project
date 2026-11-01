export default function Lif() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="mb-4 text-center" style={{ color: 'var(--primary)' }}>Lif - خلف الكواليس</h1>
      <p className="text-center mb-4" style={{ color: 'var(--text-muted)' }}>حوارات إنسانية وعلمية من قلب الحدث توثق التجربة الطبية الحقيقية وتحديات العمل.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel">
          <div style={{ background: '#000', height: '200px', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#555' }}>[مساحة فيديو]</span>
          </div>
          <h3>"العمل تحت القصف"</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>حوار مع أطباء الطوارئ في مجمع ناصر حول التعامل السريع مع الإصابات الجماعية.</p>
        </div>
        
        <div className="glass-panel">
          <div style={{ background: '#000', height: '200px', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#555' }}>[مساحة فيديو]</span>
          </div>
          <h3>"أدوات بديلة للإنقاذ"</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>قصة ابتكار حلول طبية سريعة استجابةً لنقص المعدات في العناية المركزة.</p>
        </div>
      </div>
    </div>
  );
}
