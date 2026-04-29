"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "../components/Nav";
import { BOTS, GAME_MODES } from "../lib/data";

export default function LandingPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string>("royale");

  const start = () => {
    const mode = GAME_MODES.find((m) => m.id === selectedMode)!;
    if (mode.customizable) {
      router.push(`/setup/${mode.id}`);
    } else {
      router.push(`/play?mode=${mode.id}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />

      {/* Hero */}
      <section style={{ padding: "72px 80px 56px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div
          className="fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--color-primary-dim)",
            color: "var(--color-primary)",
            padding: "6px 14px",
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          ⚡ Now live — Arena Royale season 3
        </div>
        <h1
          className="slide-up"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: "var(--color-ink)",
            maxWidth: 760,
            marginBottom: 20,
            animationDelay: "0.05s",
          }}
        >
          Can you beat
          <br />
          <span style={{ color: "var(--color-primary)" }}>Reinforcement</span>
          <br />
          Learning?
        </h1>
        <p
          className="slide-up"
          style={{
            fontSize: 18,
            color: "var(--color-ink-3)",
            lineHeight: 1.6,
            maxWidth: 540,
            marginBottom: 40,
            animationDelay: "0.1s",
          }}
        >
          Trade against 5 AI bots, each trained with a different reward function.
          Learn how RL agents think — by beating them.
        </p>
        <div className="slide-up" style={{ display: "flex", gap: 12, animationDelay: "0.15s" }}>
          <button
            onClick={start}
            style={{
              background: "var(--color-primary)",
              color: "white",
              padding: "14px 32px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow: "0 4px 16px rgba(61,59,243,0.3)",
              transition: "transform 0.15s var(--ease-out)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            Enter the Arena →
          </button>
          <Link
            href="/learn"
            style={{
              background: "white",
              color: "var(--color-ink)",
              padding: "14px 24px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              border: "1.5px solid var(--color-border)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            How It Works
          </Link>
        </div>
      </section>

      {/* Game Modes */}
      <section style={{ padding: "0 80px 56px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-ink-4)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Choose your mode
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {GAME_MODES.map((mode) => {
            const isSel = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                style={{
                  background: isSel ? (mode.featured ? "var(--color-primary)" : "var(--color-ink)") : "white",
                  border: isSel ? "none" : "1px solid var(--color-border)",
                  borderRadius: 16,
                  padding: "20px 18px",
                  cursor: "pointer",
                  boxShadow: isSel ? "0 8px 32px rgba(61,59,243,0.25)" : "0 2px 8px rgba(15,14,23,0.05)",
                  transition: "all 0.2s var(--ease-out)",
                  transform: isSel ? "translateY(-3px)" : "none",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 10 }}>{mode.icon}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: isSel ? "white" : "var(--color-ink)", marginBottom: 4 }}>
                  {mode.name}
                </div>
                <div style={{ fontSize: 12, color: isSel ? "rgba(255,255,255,0.7)" : "var(--color-ink-4)", marginBottom: 8, lineHeight: 1.4 }}>
                  {mode.desc}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: isSel ? "rgba(255,255,255,0.8)" : "var(--color-ink-3)" }}>
                  {mode.turns === 99 ? "∞" : mode.turns} turns
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={start}
            style={{
              background: "var(--color-ink)",
              color: "white",
              padding: "12px 28px",
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow: "0 4px 16px rgba(15,14,23,0.2)",
            }}
          >
            Start {GAME_MODES.find((m) => m.id === selectedMode)?.name} →
          </button>
        </div>
      </section>

      {/* Bot preview strip */}
      <section style={{ background: "white", borderTop: "1px solid var(--color-border)", padding: "32px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-ink-4)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Your opponents
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {BOTS.map((bot) => (
              <div
                key={bot.id}
                style={{
                  flex: 1,
                  background: "var(--color-bg)",
                  borderRadius: 12,
                  padding: 14,
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.2s var(--ease-out)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 20px ${bot.color}33`;
                  e.currentTarget.style.borderColor = bot.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: bot.dim,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                    color: bot.color,
                  }}
                >
                  {bot.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>
                    {bot.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2 }}>{bot.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer features */}
      <section style={{ padding: "48px 80px 80px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "🎯", title: "Different rewards, different bots", desc: "Each bot was 'trained' with a unique reward function. SafeBot fears drawdowns. YOLOBot lives for upside. AdaptiveBot only cares about beating you." },
            { icon: "📈", title: "A real-feel market", desc: "3 assets — TECHX, BANKR, CRYPTX. Trend, volatility, and event shocks combine to move prices each turn." },
            { icon: "🧠", title: "Learn by playing", desc: "Read each bot's reasoning after every trade. Why did SniperBot wait? Why is AdaptiveBot suddenly aggressive?" },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 16,
                border: "1px solid var(--color-border)",
                padding: 20,
                boxShadow: "0 2px 8px rgba(15,14,23,0.05)",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--color-ink)" }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-ink-3)", lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
