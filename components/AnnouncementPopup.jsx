"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/**
 * إعلان منبثق (Popup) يظهر فوق الموقع مع تشويش (blur) للخلفية.
 * يُغلق بالضغط على زر X أو بالضغط خارج الصورة.
 * ...
 */
export default function AnnouncementPopup({
  imageSrc = "/announcement.jpg",
  imageAlt = "إعلان",
  showOnce = true,
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
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

  if (!isOpen) return null;

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
      </div>
    </div>
  );
}