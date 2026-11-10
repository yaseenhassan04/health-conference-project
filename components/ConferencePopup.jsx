"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ConferencePopup({
  imageSrc = "/conference-announcement.png",
  imageAlt = "المؤتمر الثاني عشر لأمراض الباطنة",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // localStorage → لا تظهر مرة ثانية أبداً
    if (!localStorage.getItem("conference_popup_seen")) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("conference_popup_seen", "true");
  };

  const handleRegister = () => {
    handleClose();
    window.location.href = "/registration/conference";
  };

  if (!mounted || !isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative", maxWidth: 500, width: "100%",
          borderRadius: 18, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
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
            color: "#fff", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1,
          }}
        >×</button>

        {/* صورة الإعلان */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1080}
          height={1080}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />

        {/* زر التسجيل */}
        <div style={{ backgroundColor: "#0D1B2A", padding: "0" }}>
          <button
            onClick={handleRegister}
            style={{
              width: "100%",
              padding: "16px 24px",
              backgroundColor: "#D4AF37",
              color: "#0D1B2A",
              border: "none",
              fontSize: 17,
              fontWeight: 800,
              fontFamily: "'Cairo', sans-serif",
              cursor: "pointer",
              letterSpacing: 0.5,
              transition: "background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#b8941e"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#D4AF37"}
          >
            سجّل الآن للحضور الوجاهي ←
          </button>
        </div>
      </div>
    </div>
  );
}