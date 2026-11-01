"use client";

import { avatarFallbackUrl } from "./avatarFallback";

const B = "#1B365D";
const R = "#C8102E";
const G = "#D4AF37";

export default function PersonModal({
  image,
  badgeLabel,
  name,
  title,
  email,
  phone,
  bio,
  expertise,
  expertiseLbl,
  isMobile,
  isRtl,
}) {
  return (
                  <div style={{ direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        background: `linear-gradient(135deg,${B},#2a4a7a,#1a3060)`,
                        padding: isMobile ? "24px 18px 20px" : "32px 28px 24px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: -40,
                          left: -40,
                          width: 180,
                          height: 180,
                          borderRadius: "50%",
                          background: `${G}12`,
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          position: "relative",
                          flexShrink: 0,
                          zIndex: 2,
                        }}
                      >
                        <div
                          style={{
                            width: isMobile ? 100 : 150,
                            height: isMobile ? 100 : 150,
                            borderRadius: 16,
                            overflow: "hidden",
                            border: `4px solid ${G}`,
                            boxShadow: `0 8px 32px rgba(0,0,0,0.4),0 0 0 2px ${G}50`,
                            animation: "glow-gold 3s ease-in-out infinite",
                          }}
                        >
                          <img
                            src={image || "/president.png"}
                            alt={name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "top",
                              animation: "float-avatar 4s ease-in-out infinite",
                            }}
                            onError={(e) => {
                              e.currentTarget.src = avatarFallbackUrl(name);
                            }}
                          />
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: -8,
                            right: -8,
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: R,
                            border: "3px solid #fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            color: "#fff",
                            fontWeight: 900,
                          }}
                        >
                          ✓
                        </div>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          [isRtl ? "marginRight" : "marginLeft"]: isMobile
                            ? 14
                            : 20,
                          zIndex: 2,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: G,
                            background: `${G}20`,
                            border: `1px solid ${G}40`,
                            padding: "3px 10px",
                            borderRadius: 20,
                            display: "inline-block",
                            marginBottom: 8,
                          }}
                        >
                          {badgeLabel}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 15 : 20,
                            fontWeight: 900,
                            color: "#fff",
                            lineHeight: 1.3,
                            marginBottom: 6,
                          }}
                        >
                          {name}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 11 : 12,
                            color: "rgba(255,255,255,0.75)",
                            lineHeight: 1.6,
                            marginBottom: 10,
                          }}
                        >
                          {title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 11,
                              color: "rgba(255,255,255,0.8)",
                            }}
                          >
                            <span>📧</span>
                            <span style={{ direction: "ltr" }}>{email}</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 11,
                              color: "rgba(255,255,255,0.8)",
                            }}
                          >
                            <span>📞</span>
                            <span style={{ direction: "ltr" }}>{phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ padding: isMobile ? "18px 16px" : "24px 28px" }}
                    >
                      <p
                        style={{
                          color: "#475569",
                          fontSize: isMobile ? 13 : 14,
                          lineHeight: 2,
                          marginBottom: 18,
                          background: "#F8FAFC",
                          padding: "14px 16px",
                          borderRadius: 12,
                          border: `1px solid ${B}10`,
                          [isRtl ? "borderRight" : "borderLeft"]:
                            `3px solid ${B}`,
                        }}
                      >
                        {bio}
                      </p>
                      <div
                        style={{
                          background: "linear-gradient(135deg,#fef9ee,#fff8e6)",
                          borderRadius: 14,
                          border: `1px solid ${G}35`,
                          padding: "16px 18px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: B,
                            marginBottom: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 7,
                              background: G,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                            }}
                          >
                            🎓
                          </span>
                          {expertiseLbl}
                        </div>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 7 }}
                        >
                          {expertise.map((exp, i) => (
                            <span
                              key={i}
                              style={{
                                background: "#fff",
                                padding: "7px 14px",
                                borderRadius: 20,
                                border: `1.5px solid ${G}50`,
                                fontSize: 12,
                                fontWeight: 700,
                                color: B,
                                transition: "all 0.2s",
                                cursor: "default",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${G}15`;
                                e.currentTarget.style.borderColor = G;
                                e.currentTarget.style.transform = "scale(1.05)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fff";
                                e.currentTarget.style.borderColor = `${G}50`;
                                e.currentTarget.style.transform = "";
                              }}
                            >
                              ✓ {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
  );
}
