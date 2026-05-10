export default function Media() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="mb-4 text-center" style={{ color: 'var(--primary)' }}>المعرض والوسائط</h1>
      <p className="text-center mb-4" style={{ color: 'var(--text-muted)' }}>معرض الصور اليومي، صور التحضيرات، والمركز الإعلامي للمؤتمر.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-panel" style={{ padding: '0.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '200px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>[صورة {i}]</span>
            </div>
            <p className="text-center mt-4 mb-2" style={{ fontSize: '0.9rem' }}>تجهيزات القاعة الرئيسية - اليوم {i % 2 === 0 ? 'الثاني' : 'الأول'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
