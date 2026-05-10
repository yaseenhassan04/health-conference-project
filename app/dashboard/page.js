"use client";
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link'; // إضافة Link للربط بين الصفحات
import { ExternalLink } from 'lucide-react'; // أيقونة اختيارية لتجميل الزر

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [stats, setStats] = useState({ users: 0, abstracts: 0 });
  const [abstractList, setAbstractList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeTab, setActiveTab] = useState('abstracts');

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchAbstracts = async () => {
        try {
          const absRes = await fetch('/api/abstracts');
          const absData = await absRes.json();
          if (absData.abstracts) {
            setAbstractList(absData.abstracts);
            setStats(s => ({ ...s, abstracts: absData.abstracts.length }));
          }
        } catch (e) {
          console.error("Failed to load abstracts stats", e);
        }
      };

      const fetchUsers = async () => {
        try {
          const userRes = await fetch('/api/users');
          const userData = await userRes.json();
          if (userData.users) {
            setUserList(userData.users);
            setStats(s => ({ ...s, users: userData.users.length }));
          }
        } catch (e) {
          console.error("Failed to load users stats", e);
        }
      };

      fetchAbstracts();
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === 'admin' && loginData.password === 'admin') {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem('adminAuth', 'true');
      window.dispatchEvent(new Event('authChange'));
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    window.dispatchEvent(new Event('authChange'));
  };

  const updateAbstractStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/abstracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAbstractList(list => list.map(ab => ab.id === id ? { ...ab, status } : ab));
      }
    } catch (e) {
      console.error('Failed to update status');
    }
  };

  const exportCSV = () => {
    const data = activeTab === 'abstracts' ? abstractList : userList;
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const data = activeTab === 'abstracts' ? abstractList : userList;
    if (!data.length) return;
    const doc = new jsPDF();
    const columns = activeTab === 'abstracts'
      ? ['ID', 'Title', 'Author', 'Email', 'Status']
      : ['ID', 'Name', 'Email', 'Profession', 'Country'];
    const rows = data.map(item => activeTab === 'abstracts'
      ? [item.id, item.title, item.authorName, item.email, item.status]
      : [item.id, item.fullName, item.email, item.profession, item.country]);
    doc.setFontSize(18);
    doc.text(`Report: ${activeTab.toUpperCase()}`, 14, 22);
    autoTable(doc, { startY: 30, head: [columns], body: rows });
    doc.save(`report_${activeTab}.pdf`);
  };

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <form className="glass-panel" onSubmit={handleLogin}>
          <h2 className="mb-4 text-center" style={{ color: 'var(--primary)' }}>تسجيل الدخول للإدارة</h2>
          <div className="form-group">
            <label className="form-label">اسم المستخدم</label>
            <input type="text" className="form-input" required value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input type="password" className="form-input" required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>تسجيل الدخول</button>
          {loginError && <p className="text-center mt-3" style={{ color: 'var(--danger)' }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="mb-4" style={{ color: 'var(--primary)' }}>لوحة تحكم الإدارة (سري)</h1>
        <button className="btn-outline" onClick={handleLogout}>تسجيل الخروج</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel text-center">
          <h2 style={{ fontSize: '3rem', color: 'var(--secondary)' }}>{stats.users || '--'}</h2>
          <p>إجمالي المسجلين</p>
        </div>
        <div className="glass-panel text-center">
          <h2 style={{ fontSize: '3rem', color: 'var(--primary)' }}>{stats.abstracts || '--'}</h2>
          <p>أبحاث مقدمة</p>
        </div>
        <div className="glass-panel text-center">
          <h2 style={{ fontSize: '3rem', color: 'var(--danger)' }}>1</h2>
          <p>الدول المشاركة</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
          <button
            className={`btn-outline ${activeTab === 'abstracts' ? 'active-tab' : ''}`}
            style={{ borderRadius: '0', border: 'none', borderBottom: activeTab === 'abstracts' ? '2px solid var(--primary)' : 'none', flex: 1, padding: '1rem' }}
            onClick={() => setActiveTab('abstracts')}
          >
            نظام التحكيم (الأبحاث)
          </button>
          <button
            className={`btn-outline ${activeTab === 'users' ? 'active-tab' : ''}`}
            style={{ borderRadius: '0', border: 'none', borderBottom: activeTab === 'users' ? '2px solid var(--secondary)' : 'none', flex: 1, padding: '1rem' }}
            onClick={() => setActiveTab('users')}
          >
            عرض التسجيلات (المستخدمين)
          </button>
        </div>

        <div style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={exportCSV} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              تصدير CSV
            </button>
            <button onClick={exportPDF} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderColor: 'var(--danger)' }}>
              تصدير PDF
            </button>
          </div>

          {/* الزر الجديد للانتقال لصفحة التدقيق */}
          {activeTab === 'abstracts' && (
            <Link href="/dashboard/submission">
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                <ExternalLink size={16} /> فتح نظام التدقيق المتقدم
              </button>
            </Link>
          )}
        </div>

        <div style={{ padding: '2rem', overflowX: 'auto' }}>
          {activeTab === 'abstracts' && (
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>عنوان البحث</th>
                  <th style={{ padding: '1rem' }}>الباحث</th>
                  <th style={{ padding: '1rem' }}>الملف</th>
                  <th style={{ padding: '1rem' }}>الحالة</th>
                  <th style={{ padding: '1rem' }}>القرار</th>
                </tr>
              </thead>
              <tbody>
                {abstractList.length === 0 ? (
                  <tr><td colSpan="5" className="text-center" style={{ padding: '1rem', color: 'var(--text-muted)' }}>لا يوجد أبحاث بعد</td></tr>
                ) : (
                  abstractList.map(ab => (
                    <tr key={ab.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem' }}>{ab.title}</td>
                      <td style={{ padding: '1rem' }}>{ab.authorName}</td>
                      <td style={{ padding: '1rem' }}><a href={ab.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>عرض PDF</a></td>
                      <td style={{ padding: '1rem', color: ab.status === 'PENDING' ? 'orange' : 'var(--success)' }}>{ab.status}</td>
                      <td style={{ padding: '1rem' }}>
                        {ab.status === 'PENDING' ? (
                          <button onClick={() => updateAbstractStatus(ab.id, 'ACCEPTED')} className="btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>قبول</button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>تم التقييم</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'users' && (
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>الاسم</th>
                  <th style={{ padding: '1rem' }}>الإيميل</th>
                  <th style={{ padding: '1rem' }}>المهنة</th>
                  <th style={{ padding: '1rem' }}>الدولة</th>
                  <th style={{ padding: '1rem' }}>تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {userList.length === 0 ? (
                  <tr><td colSpan="5" className="text-center" style={{ padding: '1rem', color: 'var(--text-muted)' }}>لا يوجد مسجلين بعد</td></tr>
                ) : (
                  userList.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem' }}>{user.fullName}</td>
                      <td style={{ padding: '1rem' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>{user.profession}</td>
                      <td style={{ padding: '1rem' }}>{user.country}</td>
                      <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}