"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AnnouncementPopup({
  imageSrc = "/announcement.jpg",
  imageAlt = "إعلان",
  showOnce = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // ← جديد

  useEffect(() => {
    setMounted(true); // ← جديد
    if (!showOnce) {
      setIsOpen(true);
      return;
    }
    const alreadySeen = sessionStorage.getItem("announcement_seen");
    if (!alreadySeen) {
      setIsOpen(true);
    }
  }, [showOnce]);

  const handleClose = () => {
    setIsOpen(false);
    if (showOnce) {
      sessionStorage.setItem("announcement_seen", "true");
    }
  };

  if (!mounted || !isOpen) return null; // ← عدّل هذا السطر

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "480px",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          backgroundColor: "#fff",
        }}
      >
        <button
          onClick={handleClose}
          aria-label="إغلاق"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: "18px",
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          ×
        </button>

        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1024}
          height={1450}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />

        <a
          href="/registration/workshops"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "14px 20px",
            backgroundColor: "#8B6914",
            color: "#fff",
            fontSize: "17px",
            fontWeight: "700",
            textDecoration: "none",
            letterSpacing: "0.3px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d510f")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B6914")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
          </svg>
          سجّل الآن في ورشات العمل
        </a>
      </div>
    </div>
  );
}