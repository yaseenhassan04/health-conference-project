"use client";

import { useState, useEffect, useMemo } from "react";

const B = "#1B365D";
const R = "#C8102E";
const G = "#D4AF37";

export default function NewsTicker({ newsItems, newsLoading, t, isRtl, onClickItem }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const tickerItems = useMemo(() => {
    if (newsItems && newsItems.length > 0) return newsItems.map((n) => n.title);
    return t.news.map((n) => n.title);
  }, [newsItems, t.news]);

  useEffect(() => {
    if (tickerItems.length <= 1) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % tickerItems.length);
        setIsAnimating(false);
      }, 400);
    }, 5500);
    return () => clearInterval(interval);
  }, [tickerItems.length]);

  const handleClick = () => {
    const sourceItems = newsItems && newsItems.length > 0 ? newsItems : t.news;
    if (sourceItems[currentIdx]) onClickItem(sourceItems[currentIdx]);
  };

  const handleDotClick = (idx) => {
    setCurrentIdx(idx);
    setIsAnimating(false);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#fff",
        borderRadius: 14,
        border: `1.5px solid ${G}35`,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(27,54,93,0.08)",
        minHeight: 56,
        direction: isRtl ? "rtl" : "ltr",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          padding: "0 16px",
          background: `linear-gradient(135deg,${R},#a80d24)`,
          color: "#fff",
          fontSize: 13,
          fontWeight: 900,
          fontFamily: "'Cairo',sans-serif",
          height: "100%",
          minHeight: 56,
          flexShrink: 0,
          whiteSpace: "nowrap",
          letterSpacing: "0.5px",
          boxShadow: `inset 0 0 12px rgba(0,0,0,0.1)`,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#fff",
            animation: "pulse-dot 1.2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <span>{t.newsTicker}</span>
      </div>

      <div
        style={{
          width: 2,
          background: `linear-gradient(180deg, ${B}0, ${B}20, ${B}0)`,
          alignSelf: "stretch",
          opacity: 0.5,
        }}
      />

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "0 18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          minHeight: 56,
        }}
        onClick={handleClick}
        onMouseEnter={(e) => (e.currentTarget.style.background = `${B}02`)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: B,
            fontFamily: "'Cairo',sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating
              ? `translateY(${isRtl ? "-" : ""}10px)`
              : "translateY(0)",
            transition:
              "opacity 0.4s cubic-bezier(0.22,1,0.36,1), transform 0.4s cubic-bezier(0.22,1,0.36,1)",
            lineHeight: 1.4,
          }}
        >
          {newsLoading
            ? isRtl
              ? "⏳ جاري التحميل..."
              : "⏳ Loading..."
            : tickerItems[currentIdx]}
        </div>
      </div>

      {!newsLoading && tickerItems.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "0 14px",
            flexShrink: 0,
            alignItems: "center",
          }}
        >
          {tickerItems.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              style={{
                width: i === currentIdx ? 16 : 7,
                height: 7,
                borderRadius: 4,
                background: i === currentIdx ? G : `${B}25`,
                cursor: "pointer",
                transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
                border: "none",
                padding: 0,
                boxShadow: i === currentIdx ? `0 0 8px ${G}50` : "none",
              }}
              onMouseEnter={(e) => {
                if (i !== currentIdx) {
                  e.currentTarget.style.background = `${B}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (i !== currentIdx) {
                  e.currentTarget.style.background = `${B}25`;
                }
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          color: R,
          fontSize: 20,
          flexShrink: 0,
          borderLeft: `1px solid ${B}08`,
          background: `linear-gradient(135deg, ${B}0, ${R}08)`,
          cursor: "pointer",
          transition: "all 0.25s ease",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `linear-gradient(135deg, ${R}08, ${R}15)`;
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `linear-gradient(135deg, ${B}0, ${R}08)`;
          e.currentTarget.style.transform = "scale(1)";
        }}
        onClick={handleClick}
      >
        🔊
      </div>
    </div>
  );
}
