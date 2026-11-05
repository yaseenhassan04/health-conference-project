"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AnnouncementPopup({
  imageSrc = "/workshops-announcement.png",   // ← الصورة الجديدة (اللي فيها الورشتين)
  imageAlt = "ورش عمل ما قبل المؤتمر",
  showOnce = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!showOnce) { setIsOpen(true); return; }
    if (!sessionStorage.getItem("workshops_popup_seen")) setIsOpen(true);
  }, [showOnce]);

  const handleClose = () => {
    setIsOpen(false);
    if (showOnce) sessionStorage.setItem("workshops_popup_seen", "true");
  };

  if (!mounted || !isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative", maxWidth: 500, width: "100%",
          borderRadius: 18, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          backgroundColor: "#fff",
        }}
      >
        {/* زر الإغلاق */}
        <button
          onClick={handleClose}
          aria-label="إغلاق"
          style={{
            position: "absolute", top: 10, right: 10,
            width: 34, height: 34, borderRadius: "50%",
            border: "none", backgroundColor: "rgba(0,0,0,0.55)",
            color: "#fff", fontSize: 18, lineHeight: 1, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1,
          }}
        >×</button>

        {/* الصورة */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1080}
          height={1080}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />

        {/* أزرار التسجيل */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 0, fontFamily: "'Cairo',sans-serif",
        }}>
          <a
            href="/registration/workshops?w=bronchoscopy"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "14px 12px",
              backgroundColor: "#1B365D", color: "#fff",
              fontSize: 15, fontWeight: 800, textDecoration: "none",
              borderTop: "3px solid #C9A227",
              transition: "background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2a4a7a"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1B365D"}
          >
            🫁 تسجيل 8 نوفمبر
          </a>
          <a
            href="/registration/workshops?w=pocus"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "14px 12px",
              backgroundColor: "#C9A227", color: "#fff",
              fontSize: 15, fontWeight: 800, textDecoration: "none",
              borderTop: "3px solid #1B365D",
              transition: "background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a87d10"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C9A227"}
          >
            📡 تسجيل 9 نوفمبر
          </a>
        </div>
      </div>
    </div>
  );
}