import {
  ASSETS,
  BOTS,
  CRASH_EVENTS,
  EVENTS,
  type Action,
  type Asset,
  type AssetId,
  type Bot,
  type BotId,
  type MarketEvent,
  type ModeConfig,
} from "./data";

/** Linear-congruential RNG so games are reproducible from a given seed. */
function rng(seedRef: { v: number }) {
  return () => {
    seedRef.v = (seedRef.v * 9301 + 49297) % 233280;
    return seedRef.v / 233280;
  };
}

export interface Portfolio {
  cash: number;
  holdings: Record<AssetId, number>;
}

export interface BotState extends Portfolio {
  value: number;
  valueHistory: number[];
  lastAction: { action: Action; asset: AssetId | null; qty: number; reasoning: string } | null;
}

export interface PlayerTrade {
  turn: number;
  action: Action;
  asset: AssetId;
  qty: number;
  price: number;
  pnl?: number;
}

export interface Prediction {
  /** Player's guess for the opponent's next action. null = not yet committed. */
  guess: Action | null;
  /** Result of the most recent committed prediction. null = not resolved. */
  lastCorrect: boolean | null;
  /** Total correct predictions so far. */
  correct: number;
  /** Total predictions made. */
  total: number;
  /** Total reward earned from predictions. */
  reward: number;
}

export interface GameState {
  mode: ModeConfig;
  turn: number;
  totalTurns: number;
  prices: Record<AssetId, number>;
  history: Record<AssetId, number[]>;
  player: Portfolio & { valueHistory: number[]; trades: PlayerTrade[] };
  bots: Record<BotId, BotState>;
  /** Bot ids active in this game (subset of all bots). */
  activeBots: BotId[];
  event: MarketEvent | null;
  done: boolean;
  /** True if the player ran out of lives. */
  knockedOut: boolean;
  /** Volatility multiplier (mode-driven, with sandbox override). */
  volMultiplier: number;
  /** Lives remaining. -1 means "lives disabled". */
  lives: number;
  /** Highest portfolio value reached this game (used for drawdown). */
  peakValue: number;
  /** Insider tip uses remaining. */
  tipsRemaining: number;
  /** If non-null, the player has peeked the next event — engine commits this on next step(). */
  peekedEvent: MarketEvent | null;
  /** Whether the next step's bot decisions are pre-committed (used for prediction reveal). */
  prediction: Prediction;
  /** Index into the cycle of crash events for survival mode. */
  crashCursor: number;
  rngState: { v: number };
  startingCash: number;
}

export function emptyHoldings(): Record<AssetId, number> {
  return ASSETS.reduce((acc, a) => ({ ...acc, [a.id]: 0 }), {} as Record<AssetId, number>);
}

export function startingPrices(): Record<AssetId, number> {
  return ASSETS.reduce((acc, a) => ({ ...acc, [a.id]: a.startPrice }), {} as Record<AssetId, number>);
}

export interface GameInitOptions {
  mode: ModeConfig;
  startingCash?: number;
  /** Override the mode's volatility multiplier (sandbox). */
  volMultiplier?: number;
  /** Override the mode's turn count (sandbox). */
  totalTurns?: number;
  /** Override the active bots (duel/sandbox). */
  bots?: BotId[];
  seed?: number;
}

export function createGame(opts: GameInitOptions): GameState {
  const { mode } = opts;
  const startingCash = opts.startingCash ?? 10000;
  const volMultiplier = opts.volMultiplier ?? mode.volMultiplier;
  const totalTurns = opts.totalTurns ?? mode.turns;
  const seed = opts.seed ?? Math.floor(Math.random() * 1e9);
  const rngState = { v: seed % 233280 || 1 };
  const requested = opts.bots && opts.bots.length > 0 ? opts.bots : (mode.bots.length > 0 ? mode.bots : BOTS.map((b) => b.id));
  const activeBots = requested.filter((id) => BOTS.some((b) => b.id === id));
  const bots: Record<BotId, BotState> = {} as Record<BotId, BotState>;
  for (const id of activeBots) {
    bots[id] = {
      cash: startingCash,
      holdings: emptyHoldings(),
      value: startingCash,
      valueHistory: [startingCash],
      lastAction: null,
    };
  }
  const prices = startingPrices();
  const history: Record<AssetId, number[]> = ASSETS.reduce(
    (acc, a) => ({ ...acc, [a.id]: [a.startPrice] }),
    {} as Record<AssetId, number[]>
  );
  return {
    mode,
    turn: 0,
    totalTurns,
    prices,
    history,
    player: { cash: startingCash, holdings: emptyHoldings(), valueHistory: [startingCash], trades: [] },
    bots,
    activeBots,
    event: null,
    done: false,
    knockedOut: false,
    volMultiplier,
    lives: mode.livesEnabled ? mode.startingLives : -1,
    peakValue: startingCash,
    tipsRemaining: mode.insiderTips,
    peekedEvent: null,
    prediction: { guess: null, lastCorrect: null, correct: 0, total: 0, reward: 0 },
    crashCursor: 0,
    rngState,
    startingCash,
  };
}

export function portfolioValue(p: Portfolio, prices: Record<AssetId, number>): number {
  let v = p.cash;
  for (const a of ASSETS) v += (p.holdings[a.id] || 0) * prices[a.id];
  return v;
}

function trendOf(history: number[], window = 4): number {
  if (history.length < 2) return 0;
  const w = Math.min(window, history.length - 1);
  const old = history[history.length - 1 - w];
  const cur = history[history.length - 1];
  if (!old) return 0;
  return (cur - old) / old;
}

function volOf(history: number[], window = 5): number {
  if (history.length < 3) return 0;
  const slice = history.slice(-window - 1);
  const rets: number[] = [];
  for (let i = 1; i < slice.length; i++) rets.push((slice[i] - slice[i - 1]) / slice[i - 1]);
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const v = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / rets.length;
  return Math.sqrt(v);
}

export interface BotDecision {
  action: Action;
  asset: AssetId | null;
  qty: number;
  reasoning: string;
}

interface DecideContext {
  state: GameState;
  bot: Bot;
  rng: () => number;
  rank: number;
  totalAgents: number;
}

export function decideBot(ctx: DecideContext): BotDecision {
  const { state, bot, rng, rank, totalAgents } = ctx;
  const policy = bot.policy;
  const myState = state.bots[bot.id];

  const features = ASSETS.map((asset) => {
    const trend = trendOf(state.history[asset.id], 4);
    const vol = volOf(state.history[asset.id], 5);
    const eventBoost = state.event && (state.event.asset === asset.id || state.event.asset === "ALL") ? state.event.impact : 0;
    return { asset, trend, vol, eventBoost };
  });

  const candidates: { action: Action; asset: AssetId | null; score: number; reason: string }[] = [];

  const rankFraction = (rank - 1) / Math.max(1, totalAgents - 1);
  const adaptBoost = (rankFraction - 0.5) * 2 * policy.adaptiveness;

  for (const f of features) {
    const signal = f.trend * (0.5 + policy.trendBias) + f.eventBoost * (0.6 + policy.trendBias * 0.5);
    const volPenalty = Math.max(0, f.vol - policy.riskTolerance * 0.05);

    const buyScore =
      signal * 12
      - volPenalty * 8
      + (1 - policy.patience) * 0.05
      + adaptBoost * 0.4
      + (rng() - 0.5) * policy.noise * 1.2;
    candidates.push({
      action: "buy",
      asset: f.asset.id,
      score: buyScore,
      reason: buyScore > 0 ? `${f.asset.id} trend +${(f.trend * 100).toFixed(1)}% — buying.` : `${f.asset.id} signal weak.`,
    });

    const owned = myState.holdings[f.asset.id] || 0;
    if (owned > 0) {
      const unrealized = (state.prices[f.asset.id] - state.history[f.asset.id][0]) / state.history[f.asset.id][0];
      const sellScore =
        -signal * 10
        + volPenalty * 6
        + Math.max(0, unrealized) * policy.sellDiscipline * 8
        + (rng() - 0.5) * policy.noise * 1.2;
      candidates.push({
        action: "sell",
        asset: f.asset.id,
        score: sellScore,
        reason: sellScore > 0 ? `Locking gains on ${f.asset.id}.` : `Holding ${f.asset.id}.`,
      });
    }
  }

  const holdScore = policy.patience * 0.6 + (rng() - 0.5) * policy.noise;
  candidates.push({ action: "hold", asset: null, score: holdScore, reason: "Sitting this one out." });

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];

  let qty = 0;
  if (top.action === "buy" && top.asset) {
    const price = state.prices[top.asset];
    const cashFraction = policy.aggression * (0.4 + rng() * 0.4);
    qty = Math.floor((myState.cash * cashFraction) / price);
    if (qty <= 0) {
      return { action: "hold", asset: null, qty: 0, reasoning: "Out of cash. Holding." };
    }
  } else if (top.action === "sell" && top.asset) {
    const owned = myState.holdings[top.asset] || 0;
    qty = Math.max(1, Math.ceil(owned * (0.4 + policy.sellDiscipline * 0.6)));
    qty = Math.min(qty, owned);
  }

  return { action: top.action, asset: top.asset, qty, reasoning: top.reason };
}

export interface PlayerAction {
  action: Action;
  asset: AssetId;
  qty: number;
}

/**
 * Sample what the next market event WOULD be without consuming the rng.
 * Used by the insider-tip feature: we draw the event, store it, and reuse it on step().
 */
export function previewEvent(state: GameState): MarketEvent | null {
  const probe = { v: state.rngState.v };
  const r = rng(probe);
  return rollEvent(state, r);
}

function rollEvent(state: GameState, random: () => number): MarketEvent | null {
  const nextTurn = state.turn + 1;
  // Survival: scheduled crash on every Nth turn
  if (state.mode.crashEveryNTurns > 0 && nextTurn > 0 && nextTurn % state.mode.crashEveryNTurns === 0) {
    const idx = Math.floor(random() * CRASH_EVENTS.length);
    return CRASH_EVENTS[idx];
  }
  const pool = state.mode.id === "survival" ? EVENTS.concat(EVENTS.filter((e) => e && e.impact < 0)) : EVENTS;
  return pool[Math.floor(random() * pool.length)] || null;
}

/** Spend an insider tip — pre-roll the event, store it on state. */
export function useInsiderTip(state: GameState): GameState {
  if (state.tipsRemaining <= 0 || state.peekedEvent || state.done) return state;
  const ns: GameState = { ...state };
  // Use a probe so peeking is "free" — we don't advance state's rng yet.
  const probe = { v: state.rngState.v };
  const random = rng(probe);
  ns.peekedEvent = rollEvent(state, random);
  ns.tipsRemaining = state.tipsRemaining - 1;
  return ns;
}

/** Set the player's prediction guess for the duel. */
export function setPrediction(state: GameState, guess: Action | null): GameState {
  return { ...state, prediction: { ...state.prediction, guess } };
}

/** Runs one full turn. */
export function step(state: GameState, playerAction: PlayerAction): GameState {
  if (state.done) return state;
  const ns: GameState = JSON.parse(JSON.stringify(state));
  ns.rngState = state.rngState; // share reference
  const random = rng(ns.rngState);

  // Event: use peeked event if present (player paid the tip), else roll fresh.
  if (ns.peekedEvent) {
    // Burn one rng draw to keep the rng aligned with the original peek.
    random();
    ns.event = ns.peekedEvent;
    ns.peekedEvent = null;
  } else {
    ns.event = rollEvent(ns, random);
  }

  // Update prices: trend + noise + event modifier.
  const newPrices: Record<AssetId, number> = {} as Record<AssetId, number>;
  for (const asset of ASSETS) {
    const noise = (random() - 0.5) * 2 * asset.vol * ns.volMultiplier;
    let change = noise + asset.trend;
    if (ns.event) {
      if (ns.event.asset === asset.id) change += ns.event.impact;
      else if (ns.event.asset === "ALL") change += ns.event.impact * 0.7;
    }
    newPrices[asset.id] = Math.max(1, ns.prices[asset.id] * (1 + change));
  }

  // Player action.
  const pAsset = playerAction.asset;
  const pPrice = newPrices[pAsset];
  if (playerAction.action === "buy" && playerAction.qty > 0) {
    const cost = pPrice * playerAction.qty;
    if (cost <= ns.player.cash) {
      ns.player.cash -= cost;
      ns.player.holdings[pAsset] = (ns.player.holdings[pAsset] || 0) + playerAction.qty;
      ns.player.trades.push({ turn: ns.turn + 1, action: "buy", asset: pAsset, qty: playerAction.qty, price: pPrice });
    }
  } else if (playerAction.action === "sell" && playerAction.qty > 0) {
    const owned = ns.player.holdings[pAsset] || 0;
    const qty = Math.min(playerAction.qty, owned);
    if (qty > 0) {
      ns.player.cash += pPrice * qty;
      ns.player.holdings[pAsset] -= qty;
      ns.player.trades.push({ turn: ns.turn + 1, action: "sell", asset: pAsset, qty, price: pPrice });
    }
  }

  // Player rank vs active bots BEFORE bot decisions.
  const playerVal = portfolioValue(ns.player, ns.prices);
  const standings = [
    { id: "player", value: playerVal },
    ...ns.activeBots.map((id) => ({ id, value: ns.bots[id].value })),
  ].sort((a, b) => b.value - a.value);
  const totalAgents = standings.length;

  // Bot decisions — only active bots.
  let duelOpponentAction: Action | null = null;
  for (const id of ns.activeBots) {
    const bot = BOTS.find((b) => b.id === id)!;
    const rank = standings.findIndex((s) => s.id === id) + 1;
    const decision = decideBot({ state: ns, bot, rng: random, rank, totalAgents });
    if (ns.activeBots.length === 1) duelOpponentAction = decision.action;
    const bs = ns.bots[id];
    if (decision.action === "buy" && decision.asset && decision.qty > 0) {
      const cost = newPrices[decision.asset] * decision.qty;
      if (cost <= bs.cash) {
        bs.cash -= cost;
        bs.holdings[decision.asset] = (bs.holdings[decision.asset] || 0) + decision.qty;
      }
    } else if (decision.action === "sell" && decision.asset && decision.qty > 0) {
      const owned = bs.holdings[decision.asset] || 0;
      const qty = Math.min(decision.qty, owned);
      if (qty > 0) {
        bs.cash += newPrices[decision.asset] * qty;
        bs.holdings[decision.asset] -= qty;
      }
    }
    bs.lastAction = { action: decision.action, asset: decision.asset, qty: decision.qty, reasoning: decision.reasoning };
  }

  // Resolve prediction (duel only).
  if (ns.mode.prediction && duelOpponentAction !== null) {
    const guess = ns.prediction.guess;
    if (guess !== null) {
      const correct = guess === duelOpponentAction;
      ns.prediction.lastCorrect = correct;
      ns.prediction.total += 1;
      if (correct) {
        ns.prediction.correct += 1;
        ns.prediction.reward += ns.mode.predictionReward;
        ns.player.cash += ns.mode.predictionReward;
      }
    } else {
      ns.prediction.lastCorrect = null;
    }
    ns.prediction.guess = null;
  }

  // Commit prices and history.
  ns.prices = newPrices;
  for (const asset of ASSETS) ns.history[asset.id].push(newPrices[asset.id]);

  // Compute new portfolio values.
  const playerNew = portfolioValue(ns.player, ns.prices);
  ns.player.valueHistory.push(playerNew);
  for (const id of ns.activeBots) {
    const v = portfolioValue(ns.bots[id], ns.prices);
    ns.bots[id].value = v;
    ns.bots[id].valueHistory.push(v);
  }

  // Survival: lives + peak watermark.
  if (ns.mode.livesEnabled) {
    if (playerNew > ns.peakValue) ns.peakValue = playerNew;
    const drawdown = (ns.peakValue - playerNew) / ns.peakValue;
    if (drawdown >= ns.mode.drawdownThreshold && ns.lives > 0) {
      ns.lives -= 1;
      // Reset peak so each life has its own watermark.
      ns.peakValue = playerNew;
      if (ns.lives <= 0) {
        ns.knockedOut = true;
        ns.done = true;
      }
    }
  } else {
    if (playerNew > ns.peakValue) ns.peakValue = playerNew;
  }

  ns.turn += 1;
  if (ns.turn >= ns.totalTurns) ns.done = true;
  return ns;
}

export interface LeaderboardEntry {
  id: "player" | BotId;
  name: string;
  color: string;
  isPlayer: boolean;
  value: number;
  rank: number;
  return: number;
  icon?: string;
}

export function leaderboard(state: GameState): LeaderboardEntry[] {
  const sc = state.startingCash;
  const entries: Omit<LeaderboardEntry, "rank">[] = [
    {
      id: "player",
      name: "You",
      color: "#3D3BF3",
      isPlayer: true,
      value: portfolioValue(state.player, state.prices),
      return: (portfolioValue(state.player, state.prices) - sc) / sc,
      icon: "user",
    },
    ...state.activeBots.map<Omit<LeaderboardEntry, "rank">>((id) => {
      const bot = BOTS.find((b) => b.id === id)!;
      return {
        id,
        name: bot.name,
        color: bot.color,
        isPlayer: false,
        value: state.bots[id].value,
        return: (state.bots[id].value - sc) / sc,
        icon: bot.icon,
      };
    }),
  ];
  entries.sort((a, b) => b.value - a.value);
  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function tradeStats(state: GameState) {
  const trades = state.player.trades;
  if (trades.length === 0) return { best: null as null | { asset: AssetId; pnl: number }, worst: null as null | { asset: AssetId; pnl: number }, count: 0 };

  const closed: { asset: AssetId; pnl: number }[] = [];
  const buys: PlayerTrade[] = [];
  for (const t of trades) {
    if (t.action === "buy") buys.push({ ...t });
    else if (t.action === "sell") {
      const buy = buys.find((b) => b.asset === t.asset);
      if (buy) {
        closed.push({ asset: t.asset, pnl: (t.price - buy.price) / buy.price });
        buys.splice(buys.indexOf(buy), 1);
      }
    }
  }
  for (const b of buys) {
    const cur = state.prices[b.asset];
    closed.push({ asset: b.asset, pnl: (cur - b.price) / b.price });
  }
  if (closed.length === 0) return { best: null, worst: null, count: trades.length };
  closed.sort((a, b) => b.pnl - a.pnl);
  return { best: closed[0], worst: closed[closed.length - 1], count: trades.length };
}

export { ASSETS, BOTS, EVENTS };
export type { Asset, Bot, MarketEvent };
