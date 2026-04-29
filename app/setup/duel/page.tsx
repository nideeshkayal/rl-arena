"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Nav } from "../../../components/Nav";
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />
      <div style={{ padding: "48px 80px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
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
          ← Back
        </Link>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-primary)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Quick Duel · 20 turns · Prediction mode
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-ink)", marginBottom: 8 }}>
          Pick your opponent
        </h2>
        <p style={{ fontSize: 16, color: "var(--color-ink-3)", marginBottom: 16, maxWidth: 720 }}>
          Each turn, you&apos;ll predict what they&apos;re going to do — BUY, SELL, or HOLD —
          before they reveal it. Correct guesses earn a <strong style={{ color: "var(--color-gain)" }}>$200 bonus</strong>.
          The better you understand their reward function, the easier it gets.
        </p>
        <div
          style={{
            background: "var(--color-primary-dim)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "var(--color-primary-text)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 32,
            display: "inline-block",
          }}
        >
          💡 Tip: read the bot&apos;s reward function before you pick — it tells you how they think.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 32 }}>
          {BOTS.map((bot) => {
            const isSel = selected === bot.id;
            const isHov = hovered === bot.id;
            return (
              <div
                key={bot.id}
                onClick={() => setSelected(bot.id)}
                onMouseEnter={() => setHovered(bot.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
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
                }}
              >
                <div
                  style={{
                    height: 72,
                    background: bot.dim,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    color: bot.color,
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  {bot.icon}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--color-ink)", marginBottom: 4 }}>
                  {bot.name}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: bot.color, marginBottom: 8 }}>{bot.role}</div>
                <div style={{ fontSize: 12, color: "var(--color-ink-3)", lineHeight: 1.5, marginBottom: 12 }}>{bot.desc}</div>
                <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2, marginBottom: 4, overflow: "hidden" }}>
                  <div style={{ height: 4, width: `${bot.risk}%`, background: bot.color, borderRadius: 2, transition: "width 0.5s var(--ease-out)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--color-ink-4)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Risk
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: bot.color }}>
                    {bot.winRate}% win
                  </span>
                </div>
              </div>
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
                display: "flex",
                gap: 20,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  width: 60,
                  height: 60,
                  background: "white",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  flexShrink: 0,
                  color: bot.color,
                  fontWeight: 700,
                }}
              >
                {bot.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--color-ink)", marginBottom: 6 }}>
                  {bot.name} — Reward function
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
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

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Link
            href="/learn"
            style={{
              background: "white",
              color: "var(--color-ink)",
              padding: "14px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              border: "1.5px solid var(--color-border)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Read about reward functions
          </Link>
          <button
            onClick={start}
            disabled={!selected}
            style={{
              background: selected ? "var(--color-primary)" : "var(--color-surface-2)",
              color: selected ? "white" : "var(--color-ink-4)",
              padding: "14px 36px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow: selected ? "0 4px 16px rgba(61,59,243,0.3)" : "none",
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            Start Duel →
          </button>
        </div>
      </div>
    </div>
  );
}
