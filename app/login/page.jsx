"use client";
/**
 * app/login/page.jsx
 * صفحة تسجيل الدخول — تحول لـ /dashboard بعد نجاح الدخول
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

const B = "#1B365D", R = "#C8102E", G = "#D4AF37";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "بيانات غير صحيحة");
      localStorage.setItem("auth_token", data.token);
      router.replace("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${B} 0%, #0f2040 50%, #1a1a2e 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cairo', sans-serif", direction: "rtl",
      padding: 16, position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* دوائر خلفية */
        .bg-circle-1 {
          position: absolute; width: 500px; height: 500px;
          border-radius: 50%; top: -150px; right: -100px;
          background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .bg-circle-2 {
          position: absolute; width: 400px; height: 400px;
          border-radius: 50%; bottom: -100px; left: -80px;
          background: radial-gradient(circle, rgba(200,16,46,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-card {
          background: rgba(255,255,255,0.97);
          border-radius: 24px;
          width: 100%; max-width: 420px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.4);
          overflow: hidden;
          animation: slideUp .4s cubic-bezier(.16,1,.3,1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .input-wrap {
          position: relative;
        }
        .login-input {
          width: 100%;
          padding: 13px 44px 13px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Cairo', sans-serif;
          color: ${B};
          background: #F8FAFC;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          direction: rtl;
        }
        .login-input:focus {
          border-color: ${B};
          box-shadow: 0 0 0 3px rgba(27,54,93,0.1);
          background: #fff;
        }
        .login-input::placeholder { color: #94a3b8; }
        .input-icon {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          font-size: 16px; pointer-events: none;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, ${B}, #2a4a7f);
          color: #fff;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 900;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all .2s;
          box-shadow: 0 4px 16px rgba(27,54,93,0.35);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(27,54,93,0.45);
        }
        .login-btn:disabled {
          opacity: 0.7; cursor: not-allowed; transform: none;
        }

        .error-box {
          background: rgba(200,16,46,0.07);
          border: 1px solid rgba(200,16,46,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: ${R};
          font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }

        .show-pass-btn {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; font-size: 16px;
          color: #94a3b8;
          padding: 0;
        }
      `}</style>

      <div className="bg-circle-1" />
      <div className="bg-circle-2" />

      <div className="login-card">
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${B}, #2a4a7f)`,
          padding: "32px 32px 28px",
          textAlign: "center",
          position: "relative",
        }}>
          {/* شعار */}
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "rgba(255,255,255,0.12)",
            border: "2px solid rgba(212,175,55,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, margin: "0 auto 14px",
          }}>🏥</div>
          <div style={{
            fontSize: 17, fontWeight: 900, color: "#fff",
            marginBottom: 4, lineHeight: 1.4,
          }}>
            المؤتمر العلمي الثاني عشر
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            لأمراض الباطنة — مستشفى ناصر
          </div>

          {/* شريط ذهبي */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${G}, transparent)`,
          }} />
        </div>

        {/* Form */}
        <div style={{ padding: "28px 32px 32px" }}>
          <div style={{
            fontSize: 15, fontWeight: 900, color: B,
            marginBottom: 20, textAlign: "center",
          }}>
            تسجيل الدخول للوحة التحكم
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* اسم المستخدم */}
            <div>
              <label style={{
                fontSize: 12, fontWeight: 700, color: B,
                display: "block", marginBottom: 6,
              }}>
                اسم المستخدم
              </label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input
                  className="login-input"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label style={{
                fontSize: 12, fontWeight: 700, color: B,
                display: "block", marginBottom: 6,
              }}>
                كلمة المرور
              </label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  className="login-input"
                  type={showPass ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  style={{ paddingLeft: 40 }}
                />
                <button
                  className="show-pass-btn"
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  title={showPass ? "إخفاء" : "إظهار"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="error-box">
                ⚠️ {error}
              </div>
            )}

            {/* زر الدخول */}
            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "⏳ جاري التحقق..." : "🔓 دخول إلى لوحة التحكم"}
            </button>
          </div>

          {/* معلومات مساعدة */}
          <div style={{
            marginTop: 20,
            padding: "12px 14px",
            background: "#F8FAFC",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 11,
            color: "#94a3b8",
            textAlign: "center",
            lineHeight: 1.8,
          }}>
            🔐 هذه الصفحة مخصصة للمسؤولين فقط<br />
            للحصول على حساب تواصل مع مدير النظام
          </div>
        </div>
      </div>
    </div>
  );
}