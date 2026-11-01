"use client";

import { useState } from "react";
import { avatarFallbackUrl } from "./avatarFallback";

const B = "#1B365D";
const G = "#D4AF37";

export default function PresidentQuoteSlide({ t, isRtl }) {
  const [open, setOpen] = useState(false);
  const president = t.president;
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${G}35`,
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(27,54,93,0.07)",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: open ? `linear-gradient(135deg,${B}06,${G}10)` : "#fff",
          border: "none",
          cursor: "pointer",
          fontFamily: "'Cairo',sans-serif",
          borderBottom: open ? `1px solid ${G}22` : "none",
          transition: "background 0.3s",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            overflow: "hidden",
            border: `3px solid ${open ? G : "#e2e8f0"}`,
            flexShrink: 0,
            transition: "border-color .3s, box-shadow .3s",
            boxShadow: open ? `0 0 16px 4px ${G}45` : "none",
            animation: open ? "float-avatar 3.5s ease-in-out infinite" : "none",
          }}
        >
          <img
            src={president.image}
            alt={president.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              e.currentTarget.src = avatarFallbackUrl(president.name, 200);
            }}
          />
        </div>
        <div style={{ flex: 1, textAlign: isRtl ? "right" : "left" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: B,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>💬</span>
            {t.presidentQuoteLabel}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {president.name}
          </div>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: open ? G : `${G}15`,
            border: `1px solid ${G}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: open ? B : "#9A7A10",
            transition: "all .35s",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            flexShrink: 0,
            fontWeight: 900,
          }}
        >
          ▼
        </div>
      </button>
      {open && (
        <div
          style={{
            overflow: "hidden",
            animation: "slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <div style={{ padding: "16px 16px 18px" }}>
            <div
              style={{
                position: "relative",
                fontSize: 13,
                color: "#374151",
                lineHeight: 2.1,
                background: `linear-gradient(135deg,#F8FAFC,#fef9ee)`,
                borderRadius: 12,
                border: `1px solid ${G}22`,
                [isRtl ? "borderRight" : "borderLeft"]: `3px solid ${G}`,
                padding: "14px 18px",
              }}
            >
              <span
                style={{
                  fontSize: 44,
                  color: `${G}28`,
                  fontFamily: "serif",
                  lineHeight: 0,
                  position: "absolute",
                  top: 24,
                  [isRtl ? "right" : "left"]: 8,
                  pointerEvents: "none",
                }}
              >
                "
              </span>
              <div style={{ [isRtl ? "paddingRight" : "paddingLeft"]: 26 }}>
                {t.presidentQuote.split("\n\n").map((para, i, arr) => (
                  <span
                    key={i}
                    style={{
                      display: "block",
                      marginBottom: i < arr.length - 1 ? 12 : 0,
                    }}
                  >
                    {para}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
                paddingTop: 10,
                borderTop: `1px solid ${B}08`,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: B }}>
                  {president.name}
                </div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>
                  {t.presidentFooter}
                </div>
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#7a5c1a",
                  background: `${G}12`,
                  border: `1px solid ${G}25`,
                  padding: "3px 10px",
                  borderRadius: 20,
                  direction: "ltr",
                }}
              >
                📧 {president.email}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
