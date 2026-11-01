"use client";

export default function IconGlyph({ type, color }) {
  const s = { width: 18, height: 18, stroke: color, fill: "none", strokeWidth: 1.6 };
  switch (type) {
    case "globe":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
      );
    case "handshake":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M2 12l5-4 4 3 3-3 4 1 4 5-3 3-2-2-3 3-3-3-2 2-3-3z" strokeLinejoin="round" />
        </svg>
      );
    case "medal":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <circle cx="12" cy="9" r="5" />
          <path d="M9 13.5L7 21l5-3 5 3-2-7.5" strokeLinejoin="round" />
        </svg>
      );
    case "microscope":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M9 20h6M12 20v-4M8 16h6a2 2 0 002-2 2 2 0 00-2-2h-1V8a3 3 0 00-3-3 3 3 0 00-3 3M6 8h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
