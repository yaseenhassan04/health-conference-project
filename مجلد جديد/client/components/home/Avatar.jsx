"use client";

import { avatarFallbackUrl } from "./avatarFallback";

const G = "#D4AF37";

export default function Avatar({ src, name, size = 64, border = 3, float = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: `${border}px solid ${G}`,
        boxShadow: `0 4px 16px rgba(27,54,93,0.12)`,
        background: "#eef2f7",
        flexShrink: 0,
        animation: float ? "float-avatar 3.5s ease-in-out infinite" : "none",
      }}
    >
      <img
        src={src || "/president.png"}
        alt={name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = avatarFallbackUrl(name);
        }}
      />
    </div>
  );
}
