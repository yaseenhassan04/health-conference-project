'use client';
import { useEffect, useState } from "react";

export default function MediaPage() {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetch("/api/gallery/screens")
      .then(res => res.json())
      .then(data => {
        const published = data.items?.filter(item => item.published !== false) || [];
        setScreens(published);
        setLoading(false);
      })
      .catch(err => {
        console.error("فشل التحميل:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <div style={{ color: "#64748b" }}>جاري تحميل شاشات التفاعل...</div>
      </div>
    );
  }

  if (screens.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🖼️</div>
        <div style={{ color: "#64748b" }}>لا توجد شاشات تفاعل حالياً</div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "40px 20px"
      }}>
        <h1 style={{
          color: "#1B365D",
          fontSize: 32,
          textAlign: "center",
          marginBottom: 12
        }}>
          شاشات التفاعل
        </h1>
        <p style={{
          textAlign: "center",
          color: "#64748b",
          marginBottom: 48
        }}>
          اضغط على أي بطاقة لعرض المحتوى
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 28
        }}>
          {screens.map((screen) => (
            <Card key={screen.id} item={screen} onClick={() => setSelectedItem(screen)} />
          ))}
        </div>
      </div>

      {selectedItem && (
        <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ✅ كارد مع صورة فعلية وظل
function Card({ item, onClick }) {
  // تحديد الصورة المناسبة للعرض
  const getImageUrl = () => {
    if (item.type === "image") return item.mediaUrl;
    if (item.type === "video") return item.mediaUrl || "/video-placeholder.jpg";
    if (item.type === "link") return item.imageUrl || "/link-placeholder.jpg";
    return "/text-placeholder.jpg";
  };

  const hasImage = getImageUrl() && getImageUrl() !== "/video-placeholder.jpg";

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        background: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        animation: "fadeIn 0.5s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
      }}
    >
      {/* صورة الكارد مع ظل داخلي */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        {hasImage ? (
          <>
            <img
              src={getImageUrl()}
              alt={item.titleAr}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
            {/* طبقة ظل داكنة فوق الصورة لتوضيح النص */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
            }} />
          </>
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1B365D, #2a4a7f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            color: "#fff",
          }}>
            {item.type === "video" ? "🎥" : item.type === "link" ? "🔗" : "📝"}
          </div>
        )}
        
        {/* نوع المحتوى (badge) */}
        <div style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
        }}>
          {item.type === "image" && "🖼️ صورة"}
          {item.type === "video" && "🎥 فيديو"}
          {item.type === "link" && "🔗 رابط"}
          {item.type === "text" && "📝 نص"}
        </div>
      </div>

      {/* معلومات الكارد */}
      <div style={{ padding: "20px" }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 900,
          color: "#1B365D",
          marginBottom: 8,
          lineHeight: 1.4,
        }}>
          {item.titleAr}
        </h3>
        {item.titleEn && (
          <p style={{
            fontSize: 12,
            color: "#94a3b8",
            marginBottom: 12,
            direction: "ltr",
          }}>
            {item.titleEn}
          </p>
        )}
        {item.descAr && (
          <p style={{
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.6,
            marginBottom: 16,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {item.descAr}
          </p>
        )}
        <div style={{
          fontSize: 12,
          color: "#D4AF37",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          اضغط للعرض <span style={{ fontSize: 14 }}>←</span>
        </div>
      </div>
    </div>
  );
}

// ✅ نافذة منبثقة احترافية لعرض المحتوى
function Modal({ item, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
    return match?.[1];
  };

  return (
    <>
      {/* خلفية مظلمة */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 9998,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* نافذة المحتوى */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          borderRadius: 28,
          width: "90%",
          maxWidth: 950,
          maxHeight: "85vh",
          overflow: "auto",
          zIndex: 9999,
          direction: "rtl",
          fontFamily: "'Cairo', sans-serif",
          animation: "slideUp 0.3s ease",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        {/* زر إغلاق */}
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 16,
            left: "calc(100% - 56px)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "#C8102E",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "all 0.2s",
            margin: "16px 16px 0 auto",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          ✕
        </button>

        {/* محتوى النافذة */}
        <div style={{ padding: "0 32px 32px 32px" }}>
          
          {/* 🖼️ صورة */}
          {item.type === "image" && (
            <div>
              <div style={{
                background: "#F8FAFC",
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 24,
                textAlign: "center",
              }}>
                <img
                  src={item.mediaUrl}
                  alt={item.titleAr}
                  style={{
                    width: "100%",
                    maxHeight: 550,
                    objectFit: "contain",
                  }}
                />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1B365D", marginBottom: 12 }}>
                {item.titleAr}
              </h2>
              {item.descAr && (
                <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.8 }}>
                  {item.descAr}
                </p>
              )}
            </div>
          )}

          {/* 🎥 فيديو */}
          {item.type === "video" && (
            <div>
              <div style={{
                background: "#000",
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 24,
              }}>
                {getYouTubeId(item.mediaUrl) ? (
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/${getYouTubeId(item.mediaUrl)}?autoplay=1`}
                    title={item.titleAr}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : item.mediaUrl && (
                  <video
                    controls
                    autoPlay
                    style={{ width: "100%", maxHeight: 480 }}
                  >
                    <source src={item.mediaUrl} />
                  </video>
                )}
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1B365D", marginBottom: 12 }}>
                {item.titleAr}
              </h2>
              {item.descAr && (
                <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.8 }}>
                  {item.descAr}
                </p>
              )}
            </div>
          )}

          {/* 🔗 رابط */}
          {item.type === "link" && (
            <div>
              <div style={{
                background: "linear-gradient(135deg, #1B365D, #2a4a7f)",
                borderRadius: 20,
                padding: 48,
                textAlign: "center",
                color: "#fff",
                marginBottom: 24,
              }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>{item.icon || "🔗"}</div>
                <h2 style={{ fontSize: 28, marginBottom: 12 }}>{item.titleAr}</h2>
                <p style={{ opacity: 0.9, marginBottom: 24 }}>{item.descAr}</p>
                {item.href && (
                  <button
                    onClick={() => window.open(item.href, "_blank")}
                    style={{
                      background: "#D4AF37",
                      border: "none",
                      padding: "12px 32px",
                      borderRadius: 40,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#1B365D",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#D4AF37";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    🔗 زيارة الرابط
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 📝 نص */}
          {item.type === "text" && (
            <div>
              <div style={{
                background: "#F8FAFC",
                borderRadius: 20,
                padding: 40,
                textAlign: "center",
                marginBottom: 24,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1B365D", marginBottom: 16 }}>
                  {item.titleAr}
                </h2>
                <div style={{
                  fontSize: 16,
                  color: "#64748b",
                  lineHeight: 1.8,
                  textAlign: "justify",
                }}>
                  {item.descAr}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}