"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Nav } from "../../components/Nav";
import { Badge } from "../../components/Badge";
import { MiniChart } from "../../components/MiniChart";
import { BotChatter } from "../../components/BotChatter";
import { ASSETS, BOTS, getMode, type Action, type AssetId, type Bot, type BotId } from "../../lib/data";
import {
  createGame,
  leaderboard,
  setPrediction,
  step,
  tradeStats,
  useInsiderTip,
  type GameState,
  type LeaderboardEntry,
} from "../../lib/engine";
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
  const mode = useMemo(() => getMode(modeId), [modeId]);

  // Sandbox/duel overrides from URL.
  const cashOverride = Number(search.get("cash")) || undefined;
  const turnsOverride = Number(search.get("turns")) || undefined;
  const volOverride = Number(search.get("vol")) || undefined;
  const botsParam = search.get("bots");
  const duelBot = search.get("bot") as BotId | null;

  const overrideBots: BotId[] | undefined = duelBot
    ? [duelBot]
    : botsParam
    ? (botsParam.split(",").filter((b) => BOTS.some((bb) => bb.id === b)) as BotId[])
    : undefined;

  const initial = useMemo(
    () =>
      createGame({
        mode,
        startingCash: cashOverride,
        totalTurns: turnsOverride,
        volMultiplier: volOverride,
        bots: overrideBots,
      }),
    [mode, cashOverride, turnsOverride, volOverride, overrideBots?.join(",")]
  );

  const [game, setGame] = useState<GameState>(initial);
  const [selectedAsset, setSelectedAsset] = useState<AssetId>("TECHX");
  const [tradeQty, setTradeQty] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [openBot, setOpenBot] = useState<BotId | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoTimer = useRef<number | null>(null);

  useEffect(() => {
    setGame(initial);
    setSelectedAsset("TECHX");
    setTradeQty(1);
    setShowResults(false);
    setAnimKey(0);
    setAutoPlay(false);
  }, [initial]);

  const advance = useCallback(
    (action: Action) => {
      if (game.done) return;
      setGame((g) => step(g, { action, asset: selectedAsset, qty: tradeQty }));
      setAnimKey((k) => k + 1);
    },
    [game.done, selectedAsset, tradeQty]
  );

  // Auto-play loop.
  useEffect(() => {
    if (!autoPlay || game.done) {
      if (autoTimer.current) {
        window.clearTimeout(autoTimer.current);
        autoTimer.current = null;
      }
      return;
    }
    autoTimer.current = window.setTimeout(() => {
      advance("hold");
    }, 220);
    return () => {
      if (autoTimer.current) window.clearTimeout(autoTimer.current);
    };
  }, [autoPlay, game.turn, game.done, advance]);

  const lb = useMemo(() => leaderboard(game), [game]);
  const playerEntry = lb.find((e) => e.isPlayer)!;
  const playerReturn = playerEntry.return;
  const playerRank = playerEntry.rank;

  // Bot dialogues — taken from each bot's last action.
  const dialogues = useMemo(() => {
    const out: Partial<Record<BotId, string>> = {};
    for (const id of game.activeBots) {
      const bot = BOTS.find((b) => b.id === id)!;
      const last = game.bots[id].lastAction;
      if (!last) {
        out[id] = bot.dialogue[0];
        continue;
      }
      out[id] = pickByPersonality(id, last.action, last.asset);
    }
    return out;
  }, [game]);

  useEffect(() => {
    if (game.done) setShowResults(true);
  }, [game.done]);

  // Tip button.
  const tip = () => setGame((g) => useInsiderTip(g));

  // Prediction.
  const setGuess = (a: Action) => setGame((g) => setPrediction(g, a));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Nav
        rightSlot={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {mode.livesEnabled && <LivesIndicator lives={game.lives} max={mode.startingLives} />}
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
              {mode.name} · {game.knockedOut ? "Knocked out" : game.done ? "Game over" : "In progress"}
            </span>
          </div>
        }
      />

      {/* Turn progress + actions toolbar */}
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
              background: game.knockedOut ? "var(--color-loss)" : "var(--color-primary)",
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
        <button
          onClick={tip}
          disabled={game.tipsRemaining <= 0 || !!game.peekedEvent || game.done}
          title="Peek at the next event before it happens"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            background: game.tipsRemaining > 0 && !game.peekedEvent && !game.done ? "var(--color-primary-dim)" : "var(--color-surface-2)",
            color: game.tipsRemaining > 0 && !game.peekedEvent && !game.done ? "var(--color-primary-text)" : "var(--color-ink-4)",
            cursor: game.tipsRemaining > 0 && !game.peekedEvent && !game.done ? "pointer" : "not-allowed",
            transition: "all 0.15s var(--ease-out)",
          }}
        >
          🔮 Insider Tip · {game.tipsRemaining}
        </button>
        {!game.done && (
          <button
            onClick={() => setAutoPlay((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              background: autoPlay ? "var(--color-loss)" : "var(--color-ink)",
              color: "white",
            }}
          >
            {autoPlay ? "⏸ Stop" : "⏩ Auto-play"}
          </button>
        )}
        {game.done && <Badge color={game.knockedOut ? "var(--color-loss)" : "var(--color-gain)"} bg={game.knockedOut ? "var(--color-loss-dim)" : "var(--color-gain-dim)"}>{game.knockedOut ? "Knocked Out" : "Game Over"}</Badge>}
      </div>

      {/* Main grid */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 320px 280px",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
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
            {mode.livesEnabled && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
                  Peak
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--color-hold)" }}>
                  {fmt$(game.peakValue)}
                </div>
                <div style={{ fontSize: 10, color: "var(--color-ink-3)" }}>
                  -{(((game.peakValue - playerEntry.value) / game.peakValue) * 100).toFixed(1)}% drawdown
                </div>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                Portfolio history
              </div>
              <MiniChart data={game.player.valueHistory} width={220} height={42} showFill />
            </div>
          </div>

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
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: chg >= 0 ? "var(--color-gain)" : "var(--color-loss)" }}>
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
          <EventCard game={game} />

          {/* Prediction prompt (Duel only) */}
          {mode.prediction && !game.done && <PredictionPrompt game={game} setGuess={setGuess} />}

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

        {/* CENTER — Leaderboard + Holdings + Prediction stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ClickableLeaderboard entries={lb} turn={game.turn} totalTurns={game.totalTurns} onPickBot={setOpenBot} />

          {/* Prediction stats card (Duel only) */}
          {mode.prediction && (
            <div
              style={{
                background: "white",
                borderRadius: 14,
                border: "1px solid var(--color-border)",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)", marginBottom: 8 }}>
                🧠 Your Read
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "var(--color-primary)" }}>
                  {game.prediction.correct}/{game.prediction.total || 0}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-ink-3)" }}>correct</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-3)" }}>
                Bonus earned: <strong style={{ color: "var(--color-gain)", fontFamily: "var(--font-mono)" }}>{fmt$(game.prediction.reward)}</strong>
              </div>
              {game.prediction.lastCorrect !== null && (
                <div
                  className="fade-in"
                  key={animKey}
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    background: game.prediction.lastCorrect ? "var(--color-gain-dim)" : "var(--color-loss-dim)",
                    color: game.prediction.lastCorrect ? "var(--color-gain)" : "var(--color-loss)",
                    textAlign: "center",
                  }}
                >
                  {game.prediction.lastCorrect ? "✓ Correct! +$200" : "✗ Wrong. They surprised you."}
                </div>
              )}
            </div>
          )}

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

        {/* RIGHT — Bot chatter + RL hint */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BotChatterFiltered game={game} dialogues={dialogues} animKey={animKey} onPickBot={setOpenBot} />
          <div
            style={{
              background: "var(--color-bg-alt)",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              padding: "14px 16px",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: "var(--color-primary)", marginBottom: 8, letterSpacing: "0.03em" }}>
              ⚙️ Tap a bot
            </div>
            <p style={{ fontSize: 12, color: "var(--color-ink-2)", lineHeight: 1.6 }}>
              Click any bot in the leaderboard or chatter feed to see its policy weights and last decision in plain English.
            </p>
          </div>
        </div>
      </div>

      {showResults && game.done && (
        <ResultsModal game={game} onReplay={() => location.reload()} />
      )}

      {openBot && <BotDetailModal botId={openBot} game={game} onClose={() => setOpenBot(null)} />}
    </div>
  );
}

/* ─── COMPONENTS ───────────────────────────────────────── */

function LivesIndicator({ lives, max }: { lives: number; max: number }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: max }, (_, i) => {
        const alive = i < lives;
        return (
          <span
            key={i}
            style={{
              fontSize: 18,
              filter: alive ? "none" : "grayscale(1)",
              opacity: alive ? 1 : 0.3,
              transition: "all 0.3s var(--ease-out)",
            }}
          >
            ❤️
          </span>
        );
      })}
    </div>
  );
}

function EventCard({ game }: { game: GameState }) {
  if (game.peekedEvent) {
    return (
      <div
        className="fade-in"
        style={{
          background: "var(--color-primary-dim)",
          borderRadius: 12,
          border: "1.5px dashed var(--color-primary)",
          padding: "12px 16px",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 24, flexShrink: 0 }}>🔮</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-primary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
            Insider preview · next turn
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)", marginBottom: 3 }}>
            {game.peekedEvent.emoji} {game.peekedEvent.text}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-ink-2)" }}>{game.peekedEvent.desc}</div>
          <div style={{ fontSize: 11, color: "var(--color-primary-text)", marginTop: 6, fontStyle: "italic" }}>
            Trade now — this hits when you advance the turn.
          </div>
        </div>
      </div>
    );
  }
  if (game.event) {
    return (
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
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>
              {game.event.text}
            </span>
            {game.event.crash && <Badge color="var(--color-loss)" bg="var(--color-loss-dim)">CRASH</Badge>}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-ink-3)" }}>{game.event.desc}</div>
        </div>
      </div>
    );
  }
  if (game.turn === 0) {
    return (
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
    );
  }
  return (
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
  );
}

function PredictionPrompt({ game, setGuess }: { game: GameState; setGuess: (a: Action) => void }) {
  const opp = game.activeBots[0];
  const oppBot = BOTS.find((b) => b.id === opp);
  if (!oppBot) return null;
  const guess = game.prediction.guess;
  return (
    <div
      style={{
        background: oppBot.dim,
        borderRadius: 12,
        border: `1.5px solid ${oppBot.color}55`,
        padding: "14px 18px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: oppBot.color,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            🧠 Predict your opponent
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>
            What will {oppBot.name} do this turn?
          </div>
        </div>
        <span style={{ fontSize: 11, color: "var(--color-ink-3)" }}>
          {guess ? "✓ Locked in" : "Optional · +$200 if correct"}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {(["buy", "hold", "sell"] as Action[]).map((a) => {
          const sel = guess === a;
          const bg = a === "buy" ? "var(--color-gain)" : a === "sell" ? "var(--color-loss)" : "var(--color-hold)";
          return (
            <button
              key={a}
              onClick={() => setGuess(a)}
              style={{
                padding: "10px 0",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                background: sel ? bg : "white",
                color: sel ? "white" : "var(--color-ink-2)",
                border: sel ? "none" : "1.5px solid var(--color-border)",
                transition: "all 0.15s var(--ease-out)",
              }}
            >
              {a}
            </button>
          );
        })}
      </div>
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

function ClickableLeaderboard({
  entries,
  turn,
  totalTurns,
  onPickBot,
}: {
  entries: LeaderboardEntry[];
  turn: number;
  totalTurns: number;
  onPickBot: (id: BotId) => void;
}) {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden" }}>
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
      {entries.map((entry, i) => {
        const clickable = !entry.isPlayer;
        return (
          <div
            key={entry.id}
            onClick={() => clickable && onPickBot(entry.id as BotId)}
            style={{
              padding: "11px 16px",
              borderBottom: "1px solid var(--color-surface-2)",
              background: entry.isPlayer ? "var(--color-bg-alt)" : "white",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.3s var(--ease-spring)",
              cursor: clickable ? "pointer" : "default",
            }}
            onMouseEnter={(e) => {
              if (clickable) e.currentTarget.style.background = "var(--color-surface-2)";
            }}
            onMouseLeave={(e) => {
              if (clickable) e.currentTarget.style.background = "white";
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
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: entry.color, flexShrink: 0, boxShadow: `0 0 0 2px ${entry.color}33` }} />
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
              {clickable && <span style={{ fontSize: 10, color: "var(--color-ink-4)", marginLeft: 6 }}>ⓘ</span>}
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
        );
      })}
    </div>
  );
}

function BotChatterFiltered({
  game,
  dialogues,
  animKey,
  onPickBot,
}: {
  game: GameState;
  dialogues: Partial<Record<BotId, string>>;
  animKey: number;
  onPickBot: (id: BotId) => void;
}) {
  const activeBots = game.activeBots.map((id) => BOTS.find((b) => b.id === id)!).filter(Boolean);
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--color-border)", padding: "14px 16px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)", marginBottom: 12 }}>
        💬 Bot Chatter
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {activeBots.map((bot) => (
          <div
            key={bot.id}
            onClick={() => onPickBot(bot.id)}
            style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer" }}
          >
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
            <div style={{ background: bot.dim, borderRadius: "0 10px 10px 10px", padding: "7px 10px", flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: bot.color, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>
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

function BotDetailModal({ botId, game, onClose }: { botId: BotId; game: GameState; onClose: () => void }) {
  const bot = BOTS.find((b) => b.id === botId);
  if (!bot) return null;
  const state = game.bots[botId];
  const last = state?.lastAction;
  const policy = bot.policy;
  return (
    <div
      onClick={onClose}
      className="fade-in"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,14,23,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-up"
        style={{
          background: "white",
          borderRadius: 20,
          padding: 28,
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 16px 48px rgba(15,14,23,0.3)",
          border: `2px solid ${bot.color}`,
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: bot.dim,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: bot.color,
              fontWeight: 700,
            }}
          >
            {bot.icon}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--color-ink)" }}>
              {bot.name}
            </div>
            <div style={{ fontSize: 13, color: bot.color, fontWeight: 700 }}>{bot.role}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              fontSize: 18,
              color: "var(--color-ink-3)",
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            background: "var(--color-surface-2)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
            Reward function
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
            {bot.rewardFn}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Policy weights
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(policy).map(([k, v]) => (
              <PolicyBar key={k} label={k} value={v} color={bot.color} />
            ))}
          </div>
        </div>

        {last && (
          <div
            style={{
              background: bot.dim,
              borderRadius: 10,
              padding: "12px 14px",
              borderLeft: `4px solid ${bot.color}`,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: bot.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
              Last decision
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)", marginBottom: 4 }}>
              {last.action.toUpperCase()}{last.asset ? ` ${last.asset}` : ""}{last.qty > 0 ? ` × ${last.qty}` : ""}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-ink-2)", fontStyle: "italic" }}>
              &ldquo;{last.reasoning}&rdquo;
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PolicyBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-3)", textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--color-ink)" }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "var(--color-surface-2)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: 5, width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.4s var(--ease-out)" }} />
      </div>
    </div>
  );
}

function ResultsModal({ game, onReplay }: { game: GameState; onReplay: () => void }) {
  const lb = leaderboard(game);
  const player = lb.find((e) => e.isPlayer)!;
  const stats = tradeStats(game);
  const grade = GRADE_TABLE[Math.min(player.rank, GRADE_TABLE.length) - 1] || GRADE_TABLE[GRADE_TABLE.length - 1];
  const winner = lb[0];
  const winnerBot = BOTS.find((b) => b.id === winner.id);
  const isDuel = game.mode.id === "duel";
  const isSurvival = game.mode.id === "survival";
  const explainWinner = winnerBot
    ? `${winnerBot.name} won. Its reward function — "${winnerBot.rewardFn}" — pushed it toward the strategy that paid off this game.`
    : "You finished first. Your strategy outperformed every trained bot.";

  let title = "📊 Game over";
  if (game.knockedOut) title = "💀 Knocked out!";
  else if (player.rank === 1) title = "🥇 You won!";
  else if (player.rank <= 3) title = "🎯 Great game!";

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
          position: "relative",
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
        {player.rank === 1 && !game.knockedOut && <Confetti />}

        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          {game.mode.name} · {game.totalTurns} turns · Complete
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-ink)" }}>
            {title}
          </h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: player.return >= 0 ? "var(--color-gain)" : "var(--color-loss)" }}>
            {fmtPct(player.return)}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, marginBottom: 32 }}>
          {/* Podium */}
          <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-border)", padding: 24, boxShadow: "0 4px 16px rgba(15,14,23,0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "center", marginBottom: 20 }}>
              Final Standings
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, height: 130, marginBottom: 20 }}>
              {[lb[1], lb[0], lb[2]].filter(Boolean).map((entry, col) => {
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
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: i === 0 ? "var(--color-hold)" : "var(--color-ink-4)", width: 20 }}>{i + 1}</span>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: entry.isPlayer ? "var(--color-primary)" : "var(--color-ink)" }}>
                  {entry.name}
                  {entry.isPlayer && (
                    <span style={{ fontSize: 9, fontWeight: 700, background: "var(--color-primary-dim)", color: "var(--color-primary)", padding: "2px 5px", borderRadius: 4, marginLeft: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      YOU
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>{fmt$(entry.value)}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                background: game.knockedOut ? "var(--color-loss)" : "var(--color-primary)",
                borderRadius: 16,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                boxShadow: game.knockedOut ? "0 8px 32px rgba(244,63,94,0.25)" : "0 8px 32px rgba(61,59,243,0.25)",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 700, color: "white", lineHeight: 1 }}>
                {game.knockedOut ? "💀" : grade.label}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                  {game.knockedOut ? "Survival ended" : "Performance grade"}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
                  {game.knockedOut ? "You lost all 3 lives. The market won." : grade.desc}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                  Finished #{player.rank} out of {lb.length}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <StatCard icon="📈" bg="var(--color-gain-dim)" label="Final value" value={fmt$(player.value)} valueColor={player.return >= 0 ? "var(--color-gain)" : "var(--color-loss)"} />
              <StatCard icon="⚡" bg="var(--color-primary-dim)" label="Best trade" value={stats.best ? `${stats.best.asset} ${fmtPct(stats.best.pnl)}` : "—"} valueColor="var(--color-ink)" />
              <StatCard icon="📉" bg="var(--color-loss-dim)" label="Worst trade" value={stats.worst ? `${stats.worst.asset} ${fmtPct(stats.worst.pnl)}` : "—"} valueColor="var(--color-loss)" />
              <StatCard icon="🔄" bg="var(--color-hold-dim)" label="Total trades" value={`${stats.count}`} valueColor="var(--color-ink)" />
              {isDuel && (
                <StatCard
                  icon="🧠"
                  bg="var(--color-info-dim)"
                  label="Predictions"
                  value={`${game.prediction.correct}/${game.prediction.total} (${game.prediction.total ? Math.round((game.prediction.correct / game.prediction.total) * 100) : 0}%)`}
                  valueColor="var(--color-info)"
                />
              )}
              {isDuel && (
                <StatCard icon="💰" bg="var(--color-gain-dim)" label="Prediction $" value={fmt$(game.prediction.reward)} valueColor="var(--color-gain)" />
              )}
              {isSurvival && (
                <StatCard
                  icon="❤️"
                  bg="var(--color-loss-dim)"
                  label="Lives left"
                  value={`${Math.max(0, game.lives)} / ${game.mode.startingLives}`}
                  valueColor={game.lives > 0 ? "var(--color-gain)" : "var(--color-loss)"}
                />
              )}
            </div>

            <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--color-border)", padding: "16px 18px" }}>
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
            Try a different mode
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
            How were the bots rewarded? →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, bg, label, value, valueColor }: { icon: string; bg: string; label: string; value: string; valueColor: string }) {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--color-border)", padding: "16px 18px" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--color-ink-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {label}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: valueColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
