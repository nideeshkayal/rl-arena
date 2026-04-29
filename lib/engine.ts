import { ASSETS, BOTS, EVENTS, type Action, type Asset, type AssetId, type Bot, type BotId, type MarketEvent } from "./data";

/** Seeded RNG so games are reproducible if you want, but here we use a fresh seed each game. */
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
  /** History of portfolio values per turn */
  valueHistory: number[];
  /** Last action taken (for the dialogue/explanations) */
  lastAction: { action: Action; asset: AssetId | null; qty: number; reasoning: string } | null;
}

export interface PlayerTrade {
  turn: number;
  action: Action;
  asset: AssetId;
  qty: number;
  price: number;
  /** Profit attributable to this trade once exited (filled at game end) */
  pnl?: number;
}

export interface GameState {
  turn: number;
  totalTurns: number;
  prices: Record<AssetId, number>;
  history: Record<AssetId, number[]>;
  player: Portfolio & { valueHistory: number[]; trades: PlayerTrade[] };
  bots: Record<BotId, BotState>;
  event: MarketEvent | null;
  done: boolean;
  /** Volatility multiplier for sandbox/survival modes */
  volMultiplier: number;
  /** Whether crash events are amplified (survival) */
  survival: boolean;
  rngState: { v: number };
}

export function emptyHoldings(): Record<AssetId, number> {
  return ASSETS.reduce((acc, a) => ({ ...acc, [a.id]: 0 }), {} as Record<AssetId, number>);
}

export function startingPrices(): Record<AssetId, number> {
  return ASSETS.reduce((acc, a) => ({ ...acc, [a.id]: a.startPrice }), {} as Record<AssetId, number>);
}

export interface GameInitOptions {
  totalTurns: number;
  startingCash?: number;
  volMultiplier?: number;
  survival?: boolean;
  seed?: number;
}

export function createGame(opts: GameInitOptions): GameState {
  const { totalTurns, startingCash = 10000, volMultiplier = 1, survival = false } = opts;
  const seed = opts.seed ?? Math.floor(Math.random() * 1e9);
  const rngState = { v: seed % 233280 || 1 };
  const prices = startingPrices();
  const history: Record<AssetId, number[]> = ASSETS.reduce(
    (acc, a) => ({ ...acc, [a.id]: [a.startPrice] }),
    {} as Record<AssetId, number[]>
  );
  const bots: Record<BotId, BotState> = {} as Record<BotId, BotState>;
  for (const bot of BOTS) {
    bots[bot.id] = {
      cash: startingCash,
      holdings: emptyHoldings(),
      value: startingCash,
      valueHistory: [startingCash],
      lastAction: null,
    };
  }
  return {
    turn: 0,
    totalTurns,
    prices,
    history,
    player: {
      cash: startingCash,
      holdings: emptyHoldings(),
      valueHistory: [startingCash],
      trades: [],
    },
    bots,
    event: null,
    done: false,
    volMultiplier,
    survival,
    rngState,
  };
}

export function portfolioValue(p: Portfolio, prices: Record<AssetId, number>): number {
  let v = p.cash;
  for (const a of ASSETS) v += (p.holdings[a.id] || 0) * prices[a.id];
  return v;
}

/** Compute price trend over last N turns as fractional change. */
function trendOf(history: number[], window = 4): number {
  if (history.length < 2) return 0;
  const w = Math.min(window, history.length - 1);
  const old = history[history.length - 1 - w];
  const cur = history[history.length - 1];
  if (!old) return 0;
  return (cur - old) / old;
}

/** Recent volatility estimate as stddev of returns. */
function volOf(history: number[], window = 5): number {
  if (history.length < 3) return 0;
  const slice = history.slice(-window - 1);
  const rets: number[] = [];
  for (let i = 1; i < slice.length; i++) rets.push((slice[i] - slice[i - 1]) / slice[i - 1]);
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const v = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / rets.length;
  return Math.sqrt(v);
}

/**
 * RL-style policy: each bot picks the action that maximizes its expected reward
 * given its policy weights. We score each (action, asset) pair and softmax-pick.
 *
 * This is *not* a trained neural net, but the decision shape — observe state,
 * score actions by expected reward — mirrors how an RL agent acts at inference.
 */
export interface BotDecision {
  action: Action;
  asset: AssetId | null;
  qty: number;
  /** Short human-readable reasoning for the dialogue / debug overlay */
  reasoning: string;
  /** Suggested dialogue line index */
  dialogueIdx: number;
}

interface DecideContext {
  state: GameState;
  bot: Bot;
  rng: () => number;
  /** Bot's current rank (1 = leading, N = last) */
  rank: number;
  totalAgents: number;
}

export function decideBot(ctx: DecideContext): BotDecision {
  const { state, bot, rng, rank, totalAgents } = ctx;
  const policy = bot.policy;
  const myState = state.bots[bot.id];

  // Compute features for each asset
  const features = ASSETS.map((asset) => {
    const trend = trendOf(state.history[asset.id], 4);
    const vol = volOf(state.history[asset.id], 5);
    const eventBoost = state.event && (state.event.asset === asset.id || state.event.asset === "ALL") ? state.event.impact : 0;
    return { asset, trend, vol, eventBoost };
  });

  // Score buy/sell/hold per asset using policy weights
  const candidates: { action: Action; asset: AssetId | null; score: number; reason: string }[] = [];

  // Adaptiveness: when behind, increase aggression; when ahead, decrease.
  const rankFraction = (rank - 1) / Math.max(1, totalAgents - 1); // 0 leading, 1 last
  const adaptBoost = (rankFraction - 0.5) * 2 * policy.adaptiveness; // -adapt..+adapt

  for (const f of features) {
    // Expected return signal: trend (weighted by trendBias) + event boost
    const signal = f.trend * (0.5 + policy.trendBias) + f.eventBoost * (0.6 + policy.trendBias * 0.5);
    // Penalize volatility we don't tolerate
    const volPenalty = Math.max(0, f.vol - policy.riskTolerance * 0.05);

    // Buy score
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
      reason: buyScore > 0
        ? `${f.asset.id} trend +${(f.trend * 100).toFixed(1)}% — buying.`
        : `${f.asset.id} signal weak.`,
    });

    // Sell score: high if we hold the asset and signal turned negative or sellDiscipline hit
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
        reason: sellScore > 0
          ? `Locking gains on ${f.asset.id}.`
          : `Holding ${f.asset.id} a bit longer.`,
      });
    }
  }

  // Hold score (baseline)
  const holdScore = policy.patience * 0.6 + (rng() - 0.5) * policy.noise;
  candidates.push({ action: "hold", asset: null, score: holdScore, reason: "Sitting this one out." });

  // Pick the highest-scoring candidate, with small softmax-style randomness.
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];

  let qty = 0;
  if (top.action === "buy" && top.asset) {
    const price = state.prices[top.asset];
    const cashFraction = policy.aggression * (0.4 + Math.random() * 0.4);
    qty = Math.floor((myState.cash * cashFraction) / price);
    if (qty <= 0) {
      // Can't afford — fall back to hold
      return { action: "hold", asset: null, qty: 0, reasoning: "Out of cash. Holding.", dialogueIdx: Math.floor(rng() * bot.dialogue.length) };
    }
  } else if (top.action === "sell" && top.asset) {
    const owned = myState.holdings[top.asset] || 0;
    qty = Math.max(1, Math.ceil(owned * (0.4 + policy.sellDiscipline * 0.6)));
    qty = Math.min(qty, owned);
  }

  return {
    action: top.action,
    asset: top.asset,
    qty,
    reasoning: top.reason,
    dialogueIdx: Math.floor(rng() * bot.dialogue.length),
  };
}

export interface PlayerAction {
  action: Action;
  asset: AssetId;
  qty: number;
}

/** Runs one full turn. Mutates and returns a new GameState. */
export function step(state: GameState, playerAction: PlayerAction): GameState {
  if (state.done) return state;
  const random = rng(state.rngState);
  const ns: GameState = JSON.parse(JSON.stringify(state));
  ns.rngState = state.rngState; // share reference

  // Pick event (survival mode skews toward crash events)
  const eventPool = ns.survival
    ? EVENTS.concat(EVENTS.filter((e) => e && e.impact < 0))
    : EVENTS;
  ns.event = eventPool[Math.floor(random() * eventPool.length)] || null;

  // Update prices using trend + noise + event modifier (vol scaled by mode)
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

  // Apply player action
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

  // Compute player rank vs bots BEFORE bot decisions (so adaptive sees current standing)
  const playerVal = portfolioValue(ns.player, ns.prices);
  const standings = [
    { id: "player", value: playerVal },
    ...BOTS.map((b) => ({ id: b.id, value: ns.bots[b.id].value })),
  ].sort((a, b) => b.value - a.value);
  const totalAgents = standings.length;

  // Bots decide
  for (const bot of BOTS) {
    const rank = standings.findIndex((s) => s.id === bot.id) + 1;
    const decision = decideBot({ state: ns, bot, rng: random, rank, totalAgents });
    const bs = ns.bots[bot.id];
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

  // Commit prices and history
  ns.prices = newPrices;
  for (const asset of ASSETS) ns.history[asset.id].push(newPrices[asset.id]);

  // Compute new portfolio values
  const playerNew = portfolioValue(ns.player, ns.prices);
  ns.player.valueHistory.push(playerNew);
  for (const bot of BOTS) {
    const v = portfolioValue(ns.bots[bot.id], ns.prices);
    ns.bots[bot.id].value = v;
    ns.bots[bot.id].valueHistory.push(v);
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

export function leaderboard(state: GameState, startingCash = 10000): LeaderboardEntry[] {
  const entries: Omit<LeaderboardEntry, "rank">[] = [
    {
      id: "player",
      name: "You",
      color: "#3D3BF3",
      isPlayer: true,
      value: portfolioValue(state.player, state.prices),
      return: (portfolioValue(state.player, state.prices) - startingCash) / startingCash,
      icon: "👤",
    },
    ...BOTS.map<Omit<LeaderboardEntry, "rank">>((bot) => ({
      id: bot.id,
      name: bot.name,
      color: bot.color,
      isPlayer: false,
      value: state.bots[bot.id].value,
      return: (state.bots[bot.id].value - startingCash) / startingCash,
      icon: bot.icon,
    })),
  ];
  entries.sort((a, b) => b.value - a.value);
  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

/** Compute best/worst trade after the game ends. */
export function tradeStats(state: GameState) {
  const trades = state.player.trades;
  if (trades.length === 0) return { best: null, worst: null, count: 0 };

  // For each "buy" find the next "sell" of same asset to compute pnl%
  const closed: { asset: AssetId; pnl: number }[] = [];
  const buys: PlayerTrade[] = [];
  for (const t of trades) {
    if (t.action === "buy") buys.push({ ...t });
    else if (t.action === "sell") {
      const buy = buys.find((b) => b.asset === t.asset);
      if (buy) {
        const pnl = (t.price - buy.price) / buy.price;
        closed.push({ asset: t.asset, pnl });
        buys.splice(buys.indexOf(buy), 1);
      }
    }
  }
  // Mark-to-market remaining buys
  for (const b of buys) {
    const cur = state.prices[b.asset];
    const pnl = (cur - b.price) / b.price;
    closed.push({ asset: b.asset, pnl });
  }
  if (closed.length === 0) return { best: null, worst: null, count: trades.length };
  closed.sort((a, b) => b.pnl - a.pnl);
  return { best: closed[0], worst: closed[closed.length - 1], count: trades.length };
}

export { ASSETS, BOTS, EVENTS };
export type { Asset, Bot, MarketEvent };
