"use client";

import Link from "next/link";
import { Nav } from "../../components/Nav";
import { BOTS } from "../../lib/data";

export default function LearnPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav
        rightSlot={
          <Link
            href="/play"
            style={{
              background: "var(--color-primary)",
              color: "white",
              padding: "8px 18px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Enter Arena
          </Link>
        }
      />

      <div style={{ padding: "56px 80px 80px", maxWidth: 980, margin: "0 auto", width: "100%" }}>
        <div
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
            marginBottom: 20,
          }}
        >
          📚 Reinforcement Learning, in plain English
        </div>
        <h1
          className="slide-up"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          Same market.
          <br />
          <span style={{ color: "var(--color-primary)" }}>Different rewards.</span>
          <br />
          Different bots.
        </h1>
        <p style={{ fontSize: 18, color: "var(--color-ink-3)", lineHeight: 1.6, maxWidth: 640, marginBottom: 48 }}>
          Reinforcement Learning is how agents learn to act by being rewarded for good outcomes
          and punished for bad ones. Change the reward, and you change the bot — even if the
          environment stays exactly the same.
        </p>

        {/* RL loop diagram */}
        <section
          style={{
            background: "white",
            borderRadius: 20,
            border: "1px solid var(--color-border)",
            padding: 32,
            marginBottom: 32,
            boxShadow: "0 2px 8px rgba(15,14,23,0.04)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-ink-4)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            The RL loop
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
            Observe → Act → Receive reward → Update
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { step: "1. Observe", icon: "👁️", desc: "Agent sees the market state — prices, trends, recent volatility, its own holdings.", color: "var(--color-primary)" },
              { step: "2. Act", icon: "🎯", desc: "It picks BUY, SELL, or HOLD on an asset. The choice depends on its policy.", color: "var(--color-info)" },
              { step: "3. Reward", icon: "💎", desc: "The market moves. The agent gets a reward — positive, negative, or zero.", color: "var(--color-gain)" },
              { step: "4. Update", icon: "🧠", desc: "The agent nudges its policy toward actions that paid off. Over millions of turns, a strategy emerges.", color: "var(--color-sniper, #8B5CF6)" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "var(--color-bg)",
                  borderRadius: 14,
                  padding: 18,
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.color,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {s.step}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-ink-2)", lineHeight: 1.55 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Reward functions */}
        <section style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-ink-4)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            The five reward functions
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Each bot was rewarded differently — and it shows
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-ink-3)", marginBottom: 24, maxWidth: 640 }}>
            These are the (simplified) reward functions each bot was &ldquo;trained&rdquo; on. Read them like a wishlist:
            whatever you reward an agent for, that&apos;s what it will optimize for — sometimes in surprising ways.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            {BOTS.map((bot) => (
              <div
                key={bot.id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  border: `1px solid var(--color-border)`,
                  borderLeft: `4px solid ${bot.color}`,
                  padding: "20px 24px",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: 20,
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(15,14,23,0.04)",
                  transition: "all 0.2s var(--ease-out)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 24px ${bot.color}22`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,14,23,0.04)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: bot.dim,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    color: bot.color,
                    fontWeight: 700,
                  }}
                >
                  {bot.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--color-ink)" }}>
                      {bot.name}
                    </span>
                    <span style={{ fontSize: 12, color: bot.color, fontWeight: 700 }}>{bot.role}</span>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-ink)",
                      background: "var(--color-surface-2)",
                      padding: "6px 10px",
                      borderRadius: 6,
                      display: "inline-block",
                      marginBottom: 8,
                    }}
                  >
                    {bot.rewardFn}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--color-ink-2)", lineHeight: 1.55 }}>
                    Behavior: {bot.desc}
                  </p>
                </div>
                <PolicyDial label="aggression" value={bot.policy.aggression} color={bot.color} />
              </div>
            ))}
          </div>
        </section>

        {/* Key insight callout */}
        <section
          style={{
            background: "var(--color-ink)",
            color: "white",
            borderRadius: 20,
            padding: 32,
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(15,14,23,0.18)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            🔑 The big idea
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
            The reward function is the soul of an RL agent.
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 720 }}>
            Want a cautious bot? Penalize drawdowns. Want a competitive one? Reward beating others.
            Want a gambler? Train it under heavy noise. The architecture, the data, the algorithm —
            all of it bends to whatever you tell the agent is &ldquo;good.&rdquo; This is also why reward
            design is hard: agents will exploit the letter of the reward, not its spirit.
          </p>
        </section>

        {/* Concepts */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>
            RL concepts hiding in this game
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { title: "Policy", body: "A function from state → action. Each bot's `policy` weights (aggression, patience, riskTolerance…) define how it scores each possible move." },
              { title: "Exploration vs exploitation", body: "ChaosBot has high `noise` — it explores. SniperBot has high `patience` — it exploits only when confident." },
              { title: "Multi-agent RL", body: "AdaptiveBot's reward depends on the leaderboard — other agents are part of its environment. That's a real research area." },
              { title: "Reward hacking", body: "If you only reward absolute return, you get YOLOBot. The bot found a shortcut: max risk. Watch out for what you wish for." },
              { title: "Partial observability", body: "Bots can't see the future. They estimate it from price history — exactly like real RL agents in real markets." },
              { title: "Off-policy inference", body: "We don't train live — we ship policy weights and run them at inference. That's how production RL ships." },
            ].map((c, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 14,
                  border: "1px solid var(--color-border)",
                  padding: 18,
                  boxShadow: "0 2px 8px rgba(15,14,23,0.04)",
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--color-primary)", marginBottom: 6 }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-ink-2)", lineHeight: 1.55 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: "white",
            borderRadius: 20,
            border: "1px solid var(--color-border)",
            padding: 32,
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(15,14,23,0.06)",
          }}
        >
          <div style={{ fontSize: 30, marginBottom: 8 }}>🎮</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Now go test it
          </h3>
          <p style={{ fontSize: 15, color: "var(--color-ink-3)", marginBottom: 20 }}>
            Reading about RL is fine. Watching five differently-rewarded agents live in the same market is better.
          </p>
          <Link
            href="/play"
            style={{
              display: "inline-block",
              background: "var(--color-primary)",
              color: "white",
              padding: "14px 32px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow: "0 4px 16px rgba(61,59,243,0.3)",
            }}
          >
            Enter the Arena →
          </Link>
        </section>
      </div>
    </div>
  );
}

function PolicyDial({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ width: 110, textAlign: "right" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--color-ink-4)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ height: 6, background: "var(--color-surface-2)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
        <div style={{ height: 6, width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.4s var(--ease-out)" }} />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>{pct}%</div>
    </div>
  );
}
