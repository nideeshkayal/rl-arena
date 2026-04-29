"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Nav } from "../../../components/Nav";
import { Icon } from "../../../components/Icon";
import { BOTS, type BotId } from "../../../lib/data";

export default function SandboxSetupPage() {
  const router = useRouter();
  const [cash, setCash] = useState(10000);
  const [turns, setTurns] = useState(30);
  const [vol, setVol] = useState(1.0);
  const [bots, setBots] = useState<BotId[]>(BOTS.map((b) => b.id));

  const toggleBot = (id: BotId) => {
    setBots((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  const start = () => {
    const params = new URLSearchParams({
      mode: "sandbox",
      cash: String(cash),
      turns: String(turns),
      vol: String(vol),
      bots: bots.join(","),
    });
    router.push(`/play?${params.toString()}`);
  };

  return (
    <div className="page">
      <Nav />
      <div className="shell" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <Link href="/" style={{ color: "var(--color-ink-3)", fontSize: 13, fontWeight: 600, marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="arrow-left" size={14} /> Back
        </Link>
        <div className="eyebrow" style={{ color: "var(--color-gain)", marginBottom: 12 }}>
          Sandbox · custom setup
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
          Build your own arena.
        </h2>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 16px)", color: "var(--color-ink-3)", marginBottom: 32, maxWidth: 640, lineHeight: 1.55 }}>
          Tune the rules, pick your opponents, and see how each bot&apos;s strategy holds up under
          conditions you choose.
        </p>

        <div className="setup-sliders" style={{ marginBottom: 24 }}>
          <SliderCard
            label="Starting cash"
            value={`$${cash.toLocaleString()}`}
            min={1000}
            max={50000}
            step={1000}
            current={cash}
            onChange={setCash}
            tint="var(--color-primary)"
            icon="coins"
          />
          <SliderCard
            label="Total turns"
            value={`${turns} turns`}
            min={10}
            max={100}
            step={5}
            current={turns}
            onChange={setTurns}
            tint="var(--color-info)"
            icon="hourglass"
          />
          <SliderCard
            label="Market volatility"
            value={`${vol.toFixed(2)}× normal`}
            min={0.3}
            max={3}
            step={0.1}
            current={vol}
            onChange={setVol}
            tint="var(--color-loss)"
            icon="activity"
            help={vol < 0.7 ? "Calm market — slow grind." : vol < 1.4 ? "Normal market." : vol < 2.2 ? "Choppy market." : "Wild west — anything can happen."}
          />
          <div className="card" style={{ padding: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Estimated game length</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)" }}>
              ~{Math.round(turns * 0.15)} minutes
            </div>
            <div style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 4 }}>
              Roughly 9 seconds of thought per turn.
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Opponents — pick at least one</div>
          <div className="setup-bots">
            {BOTS.map((bot) => {
              const on = bots.includes(bot.id);
              return (
                <button
                  key={bot.id}
                  onClick={() => toggleBot(bot.id)}
                  style={{
                    background: on ? bot.dim : "var(--color-surface-2)",
                    border: on ? `2px solid ${bot.color}` : "1.5px solid var(--color-border)",
                    borderRadius: 12,
                    padding: 14,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s var(--ease-out)",
                    opacity: on ? 1 : 0.55,
                    color: "var(--color-ink)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: bot.color, display: "inline-flex" }}>
                      <Icon name={bot.icon} size={18} />
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700 }}>{bot.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: bot.color, fontWeight: 600 }}>{on ? "Active" : "Disabled"}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setCash(10000);
              setTurns(30);
              setVol(1);
              setBots(BOTS.map((b) => b.id));
            }}
            className="btn btn-secondary btn-md"
            style={{ fontSize: 13 }}
          >
            <Icon name="refresh" size={14} /> Reset
          </button>
          <button onClick={start} disabled={bots.length === 0} className="btn btn-primary btn-lg">
            Start Sandbox
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SliderCard({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
  tint,
  help,
  icon,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
  tint: string;
  help?: string;
  icon: "coins" | "hourglass" | "activity";
}) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ color: tint, display: "inline-flex" }}><Icon name={icon} size={16} /></span>
        <span className="eyebrow">{label}</span>
      </div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: tint, marginBottom: 10 }}>
        {value}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: tint }}
      />
      {help && <div style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 6 }}>{help}</div>}
    </div>
  );
}
