"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Nav } from "../../../components/Nav";
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />
      <div style={{ padding: "48px 80px", maxWidth: 980, margin: "0 auto", width: "100%" }}>
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
            color: "var(--color-gain)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Sandbox · custom setup
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-ink)", marginBottom: 8 }}>
          Build your own arena
        </h2>
        <p style={{ fontSize: 16, color: "var(--color-ink-3)", marginBottom: 32, maxWidth: 640 }}>
          Tune the rules and pick your opponents. See how each bot&apos;s strategy holds up under
          conditions you choose.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <SliderCard
            label="Starting cash"
            value={`$${cash.toLocaleString()}`}
            min={1000}
            max={50000}
            step={1000}
            current={cash}
            onChange={setCash}
            tint="var(--color-primary)"
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
            help={vol < 0.7 ? "Calm market — slow grind." : vol < 1.4 ? "Normal market." : vol < 2.2 ? "Choppy market." : "Wild west — anything can happen."}
          />
          <div
            style={{
              background: "white",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              padding: 18,
              boxShadow: "0 2px 8px rgba(15,14,23,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-ink-4)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Estimated game length
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--color-ink)" }}>
              ~{Math.round(turns * 0.15)} minutes
            </div>
            <div style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 4 }}>
              Roughly 9 seconds of thought per turn.
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 14,
            border: "1px solid var(--color-border)",
            padding: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-ink-4)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Opponents — pick at least 1
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
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
                    opacity: on ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18, color: bot.color, fontWeight: 700 }}>{bot.icon}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700 }}>{bot.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: bot.color, fontWeight: 600 }}>{on ? "Active" : "Disabled"}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={() => {
              setCash(10000);
              setTurns(30);
              setVol(1);
              setBots(BOTS.map((b) => b.id));
            }}
            style={{
              background: "white",
              color: "var(--color-ink)",
              padding: "14px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              border: "1.5px solid var(--color-border)",
            }}
          >
            Reset
          </button>
          <button
            onClick={start}
            disabled={bots.length === 0}
            style={{
              background: bots.length > 0 ? "var(--color-primary)" : "var(--color-surface-2)",
              color: bots.length > 0 ? "white" : "var(--color-ink-4)",
              padding: "14px 36px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow: bots.length > 0 ? "0 4px 16px rgba(61,59,243,0.3)" : "none",
              cursor: bots.length > 0 ? "pointer" : "not-allowed",
            }}
          >
            Start Sandbox →
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
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        padding: 18,
        boxShadow: "0 2px 8px rgba(15,14,23,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--color-ink-4)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: tint, marginBottom: 10 }}>
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
