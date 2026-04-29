"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "../components/Nav";
import { Icon } from "../components/Icon";
import { BOTS, GAME_MODES } from "../lib/data";

export default function LandingPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string>("royale");

  const start = () => {
    const mode = GAME_MODES.find((m) => m.id === selectedMode)!;
    if (mode.customizable) router.push(`/setup/${mode.id}`);
    else router.push(`/play?mode=${mode.id}`);
  };

  return (
    <div className="page">
      <Nav />

      {/* Hero */}
      <section className="hero grain bg-grid">
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
          <Icon name="sparkles" size={13} />
          Five bots. Five reward functions. One arena.
        </div>
        <h1 className="slide-up" style={{ marginBottom: 20, animationDelay: "0.05s", maxWidth: "14ch" }}>
          Can you beat
          <br />
          <span style={{ color: "var(--color-primary)" }}>Reinforcement</span>
          <br />
          Learning?
        </h1>
        <p className="lede slide-up" style={{ marginBottom: 32, animationDelay: "0.1s" }}>
          Trade against AI bots — each trained for a different reward — across a live market simulation.
          The way you watch them play is the way you learn how RL actually thinks.
        </p>
        <div className="slide-up" style={{ display: "flex", gap: 12, flexWrap: "wrap", animationDelay: "0.15s" }}>
          <button onClick={start} className="btn btn-primary btn-lg">
            Enter the Arena
            <Icon name="arrow-right" size={16} />
          </button>
          <Link href="/learn" className="btn btn-secondary btn-lg">
            How it works
          </Link>
        </div>
      </section>

      {/* Game modes */}
      <section className="shell" style={{ paddingBottom: "clamp(40px, 6vw, 60px)" }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Choose your mode</div>
        <div className="mode-grid">
          {GAME_MODES.map((mode) => {
            const isSel = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                style={{
                  textAlign: "left",
                  background: isSel ? (mode.featured ? "var(--color-primary)" : "var(--color-ink)") : "white",
                  border: isSel ? "1px solid transparent" : "1px solid var(--color-border)",
                  borderRadius: 16,
                  padding: "20px 18px",
                  boxShadow: isSel ? "0 8px 32px rgba(61,59,243,0.22)" : "0 2px 8px rgba(15,14,23,0.05)",
                  transition: "all 0.2s var(--ease-out)",
                  transform: isSel ? "translateY(-3px)" : "none",
                  cursor: "pointer",
                  color: isSel ? "white" : "var(--color-ink)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: isSel ? "rgba(255,255,255,0.18)" : "var(--color-bg-alt)",
                    color: isSel ? "white" : "var(--color-primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon name={mode.icon} size={20} />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                  {mode.name}
                </div>
                <div style={{ fontSize: 12, opacity: isSel ? 0.75 : 0.6, marginBottom: 8, lineHeight: 1.45 }}>{mode.desc}</div>
                <div className="mono" style={{ fontSize: 11, fontWeight: 600, opacity: isSel ? 0.85 : 0.55 }}>
                  {mode.turns === 99 ? "∞" : mode.turns} turns
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={start} className="btn btn-ink btn-lg">
            Start {GAME_MODES.find((m) => m.id === selectedMode)?.name}
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </section>

      {/* Bot strip */}
      <section style={{ background: "white", borderTop: "1px solid var(--color-border)", padding: "32px var(--page-pad-x)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Your opponents</div>
          <div className="bot-strip">
            {BOTS.map((bot) => (
              <div
                key={bot.id}
                className="card card-hover"
                style={{
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--color-bg)",
                }}
              >
                <div
                  className="avatar"
                  style={{ width: 38, height: 38, borderRadius: 10, background: bot.dim, color: bot.color }}
                >
                  <Icon name={bot.icon} size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>{bot.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bot.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature row */}
      <section className="shell" style={{ paddingTop: "clamp(40px, 6vw, 60px)", paddingBottom: "clamp(64px, 8vw, 96px)" }}>
        <div className="feature-grid">
          {[
            { icon: "compass" as const, title: "Different rewards, different bots", desc: "Each opponent was 'trained' against a unique reward function. Same market, very different decisions." },
            { icon: "line-chart" as const, title: "A real-feel market", desc: "Three assets — TECHX, BANKR, CRYPTX — react to trend, volatility, and event shocks every turn." },
            { icon: "brain" as const, title: "Learn by playing", desc: "Each bot's reasoning is one click away. Why did SniperBot wait? Why is AdaptiveBot suddenly aggressive?" },
          ].map((f, i) => (
            <div key={i} className="card card-hover" style={{ padding: 22 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "var(--color-primary-dim)",
                  color: "var(--color-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Icon name={f.icon} size={20} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, marginBottom: 6, color: "var(--color-ink)" }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--color-ink-3)", lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
