"use client";

import { BOTS, type BotId } from "../lib/data";
import { Icon } from "./Icon";

interface BotChatterProps {
  dialogues: Partial<Record<BotId, string>>;
  animKey: number;
}

export function BotChatter({ dialogues, animKey }: BotChatterProps) {
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--color-ink)",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon name="message-circle" size={16} />
        Bot Chatter
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BOTS.map((bot) => (
          <div key={bot.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div
              className="avatar"
              style={{ width: 28, height: 28, borderRadius: 8, background: bot.dim, color: bot.color }}
            >
              <Icon name={bot.icon} size={15} />
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
                style={{ fontSize: 12, color: "var(--color-ink)", lineHeight: 1.4, fontStyle: "italic", wordBreak: "break-word" }}
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
