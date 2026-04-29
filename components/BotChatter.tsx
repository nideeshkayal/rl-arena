"use client";

import { BOTS, type BotId } from "../lib/data";

interface BotChatterProps {
  dialogues: Partial<Record<BotId, string>>;
  animKey: number;
}

export function BotChatter({ dialogues, animKey }: BotChatterProps) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--color-ink)",
          marginBottom: 12,
        }}
      >
        💬 Bot Chatter
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BOTS.map((bot) => (
          <div key={bot.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: bot.dim,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
                color: bot.color,
                fontWeight: 700,
              }}
            >
              {bot.icon}
            </div>
            <div
              style={{
                background: bot.dim,
                borderRadius: "0 10px 10px 10px",
                padding: "7px 10px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: bot.color,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                {bot.name}
              </div>
              <div
                key={animKey}
                className="fade-in"
                style={{
                  fontSize: 12,
                  color: "var(--color-ink)",
                  lineHeight: 1.4,
                  fontStyle: "italic",
                  wordBreak: "break-word",
                }}
              >
                &ldquo;{dialogues[bot.id] || bot.dialogue[0]}&rdquo;
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
