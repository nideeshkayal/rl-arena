"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Nav } from "../../components/Nav";
import { Badge } from "../../components/Badge";
import { MiniChart } from "../../components/MiniChart";
import { Leaderboard } from "../../components/Leaderboard";
import { BotChatter } from "../../components/BotChatter";
import { ASSETS, BOTS, GAME_MODES, type Action, type AssetId, type BotId } from "../../lib/data";
import { createGame, leaderboard, step, tradeStats, type GameState } from "../../lib/engine";
import { fmt$, fmtPct } from "../../lib/format";

const GRADE_TABLE = [
  { rank: 1, label: "A+", desc: "Legendary. You humbled the machines." },
  { rank: 2, label: "A",  desc: "Elite performance. Very close to first." },
  { rank: 3, label: "B+", desc: "Strong showing. Beat most bots." },
  { rank: 4, label: "B",  desc: "Decent. The market taught you a lesson." },
  { rank: 5, label: "C",  desc: "Rough game. Study the RL strategies." },
  { rank: 6, label: "D",  desc: "Even ChaosBot had a plan." },
];

export function PlayClient() {
  const search = useSearchParams();
  const modeId = search.get("mode") || "royale";
  const mode = GAME_MODES.find((m) => m.id === modeId) || GAME_MODES[1];

  const initial = useMemo(
    () =>
      createGame({
        totalTurns: mode.turns,
        startingCash: 10000,
        volMultiplier: mode.id === "survival" ? 1.4 : 1,
        survival: mode.id === "survival",
      }),
    [mode.id, mode.turns]
  );

  const [game, setGame] = useState<GameState>(initial);
  const [selectedAsset, setSelectedAsset] = useState<AssetId>("TECHX");
  const [tradeQty, setTradeQty] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Reset whenever mode changes
  useEffect(() => {
    setGame(initial);
    setSelectedAsset("TECHX");
    setTradeQty(1);
    setShowResults(false);
    setAnimKey(0);
  }, [initial]);

  const advance = useCallback(
    (action: Action) => {
      if (game.done) return;
      setGame((g) => step(g, { action, asset: selectedAsset, qty: tradeQty }));
      setAnimKey((k) => k + 1);
    },
    [game.done, selectedAsset, tradeQty]
  );

  const lb = useMemo(() => leaderboard(game), [game]);
  const playerEntry = lb.find((e) => e.isPlayer)!;
  const playerReturn = playerEntry.return;
  const playerRank = playerEntry.rank;

  // Build dialogues map from each bot's last action reasoning
  const dialogues = useMemo(() => {
    const out: Partial<Record<BotId, string>> = {};
    for (const bot of BOTS) {
      const last = game.bots[bot.id].lastAction;
      if (!last) {
        out[bot.id] = bot.dialogue[0];
        continue;
      }
      // Match dialogue style to action
      if (last.action === "buy" && last.asset) {
        out[bot.id] = pickByPersonality(bot.id, "buy", last.asset);
      } else if (last.action === "sell" && last.asset) {
        out[bot.id] = pickByPersonality(bot.id, "sell", last.asset);
      } else {
        out[bot.id] = pickByPersonality(bot.id, "hold", null);
      }
    }
    return out;
  }, [game]);

  // Open results modal once game ends
  useEffect(() => {
    if (game.done) setShowResults(true);
  }, [game.done]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Nav
        rightSlot={
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-ink-3)",
              background: "var(--color-surface-2)",
              padding: "4px 10px",
              borderRadius: 6,
            }}
          >
            {mode.name} · {game.done ? "Game over" : "In progress"}
          </span>
        }
      />

      {/* Turn progress */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid var(--color-border)",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ flex: 1, height: 4, background: "var(--color-border)", borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              height: 4,
              background: "var(--color-primary)",
              borderRadius: 2,
              transition: "width 0.5s var(--ease-out)",
              width: `${(game.turn / game.totalTurns) * 100}%`,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--color-ink-3)",
            whiteSpace: "nowrap",
          }}
        >
          Turn {game.turn} / {game.totalTurns}
        </span>
        {game.done && <Badge color="var(--color-gain)" bg="var(--color-gain-dim)">Game Over</Badge>}
      </div>

      {/* Main grid */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 300px 280px",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {/* Portfolio summary */}
          <div
            style={{
              background: "white",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              padding: "16px 20px",
              display: "flex",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
                Portfolio Value
              </div>
              <div
                key={animKey}
                className="count-up"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--color-ink)",
                  letterSpacing: "-0.02em",
                }}
              >
                {fmt$(playerEntry.value)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
                Return
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: playerReturn >= 0 ? "var(--color-gain)" : "var(--color-loss)",
                }}
              >
                {fmtPct(playerReturn)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
                Rank
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--color-ink)" }}>
                #{playerRank}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                Portfolio history
              </div>
              <MiniChart data={game.player.valueHistory} width={220} height={42} showFill />
            </div>
          </div>

          {/* Asset cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {ASSETS.map((asset) => {
              const hist = game.history[asset.id];
              const chg = hist.length > 1 ? (hist[hist.length - 1] - hist[hist.length - 2]) / hist[hist.length - 2] : 0;
              const isSel = selectedAsset === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset.id)}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    border: isSel ? `2px solid ${asset.color}` : "1px solid var(--color-border)",
                    padding: "12px 14px",
                    cursor: "pointer",
                    transition: "all 0.15s var(--ease-out)",
                    boxShadow: isSel ? `0 4px 16px ${asset.color}22` : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: asset.color }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>
                        {asset.id}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        fontWeight: 700,
                        color: chg >= 0 ? "var(--color-gain)" : "var(--color-loss)",
                      }}
                    >
                      {fmtPct(chg)}
                    </span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--color-ink)", marginBottom: 8 }}>
                    {fmt$(game.prices[asset.id])}
                  </div>
                  <MiniChart data={game.history[asset.id]} color={asset.color} width={140} height={40} showFill />
                </div>
              );
            })}
          </div>

          {/* Event card */}
          {game.event ? (
            <div
              key={`evt-${game.turn}`}
              className="fade-in"
              style={{
                background: "white",
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                borderLeft: `3px solid ${game.event.color}`,
                padding: "12px 16px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{game.event.emoji}</span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)", marginBottom: 3 }}>
                  {game.event.text}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-ink-3)" }}>{game.event.desc}</div>
              </div>
            </div>
          ) : game.turn > 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                padding: "12px 16px",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 18 }}>😶</span>
              <div style={{ fontSize: 13, color: "var(--color-ink-4)", fontStyle: "italic" }}>
                Quiet turn. No major market events.
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "var(--color-primary-dim)",
                borderRadius: 12,
                border: "1px solid #C0BFEE",
                padding: "12px 16px",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 18 }}>👋</span>
              <div style={{ fontSize: 13, color: "var(--color-primary-text)", fontWeight: 600 }}>
                Game on. Pick an asset, set a quantity, then BUY / HOLD / SELL to advance.
              </div>
            </div>
          )}

          {/* Trade panel */}
          <div
            style={{
              background: "white",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--color-ink)",
                marginBottom: 14,
              }}
            >
              Your Move — Turn {Math.min(game.turn + 1, game.totalTurns)}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset.id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    background: selectedAsset === asset.id ? asset.color : "var(--color-surface-2)",
                    color: selectedAsset === asset.id ? "white" : "var(--color-ink-3)",
                    transition: "all 0.15s var(--ease-out)",
                  }}
                >
                  {asset.id}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                  Quantity
                </div>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-border)", borderRadius: 8, overflow: "hidden" }}>
                  <button
                    onClick={() => setTradeQty((q) => Math.max(1, q - 1))}
                    style={{ padding: "8px 12px", fontSize: 16, color: "var(--color-ink-3)", background: "var(--color-surface-2)", borderRight: "1px solid var(--color-border)" }}
                  >
                    −
                  </button>
                  <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "var(--color-ink)" }}>
                    {tradeQty}
                  </div>
                  <button
                    onClick={() => setTradeQty((q) => q + 1)}
                    style={{ padding: "8px 12px", fontSize: 16, color: "var(--color-ink-3)", background: "var(--color-surface-2)", borderLeft: "1px solid var(--color-border)" }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                  You hold
                </div>
                <div
                  style={{
                    background: "var(--color-surface-2)",
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--color-ink)",
                    textAlign: "center",
                  }}
                >
                  {game.player.holdings[selectedAsset] || 0}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-ink-3)", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
              <span>
                Cost:{" "}
                <strong style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                  {fmt$(game.prices[selectedAsset] * tradeQty)}
                </strong>
              </span>
              <span>
                Cash:{" "}
                <strong style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                  {fmt$(game.player.cash)}
                </strong>
              </span>
            </div>
            {!game.done ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <ActionButton variant="buy" onClick={() => advance("buy")}>BUY</ActionButton>
                <ActionButton variant="hold" onClick={() => advance("hold")}>HOLD</ActionButton>
                <ActionButton variant="sell" onClick={() => advance("sell")}>SELL</ActionButton>
              </div>
            ) : (
              <button
                onClick={() => setShowResults(true)}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  background: "var(--color-primary)",
                  color: "white",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 16px rgba(61,59,243,0.3)",
                }}
              >
                View Results →
              </button>
            )}
          </div>
        </div>

        {/* CENTER — Leaderboard + Holdings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Leaderboard entries={lb} turn={game.turn} totalTurns={game.totalTurns} />
          <div
            style={{
              background: "white",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              padding: "14px 16px",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)", marginBottom: 12 }}>
              Your Holdings
            </div>
            {ASSETS.map((asset) => (
              <div key={asset.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: asset.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, flex: 1, color: "var(--color-ink)" }}>
                  {asset.id}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--color-ink-3)" }}>
                  {game.player.holdings[asset.id] || 0} sh
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>
                  {fmt$((game.player.holdings[asset.id] || 0) * game.prices[asset.id])}
                </span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "var(--color-ink-4)", fontWeight: 600 }}>Cash</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>
                {fmt$(game.player.cash)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — Bot chatter + RL info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BotChatter dialogues={dialogues} animKey={animKey} />
          <div
            style={{
              background: "var(--color-bg-alt)",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              padding: "14px 16px",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: "var(--color-primary)", marginBottom: 8, letterSpacing: "0.03em" }}>
              ⚙️ RL in plain English
            </div>
            <p style={{ fontSize: 12, color: "var(--color-ink-2)", lineHeight: 1.6 }}>
              Each bot picks the action with the highest <em>expected reward</em> given its trained reward function. Same market, same turn — different decisions. That&apos;s RL.
            </p>
            <Link
              href="/learn"
              style={{
                display: "inline-block",
                marginTop: 8,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-primary)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Read more →
            </Link>
          </div>
        </div>
      </div>

      {showResults && game.done && (
        <ResultsModal game={game} onReplay={() => location.reload()} />
      )}
    </div>
  );
}

function ActionButton({ variant, onClick, children }: { variant: "buy" | "sell" | "hold"; onClick: () => void; children: React.ReactNode }) {
  const colors = {
    buy: { bg: "var(--color-gain)", color: "white" },
    sell: { bg: "var(--color-loss)", color: "white" },
    hold: { bg: "var(--color-hold-dim)", color: "#B45309" },
  }[variant];
  return (
    <button
      onClick={onClick}
      style={{
        padding: "11px 0",
        background: colors.bg,
        color: colors.color,
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        transition: "all 0.15s var(--ease-out)",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
    >
      {children}
    </button>
  );
}

function ResultsModal({ game, onReplay }: { game: GameState; onReplay: () => void }) {
  const lb = leaderboard(game);
  const player = lb.find((e) => e.isPlayer)!;
  const stats = tradeStats(game);
  const grade = GRADE_TABLE[player.rank - 1] || GRADE_TABLE[GRADE_TABLE.length - 1];
  const winner = lb[0];
  const winnerBot = BOTS.find((b) => b.id === winner.id);
  const explainWinner = winnerBot
    ? `${winnerBot.name} won. Its reward function — "${winnerBot.rewardFn}" — pushed it toward the strategy that paid off this game.`
    : "You finished first. Your strategy outperformed every trained bot — beautiful work.";

  return (
    <div
      className="fade-in"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,14,23,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        overflow: "auto",
      }}
    >
      <div
        className="slide-up"
        style={{
          background: "var(--color-bg)",
          borderRadius: 24,
          padding: "40px 48px",
          maxWidth: 1080,
          width: "100%",
          boxShadow: "0 16px 48px rgba(15,14,23,0.3)",
          maxHeight: "92vh",
          overflow: "auto",
        }}
      >
        {/* Confetti for winner */}
        {player.rank === 1 && <Confetti />}

        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-ink-4)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {game.totalTurns} turns · Complete
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
            }}
          >
            {player.rank === 1 ? "🥇 You won!" : player.rank <= 3 ? "🎯 Great game!" : "📊 Game over"}
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              fontWeight: 700,
              color: player.return >= 0 ? "var(--color-gain)" : "var(--color-loss)",
            }}
          >
            {fmtPct(player.return)}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, marginBottom: 32 }}>
          {/* Podium */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              border: "1px solid var(--color-border)",
              padding: 24,
              boxShadow: "0 4px 16px rgba(15,14,23,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--color-ink-4)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Final Standings
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, height: 130, marginBottom: 20 }}>
              {[lb[1], lb[0], lb[2]].map((entry, col) => {
                if (!entry) return null;
                const heights = [82, 116, 64];
                const labels = ["2nd", "1st", "3rd"];
                return (
                  <div key={entry.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)" }}>{labels[col]}</div>
                    <div
                      style={{
                        width: 56,
                        borderRadius: "8px 8px 0 0",
                        background: entry.isPlayer ? "var(--color-primary-dim)" : entry.color + "33",
                        border: entry.isPlayer ? "2px solid var(--color-primary)" : `2px solid ${entry.color}66`,
                        height: heights[col],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        color: entry.color,
                        fontWeight: 700,
                        transformOrigin: "bottom",
                        animation: `podiumRise 0.6s var(--ease-spring) ${col * 0.1}s both`,
                      }}
                    >
                      {entry.icon}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-ink)", textAlign: "center", maxWidth: 56 }}>
                      {entry.isPlayer ? "You" : entry.name.replace("Bot", "")}
                    </div>
                  </div>
                );
              })}
            </div>
            {lb.map((entry, i) => (
              <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--color-surface-2)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: i === 0 ? "var(--color-hold)" : "var(--color-ink-4)", width: 20 }}>
                  {i + 1}
                </span>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: entry.isPlayer ? "var(--color-primary)" : "var(--color-ink)" }}>
                  {entry.name}
                  {entry.isPlayer && (
                    <span style={{ fontSize: 9, fontWeight: 700, background: "var(--color-primary-dim)", color: "var(--color-primary)", padding: "2px 5px", borderRadius: 4, marginLeft: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      YOU
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>
                  {fmt$(entry.value)}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                background: "var(--color-primary)",
                borderRadius: 16,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                boxShadow: "0 8px 32px rgba(61,59,243,0.25)",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 700, color: "white", lineHeight: 1 }}>
                {grade.label}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                  Performance Grade
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{grade.desc}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                  Finished #{player.rank} out of {lb.length}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <StatCard icon="📈" bg="var(--color-gain-dim)" label="Final Value" value={fmt$(player.value)} valueColor={player.return >= 0 ? "var(--color-gain)" : "var(--color-loss)"} />
              <StatCard icon="⚡" bg="var(--color-primary-dim)" label="Best Trade" value={stats.best ? `${stats.best.asset} ${fmtPct(stats.best.pnl)}` : "—"} valueColor="var(--color-ink)" />
              <StatCard icon="📉" bg="var(--color-loss-dim)" label="Worst Trade" value={stats.worst ? `${stats.worst.asset} ${fmtPct(stats.worst.pnl)}` : "—"} valueColor="var(--color-loss)" />
              <StatCard icon="🔄" bg="var(--color-hold-dim)" label="Total Trades" value={`${stats.count} trades`} valueColor="var(--color-ink)" />
            </div>

            <div
              style={{
                background: "white",
                borderRadius: 14,
                border: "1px solid var(--color-border)",
                padding: "16px 18px",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)", marginBottom: 8 }}>
                Why did {winner.name} win?
              </div>
              <p style={{ fontSize: 13, color: "var(--color-ink-2)", lineHeight: 1.6 }}>{explainWinner}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onReplay}
            style={{
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
            Play Again
          </button>
          <Link
            href="/"
            style={{
              background: "white",
              color: "var(--color-ink)",
              padding: "14px 24px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              border: "1.5px solid var(--color-border)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Back to Home
          </Link>
          <Link
            href="/learn"
            style={{
              background: "var(--color-ink)",
              color: "white",
              padding: "14px 24px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Learn how each bot was rewarded →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, bg, label, value, valueColor }: { icon: string; bg: string; label: string; value: string; valueColor: string }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        padding: "16px 18px",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--color-ink-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {label}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 18,
              fontWeight: 700,
              color: valueColor,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => i);
  const colors = ["#3D3BF3", "#10B981", "#F59E0B", "#F97316", "#8B5CF6", "#F43F5E"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: 24 }}>
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const dur = 2 + Math.random() * 1.5;
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 6;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: -20,
              left: `${left}%`,
              width: size,
              height: size * 1.6,
              background: color,
              borderRadius: 2,
              animation: `confetti ${dur}s linear ${delay}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Picks a dialogue line that fits the bot's personality + last action. */
function pickByPersonality(botId: BotId, action: Action, asset: AssetId | null): string {
  const lines: Record<BotId, Record<Action, string[]>> = {
    safe: {
      buy: ["Buying the dip on " + (asset || "BANKR") + ".", "Adding to position. Carefully.", "Yes — value here."],
      sell: ["Locking gains on " + (asset || "TECHX") + ".", "Trimming risk.", "Profit taken. Good enough."],
      hold: ["Cash is a position too.", "I prefer not losing.", "Patience.", "No edge. Holding."],
    },
    yolo: {
      buy: ["ALL IN ON " + (asset || "CRYPTX") + " 🚀", "MORE.", "BUY THE TOP. WHY NOT.", "DIAMOND HANDS."],
      sell: ["DUMPING " + (asset || "TECHX") + ".", "CASHING OUT BABY.", "TAKING THE WIN."],
      hold: ["Boring. Boring.", "Hold? Fine. For now.", "Where's the volatility???"],
    },
    sniper: {
      buy: ["Entry confirmed: " + (asset || "TECHX") + ".", "Locked on.", "Trigger pulled."],
      sell: ["Target hit on " + (asset || "TECHX") + ". Exiting.", "Take profit.", "Mission complete."],
      hold: ["Watching.", "Not yet.", "Patience is the edge.", "Soon."],
    },
    chaos: {
      buy: ["Flipped a coin. Buying " + (asset || "CRYPTX") + ".", "Why not.", "The vibes said yes."],
      sell: ["Selling " + (asset || "TECHX") + " on a hunch.", "Vibes shifted. Out.", "Eh, why not."],
      hold: ["No one knows anything.", "I do what I want.", "Chaos is a ladder."],
    },
    adaptive: {
      buy: ["Increasing exposure to " + (asset || "TECHX") + " — closing the gap.", "Adapting upward.", "Catching up."],
      sell: ["Trimming " + (asset || "TECHX") + " — protecting lead.", "Locking my edge.", "Defensive trim."],
      hold: ["Holding position. Steady rank.", "I learn. I adapt.", "Watching the leaderboard."],
    },
  };
  const pool = lines[botId][action];
  return pool[Math.floor(Math.random() * pool.length)];
}
