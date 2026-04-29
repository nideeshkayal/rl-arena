"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Nav } from "../../../components/Nav";
import { Icon } from "../../../components/Icon";
import { BOTS, type BotId } from "../../../lib/data";

export default function DuelSetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<BotId | null>(null);
  const [hovered, setHovered] = useState<BotId | null>(null);

  const start = () => {
    if (!selected) return;
    router.push(`/play?mode=duel&bot=${selected}`);
  };

  return (
    <div className="page">
      <Nav />
      <div className="shell" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <Link
          href="/"
          style={{
            color: "var(--color-ink-3)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name="arrow-left" size={14} /> Back
        </Link>
        <div className="eyebrow" style={{ color: "var(--color-primary)", marginBottom: 12 }}>
          Quick Duel · 20 turns · Prediction mode
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--hero-2xl)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: "var(--color-ink)",
            marginBottom: 12,
          }}
        >
          Pick your opponent.
        </h2>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 16px)", color: "var(--color-ink-3)", maxWidth: 720, marginBottom: 14, lineHeight: 1.55 }}>
          Each turn you&apos;ll predict what they do — buy, hold, or sell — before they reveal it.
          A correct guess pays a <strong style={{ color: "var(--color-gain)" }}>$200 bonus</strong>. The
          better you understand their reward function, the easier it gets.
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--color-primary-dim)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "var(--color-primary-text)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 32,
          }}
        >
          <Icon name="lightbulb" size={16} />
          Read the bot&apos;s reward function before you pick. It tells you how they think.
        </div>

        <div className="setup-bots" style={{ marginBottom: 32 }}>
          {BOTS.map((bot) => {
            const isSel = selected === bot.id;
            const isHov = hovered === bot.id;
            return (
              <button
                key={bot.id}
                onClick={() => setSelected(bot.id)}
                onMouseEnter={() => setHovered(bot.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  textAlign: "left",
                  background: isSel ? bot.dim : "white",
                  border: isSel ? `2px solid ${bot.color}` : "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "20px 16px",
                  cursor: "pointer",
                  boxShadow: isSel
                    ? `0 8px 32px ${bot.color}33`
                    : isHov
                    ? "0 8px 24px rgba(15,14,23,0.10)"
                    : "0 2px 8px rgba(15,14,23,0.05)",
                  transform: isSel ? "translateY(-4px)" : isHov ? "translateY(-2px)" : "none",
                  transition: "all 0.25s var(--ease-out)",
                  color: "var(--color-ink)",
                }}
              >
                <div
                  className="avatar"
                  style={{
                    width: "100%",
                    height: 72,
                    background: bot.dim,
                    borderRadius: 12,
                    color: bot.color,
                    marginBottom: 14,
                  }}
                >
                  <Icon name={bot.icon} size={32} strokeWidth={1.5} />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--color-ink)", marginBottom: 4 }}>
                  {bot.name}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: bot.color, marginBottom: 8 }}>{bot.role}</div>
                <div style={{ fontSize: 12, color: "var(--color-ink-3)", lineHeight: 1.5, marginBottom: 12 }}>{bot.desc}</div>
                <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2, marginBottom: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      height: 4,
                      width: `${bot.risk}%`,
                      background: bot.color,
                      borderRadius: 2,
                      transition: "width 0.5s var(--ease-out)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>Risk</span>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: bot.color }}>
                    {bot.winRate}% win
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {selected && (() => {
          const bot = BOTS.find((b) => b.id === selected)!;
          return (
            <div
              className="fade-in"
              style={{
                background: bot.dim,
                border: `1.5px solid ${bot.color}55`,
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 32,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 20,
                alignItems: "flex-start",
              }}
            >
              <div
                className="avatar"
                style={{
                  width: 60,
                  height: 60,
                  background: "white",
                  borderRadius: 14,
                  color: bot.color,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Icon name={bot.icon} size={28} strokeWidth={1.6} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--color-ink)", marginBottom: 6 }}>
                  {bot.name} — Reward function
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-ink)",
                    background: "white",
                    padding: "6px 10px",
                    borderRadius: 6,
                    display: "inline-block",
                    marginBottom: 10,
                    border: `1px solid ${bot.color}33`,
                  }}
                >
                  {bot.rewardFn}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {bot.dialogue.slice(0, 4).map((q, i) => (
                    <span
                      key={i}
                      style={{
                        background: "white",
                        border: `1px solid ${bot.color}40`,
                        color: "var(--color-ink-2)",
                        padding: "4px 12px",
                        borderRadius: 9999,
                        fontSize: 12,
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;{q}&rdquo;
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <Link href="/learn" className="btn btn-secondary btn-md" style={{ fontSize: 13 }}>
            <Icon name="book" size={15} /> Read about reward functions
          </Link>
          <button onClick={start} disabled={!selected} className="btn btn-primary btn-lg">
            Start Duel
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
