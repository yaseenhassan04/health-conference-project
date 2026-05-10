"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, Heart, MessageCircle, Users, Eye } from 'lucide-react';

export default function LivePage() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ viewers: 0, questions: 0, likes: 0 });
  const [lang, setLang] = useState('ar');
  const bottomRef = useRef(null);

  const colors = {
    primary: '#1B365D',
    accent: '#D4AF37',
    danger: '#C8102E',
  };

  const content = {
    ar: {
      dir: 'rtl',
      title: 'البث المباشر — تفاعل مباشر',
      qaTitle: '💬 الأسئلة والتفاعل',
      nameLabel: 'اسمك (اختياري)',
      questionLabel: 'اكتب سؤالك هنا…',
      sendBtn: 'إرسال',
      sending: 'جاري…',
      noQuestions: 'لا توجد أسئلة بعد\nكن أول من يطرح سؤالاً!',
      viewers: 'مشاهد',
      questions: 'سؤال',
      likes: 'إعجاب',
      footer: '© 2026 المؤتمر العلمي الثاني عشر لأمراض الباطنة',
      liveNow: 'بث مباشر الآن',
      coming: 'سيبدأ البث المباشر قريباً',
    },
    en: {
      dir: 'ltr',
      title: 'Live Stream — Interactive Q&A',
      qaTitle: '💬 Questions & Interaction',
      nameLabel: 'Your Name (Optional)',
      questionLabel: 'Ask your question here…',
      sendBtn: 'Send',
      sending: 'Sending…',
      noQuestions: 'No questions yet\nBe the first to ask!',
      viewers: 'Viewers',
      questions: 'Questions',
      likes: 'Likes',
      footer: '© 2026 The 12th Conference of Internal Medicine',
      liveNow: 'Live Now',
      coming: 'Live stream coming soon',
    },
  };

  const t = content[lang];

  // جلب الأسئلة
  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
        setStats({
          viewers: Math.floor(Math.random() * 500) + 100,
          questions: data.questions.length,
          likes: data.questions.reduce((sum, q) => sum + (q.likes || 0), 0),
        });
      }
    } catch (error) {
      console.error('خطأ في جلب الأسئلة:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questions]);

  // إرسال سؤال جديد
  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newQuestion,
          author: authorName || 'مجهول',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewQuestion('');
        await fetchQuestions();
      }
    } catch (error) {
      console.error('خطأ في إرسال السؤال:', error);
    } finally {
      setSending(false);
    }
  };

  // إضافة إعجاب
  const handleLike = async (questionId) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchQuestions();
      }
    } catch (error) {
      console.error('خطأ في الإعجاب:', error);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #F4F7F9;
          font-family: 'IBM Plex Sans Arabic', 'Syne', sans-serif;
          color: #1e293b;
          min-height: 100vh;
        }

        .navbar {
          background: ${colors.primary};
          padding: 16px 24px;
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .navbar a {
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: 0.2s;
        }

        .navbar a:hover { color: ${colors.accent}; }

        .page-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding: 24px;
        }

        .page-wrap {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(200,16,46,0.12);
          border: 1px solid rgba(200,16,46,0.3);
          border-radius: 100px;
          padding: 8px 16px;
          font-family: monospace;
          font-size: 12px;
          color: ${colors.danger};
          font-weight: 700;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: ${colors.danger};
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; box-shadow: 0 0 0 0 rgba(200,16,46,0.5); }
          70% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(200,16,46,0); }
          100% { opacity: 1; }
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 800;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.danger});
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .lang-btn {
          padding: 8px 16px;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .lang-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .stat-value {
          font-size: 24px;
          font-weight: 900;
          color: ${colors.primary};
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .live-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .live-layout { grid-template-columns: 1fr; }
        }

        .video-panel {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
        }

        .video-screen {
          width: 100%;
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .video-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          animation: drift 20s linear infinite;
        }

        @keyframes drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        .video-placeholder {
          text-align: center;
          color: #94a3b8;
          position: relative;
          z-index: 1;
        }

        .video-placeholder div {
          font-size: 64px;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .video-placeholder p {
          font-size: 18px;
          font-weight: 600;
        }

        .video-footer {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #64748b;
          background: #f8fafc;
        }

        .qa-panel {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          height: 500px;
          overflow: hidden;
        }

        .qa-header {
          padding: 14px 18px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .qa-title {
          font-weight: 800;
          color: ${colors.primary};
          font-size: 14px;
        }

        .messages-wrap {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .msg-bubble {
          background: #f1f5f9;
          border-radius: 12px;
          padding: 12px;
          border-right: 3px solid ${colors.accent};
          transition: all 0.2s;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .msg-bubble:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .msg-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .msg-author {
          font-size: 11px;
          font-weight: bold;
          color: ${colors.primary};
        }

        .msg-time {
          font-size: 9px;
          color: #94a3b8;
        }

        .msg-text {
          font-size: 13px;
          color: #334155;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .msg-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .like-btn {
          background: none;
          border: 1px solid #cbd5e1;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          color: #64748b;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .like-btn:hover {
          border-color: ${colors.danger};
          color: ${colors.danger};
          background: rgba(200,16,46,0.05);
        }

        .msg-empty {
          text-align: center;
          padding: 40px 12px;
          color: #94a3b8;
          white-space: pre-line;
        }

        .qa-input-area {
          padding: 12px;
          border-top: 1px solid #e2e8f0;
          background: white;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-input {
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 13px;
          font-family: inherit;
        }

        .field-input:focus {
          border-color: ${colors.accent};
          outline: none;
          box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
        }

        .send-row {
          display: flex;
          gap: 8px;
        }

        .send-btn {
          background: ${colors.danger};
          color: white;
          border: none;
          padding: 0 16px;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .send-btn:hover:not(:disabled) {
          background: #a80d24;
          transform: translateY(-2px);
        }

        .send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .footer {
          text-align: center;
          padding: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #64748b;
          background: white;
          margin-top: 24px;
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar">
        <Link href="/">الرئيسية</Link>
        <Link href="/program">البرنامج العلمي</Link>
        <Link href="/participation">تقديم الأبحاث</Link>
        <Link href="/dashboard/submissions">لوحة التحكم</Link>
      </nav>

      {/* Main Content */}
      <div className="page-container">
        <div className="page-wrap">
          {/* Header */}
          <div className="page-header">
            <div className="header-left">
              <div className="live-badge">
                <span className="live-dot" />
                LIVE
              </div>
              <h1 className="page-title">{t.title}</h1>
            </div>
            <button
              className="lang-btn"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.viewers}</div>
              <div className="stat-label">👁️ {t.viewers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.questions}</div>
              <div className="stat-label">💬 {t.questions}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.likes}</div>
              <div className="stat-label">❤️ {t.likes}</div>
            </div>
          </div>

          {/* Live Layout */}
          <div className="live-layout">
            {/* Video Panel */}
            <div className="video-panel">
              <div className="video-screen">
                <div className="video-placeholder">
                  <div>📡</div>
                  <p>{t.coming}</p>
                </div>
              </div>
              <div className="video-footer">
                <span>المؤتمر العلمي الثاني عشر لأمراض الباطنة</span>
                <div>HD READY</div>
              </div>
            </div>

            {/* Q&A Panel */}
            <div className="qa-panel">
              <div className="qa-header">
                <div className="qa-title">{t.qaTitle}</div>
              </div>

              {/* Messages */}
              <div className="messages-wrap">
                {loading ? (
                  <div className="msg-empty">جاري التحميل...</div>
                ) : questions.length === 0 ? (
                  <div className="msg-empty">{t.noQuestions}</div>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="msg-bubble">
                      <div className="msg-header">
                        <div className="msg-author">{q.author}</div>
                        <div className="msg-time">
                          {new Date(q.createdAt).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="msg-text">{q.text}</div>
                      <div className="msg-actions">
                        <button
                          className="like-btn"
                          onClick={() => handleLike(q.id)}
                        >
                          ❤️ {q.likes || 0}
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div className="qa-input-area">
                <input
                  className="field-input"
                  type="text"
                  placeholder={t.nameLabel}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
                <form className="send-row" onSubmit={handleSendQuestion}>
                  <input
                    className="field-input"
                    type="text"
                    placeholder={t.questionLabel}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    className="send-btn"
                    type="submit"
                    disabled={sending}
                  >
                    {sending ? '…' : t.sendBtn}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">{t.footer}</footer>
    </>
  );
}