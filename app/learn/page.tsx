"use client";

import Link from "next/link";
import { useState } from "react";
import { Nav } from "../../components/Nav";
import { Icon } from "../../components/Icon";
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

      <div className="learn-content">
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
          <Icon name="book" size={13} /> Reinforcement Learning, in plain English
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
          <div className="rl-loop-grid">
            {[
              { step: "1. Observe", iconName: "eye" as const, desc: "Agent sees the market state — prices, trends, recent volatility, its own holdings.", color: "var(--color-primary)" },
              { step: "2. Act", iconName: "crosshair" as const, desc: "It picks BUY, SELL, or HOLD on an asset. The choice depends on its policy.", color: "var(--color-info)" },
              { step: "3. Reward", iconName: "gem" as const, desc: "The market moves. The agent gets a reward — positive, negative, or zero.", color: "var(--color-gain)" },
              { step: "4. Update", iconName: "brain" as const, desc: "The agent nudges its policy toward actions that paid off. Over millions of turns, a strategy emerges.", color: "var(--color-sniper, #8B5CF6)" },
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
                <div style={{ marginBottom: 10, color: s.color, display: "inline-flex" }}><Icon name={s.iconName} size={28} /></div>
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
                className="reward-card-grid"
                style={{
                  background: "white",
                  borderRadius: 16,
                  border: `1px solid var(--color-border)`,
                  borderLeft: `4px solid ${bot.color}`,
                  padding: "20px 24px",
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
                  <Icon name={bot.icon} size={28} />
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
            <Icon name="key" size={14} /> The big idea
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
          <div className="concepts-grid">
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

        {/* Interactive Reward Simulator */}
        <RewardSimulator />

        {/* Deep dive FAQ */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            <Icon name="telescope" size={13} /> Deep dive
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Common questions about RL
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-ink-3)", marginBottom: 20, maxWidth: 640 }}>
            Click any question to expand the answer.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Accordion title="How is RL different from supervised learning?" icon="git-branch">
              In supervised learning, you give the model labeled examples: &ldquo;this image is a cat.&rdquo;
              In RL, there are no labels. The agent takes actions in an environment, receives rewards
              (or penalties), and figures out what works through trial and error. Think of it like
              learning to ride a bike vs. studying a textbook about bikes.
            </Accordion>
            <Accordion title="What is a policy, and why does it matter?" icon="workflow">
              A policy is the agent&apos;s decision-making function. Given the current state (prices,
              holdings, trends), the policy outputs an action (buy, sell, hold). In RL Arena, each
              bot&apos;s policy is defined by weights like aggression, patience, and risk tolerance.
              Two bots with different policies will make completely different decisions in the same market.
            </Accordion>
            <Accordion title="What is the exploration-exploitation tradeoff?" icon="compass">
              Should an agent exploit what it already knows works, or explore new strategies that might
              be better? ChaosBot has high noise (60%) — it explores constantly, sometimes stumbling on
              genius moves. SniperBot has low noise (2%) — it exploits a refined strategy. Real-world
              RL systems must balance both.
            </Accordion>
            <Accordion title="Can RL agents learn to game their own reward?" icon="alert-triangle">
              Yes — this is called reward hacking. If you reward only raw returns, you get YOLOBot:
              an agent that takes maximum risk because that&apos;s how it maximizes expected reward.
              It&apos;s technically optimal under its reward function, but not what a human designer
              would consider &ldquo;good&rdquo; trading. Designing reward functions is an open research problem.
            </Accordion>
            <Accordion title="What is multi-agent RL?" icon="network">
              When multiple agents interact in the same environment, each agent&apos;s optimal strategy
              depends on what the others do. AdaptiveBot demonstrates this: its reward is based on
              leaderboard rank, so it watches other agents and adjusts. This creates complex game-theoretic
              dynamics that single-agent RL can&apos;t capture.
            </Accordion>
            <Accordion title="How does this game relate to real-world RL?" icon="cpu">
              Real trading firms use RL for portfolio optimization, execution, and hedging. The core
              loop is the same: observe market state, take an action, get a reward signal, update
              the strategy. RL Arena simplifies the math but preserves the key ideas: policy design,
              reward shaping, partial observability, and multi-agent dynamics.
            </Accordion>
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
          <div style={{ marginBottom: 8, color: "var(--color-primary)", display: "inline-flex" }}><Icon name="gamepad" size={30} /></div>
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
            Enter the Arena
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
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ height: 6, background: "var(--color-surface-2)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
        <div style={{ height: 6, width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.4s var(--ease-out)" }} />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>{pct}%</div>
    </div>
  );
}

function RewardSimulator() {
  const [aggression, setAggression] = useState(0.5);
  const [patience, setPatience] = useState(0.5);
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [noise, setNoise] = useState(0.1);

  const profile = aggression > 0.7 && riskTolerance > 0.7
    ? { name: "YOLOBot-like", color: "#F97316", desc: "High aggression + high risk = all-in momentum trader. Huge swings." }
    : patience > 0.7 && noise < 0.15
    ? { name: "SniperBot-like", color: "#8B5CF6", desc: "Patient and precise. Waits for high-confidence entries." }
    : noise > 0.4
    ? { name: "ChaosBot-like", color: "#F43F5E", desc: "High noise = unpredictable. Sometimes genius, sometimes disaster." }
    : aggression < 0.35 && riskTolerance < 0.4
    ? { name: "SafeBot-like", color: "#14B8A6", desc: "Conservative. Protects capital, avoids volatility." }
    : { name: "AdaptiveBot-like", color: "#6366F1", desc: "Balanced profile. Would adapt strategy based on competition." };

  return (
    <section style={{
      background: "white", borderRadius: 20, border: "1px solid var(--color-border)",
      padding: 32, marginBottom: 32, boxShadow: "0 2px 8px rgba(15,14,23,0.04)",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
        <Icon name="sliders" size={13} /> Interactive
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
        Build your own bot personality
      </h3>
      <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginBottom: 24, maxWidth: 560, lineHeight: 1.55 }}>
        Drag the sliders to shape a policy. Watch how the predicted personality changes — this is how reward functions shape behavior.
      </p>

      <div className="concepts-grid" style={{ marginBottom: 24 }}>
        <SimSlider label="Aggression" value={aggression} onChange={setAggression} color="var(--color-loss)"
          help="How much cash the bot commits per trade" />
        <SimSlider label="Patience" value={patience} onChange={setPatience} color="#8B5CF6"
          help="How long the bot waits for a good setup" />
        <SimSlider label="Risk Tolerance" value={riskTolerance} onChange={setRiskTolerance} color="#F97316"
          help="How much volatility the bot accepts" />
        <SimSlider label="Noise (Exploration)" value={noise} onChange={setNoise} color="#F43F5E"
          help="Probability of random action — exploration rate" />
      </div>

      <div style={{
        background: profile.color + "11", border: `2px solid ${profile.color}44`,
        borderRadius: 14, padding: "18px 22px",
        transition: "all 0.3s var(--ease-out)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: profile.color + "22",
            display: "flex", alignItems: "center", justifyContent: "center", color: profile.color,
          }}>
            <Icon name="brain" size={20} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: profile.color }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-ink-3)" }}>Predicted personality</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-ink-2)", lineHeight: 1.55 }}>{profile.desc}</p>
      </div>
    </section>
  );
}

function SimSlider({ label, value, onChange, color, help }: {
  label: string; value: number; onChange: (v: number) => void; color: string; help: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--color-border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <input type="range" min={0} max={100} value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        style={{ width: "100%", accentColor: color }} />
      <div style={{ fontSize: 11, color: "var(--color-ink-4)", marginTop: 4 }}>{help}</div>
    </div>
  );
}

function Accordion({ title, icon, children }: {
  title: string; icon: "git-branch" | "workflow" | "compass" | "alert-triangle" | "network" | "cpu";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "white", borderRadius: 14, border: "1px solid var(--color-border)",
      overflow: "hidden", transition: "all 0.2s var(--ease-out)",
      boxShadow: open ? "0 4px 16px rgba(15,14,23,0.08)" : "0 2px 8px rgba(15,14,23,0.04)",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
        textAlign: "left", cursor: "pointer", background: "transparent",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: open ? "var(--color-primary-dim)" : "var(--color-surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "var(--color-primary)" : "var(--color-ink-3)",
          transition: "all 0.2s var(--ease-out)", flexShrink: 0,
        }}>
          <Icon name={icon} size={16} />
        </div>
        <span style={{ flex: 1, fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700,
          color: open ? "var(--color-primary)" : "var(--color-ink)" }}>
          {title}
        </span>
        <span style={{
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s var(--ease-out)", display: "inline-flex",
          color: "var(--color-ink-4)",
        }}>
          <Icon name="chevron-right" size={16} />
        </span>
      </button>
      {open && (
        <div className="fade-in" style={{
          padding: "0 20px 18px 64px", fontSize: 14, color: "var(--color-ink-2)", lineHeight: 1.65,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

