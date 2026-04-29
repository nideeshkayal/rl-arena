"use client";

import { fmt$, fmtPct } from "../lib/format";
import type { LeaderboardEntry } from "../lib/engine";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  turn: number;
  totalTurns: number;
}

export function Leaderboard({ entries, turn, totalTurns }: LeaderboardProps) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>
          🏆 Leaderboard
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-ink-3)",
            background: "var(--color-surface-2)",
            padding: "3px 8px",
            borderRadius: 6,
          }}
        >
          Turn {turn}/{totalTurns}
        </span>
      </div>
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          style={{
            padding: "11px 16px",
            borderBottom: "1px solid var(--color-surface-2)",
            background: entry.isPlayer ? "var(--color-bg-alt)" : "white",
            display: "flex",
            alignItems: "center",
            gap: 10,
            transition: "all 0.3s var(--ease-spring)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 700,
              color: i === 0 ? "var(--color-hold)" : "var(--color-ink-4)",
              width: 18,
              textAlign: "center",
            }}
          >
            {i === 0 ? "🥇" : entry.rank}
          </span>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: entry.color,
              flexShrink: 0,
              boxShadow: `0 0 0 2px ${entry.color}33`,
            }}
          />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
            {entry.name}
            {entry.isPlayer && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  background: "var(--color-primary-dim)",
                  color: "var(--color-primary)",
                  padding: "2px 5px",
                  borderRadius: 4,
                  marginLeft: 5,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                YOU
              </span>
            )}
          </span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>
              {fmt$(entry.value)}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 600,
                color: entry.return >= 0 ? "var(--color-gain)" : "var(--color-loss)",
              }}
            >
              {fmtPct(entry.return)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
