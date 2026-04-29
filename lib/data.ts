import type { IconName } from "../components/Icon";

export type BotId = "safe" | "yolo" | "sniper" | "chaos" | "adaptive";
export type AssetId = "TECHX" | "BANKR" | "CRYPTX";
export type Action = "buy" | "sell" | "hold";

export interface Bot {
  id: BotId;
  name: string;
  color: string;
  dim: string;
  icon: IconName;
  role: string;
  desc: string;
  rewardFn: string;
  /** Risk score (0–100) shown on cards */
  risk: number;
  /** Historical win rate shown on cards */
  winRate: number;
  /** RL policy weights — drive `decideAction` */
  policy: BotPolicy;
  dialogue: string[];
}

export interface BotPolicy {
  /** Fraction of cash committed when buying (0–1) */
  aggression: number;
  /** Confidence threshold for taking action (0–1) — higher = waits longer */
  patience: number;
  /** How much volatility the bot will accept (0–1) */
  riskTolerance: number;
  /** Trigger to take profits (0–1) — higher = sells profits earlier */
  sellDiscipline: number;
  /** How much the bot reacts to leaderboard standing (0–1) */
  adaptiveness: number;
  /** How much weight the bot puts on price trend vs noise (0–1) */
  trendBias: number;
  /** Probability the bot acts purely randomly (0–1) — chaos */
  noise: number;
}

export interface Asset {
  id: AssetId;
  name: string;
  color: string;
  startPrice: number;
  /** Per-turn drift (e.g. 0.004 = +0.4%) */
  trend: number;
  /** Per-turn volatility (stddev-ish in fraction terms) */
  vol: number;
  description: string;
}

export interface MarketEvent {
  text: string;
  desc: string;
  asset: AssetId | "ALL";
  impact: number;
  color: string;
  icon: IconName;
  /** True if this event represents a crash — used in survival mode */
  crash?: boolean;
}

export const BOTS: Bot[] = [
  {
    id: "safe",
    name: "SafeBot",
    color: "#14B8A6",
    dim: "#CCFBF1",
    icon: "shield",
    role: "Cautious Investor",
    desc: "Buys dips, protects capital. Hates volatility.",
    rewardFn: "Reward = portfolio_return − 4 × drawdown",
    risk: 18,
    winRate: 64,
    policy: { aggression: 0.25, patience: 0.85, riskTolerance: 0.25, sellDiscipline: 0.7, adaptiveness: 0.2, trendBias: 0.55, noise: 0.05 },
    dialogue: [
      "I prefer not losing.",
      "Steady wins the race.",
      "BANKR looks stable. Buying.",
      "Cash is a position too.",
      "Risk? No thank you.",
      "Drawdown protection engaged.",
    ],
  },
  {
    id: "yolo",
    name: "YOLOBot",
    color: "#F97316",
    dim: "#FFEDD5",
    icon: "zap",
    role: "Risk Addict",
    desc: "All-in on momentum. Wins big, or loses everything.",
    rewardFn: "Reward = max(portfolio_return)",
    risk: 96,
    winRate: 41,
    policy: { aggression: 0.95, patience: 0.1, riskTolerance: 1.0, sellDiscipline: 0.15, adaptiveness: 0.4, trendBias: 0.9, noise: 0.1 },
    dialogue: [
      "ALL IN.",
      "No thoughts, head empty.",
      "CRYPTX TO THE MOON!",
      "Why hold when you can YOLO?",
      "Pain is temporary. Gains are forever.",
      "Diversification is for cowards.",
    ],
  },
  {
    id: "sniper",
    name: "SniperBot",
    color: "#8B5CF6",
    dim: "#EDE9FE",
    icon: "crosshair",
    role: "Silent Assassin",
    desc: "Waits for perfect entries. Few trades, high precision.",
    rewardFn: "Reward = win_rate × avg_win_size",
    risk: 50,
    winRate: 71,
    policy: { aggression: 0.7, patience: 0.95, riskTolerance: 0.5, sellDiscipline: 0.8, adaptiveness: 0.3, trendBias: 0.85, noise: 0.02 },
    dialogue: ["Watching.", "Not yet.", "Patience is the edge.", "Soon.", "The market always gives a second chance.", "Locked on."],
  },
  {
    id: "chaos",
    name: "ChaosBot",
    color: "#F43F5E",
    dim: "#FFE4E8",
    icon: "shuffle",
    role: "Market Gambler",
    desc: "Trained on noisy signals. Unpredictable. Sometimes genius.",
    rewardFn: "Reward = E[return | high-noise observations]",
    risk: 80,
    winRate: 47,
    policy: { aggression: 0.65, patience: 0.4, riskTolerance: 0.85, sellDiscipline: 0.4, adaptiveness: 0.3, trendBias: 0.4, noise: 0.6 },
    dialogue: [
      "No one knows anything.",
      "Including me.",
      "The market is a random walk.",
      "I do what I want.",
      "Chaos is a ladder.",
      "Coin flip says... buy?",
    ],
  },
  {
    id: "adaptive",
    name: "AdaptiveBot",
    color: "#6366F1",
    dim: "#E0E7FF",
    icon: "target",
    role: "Competitive Strategist",
    desc: "Watches the leaderboard. Aggressive when losing, protective when winning.",
    rewardFn: "Reward = relative_rank_improvement",
    risk: 55,
    winRate: 68,
    policy: { aggression: 0.6, patience: 0.55, riskTolerance: 0.6, sellDiscipline: 0.55, adaptiveness: 0.95, trendBias: 0.7, noise: 0.05 },
    dialogue: [
      "Adjusting strategy.",
      "You're ahead. Recalibrating.",
      "Competitive pressure detected.",
      "I learn. I adapt.",
      "Interesting move.",
      "Increasing exposure to catch up.",
    ],
  },
];

export const ASSETS: Asset[] = [
  { id: "TECHX",  name: "TECHX",  color: "#3D3BF3", startPrice: 100, trend: 0.004, vol: 0.030, description: "Growth stock — strong long-term trend, moderate volatility." },
  { id: "BANKR",  name: "BANKR",  color: "#14B8A6", startPrice: 80,  trend: 0.002, vol: 0.012, description: "Stable bank — slow grind upward, low volatility." },
  { id: "CRYPTX", name: "CRYPTX", color: "#F97316", startPrice: 50,  trend: 0.006, vol: 0.070, description: "Volatile crypto — explosive moves either direction." },
];

export const EVENTS: (MarketEvent | null)[] = [
  { text: "Tech Rally Begins",  desc: "TECHX surges on strong earnings.",                     asset: "TECHX",  impact:  0.08, color: "#10B981", icon: "trending-up" },
  { text: "Recession Fears",    desc: "Fed signals rate hike. Broad sell-off.",               asset: "ALL",    impact: -0.05, color: "#F43F5E", icon: "trending-down" },
  { text: "Meme Stock Frenzy",  desc: "CRYPTX becomes the meme of the week.",                 asset: "CRYPTX", impact:  0.15, color: "#F97316", icon: "dices" },
  { text: "Earnings Surprise",  desc: "BANKR beats estimates. Sector rallies.",               asset: "BANKR",  impact:  0.07, color: "#10B981", icon: "banknote" },
  { text: "Market Panic",       desc: "Sentiment drops. Selling pressure across all assets.", asset: "ALL",    impact: -0.08, color: "#F43F5E", icon: "alert-triangle" },
  { text: "Interest Rate Cut",  desc: "Central bank surprises with rate cut.",                asset: "ALL",    impact:  0.06, color: "#10B981", icon: "scissors" },
  { text: "Crypto Winter",      desc: "Regulatory news hits CRYPTX hard.",                    asset: "CRYPTX", impact: -0.12, color: "#F43F5E", icon: "snowflake" },
  { text: "Tech Earnings Miss", desc: "TECHX guidance disappoints investors.",                asset: "TECHX",  impact: -0.09, color: "#F43F5E", icon: "trending-down" },
  { text: "Banking Scare",      desc: "BANKR shares slip on credit concerns.",                asset: "BANKR",  impact: -0.06, color: "#F43F5E", icon: "building" },
  { text: "Risk-On Wave",       desc: "Investors pile into risk assets.",                     asset: "CRYPTX", impact:  0.10, color: "#10B981", icon: "waves" },
  null, null, null, null, // quiet turns
];

/** Crash events used in Survival mode at scheduled crash turns. */
export const CRASH_EVENTS: MarketEvent[] = [
  { text: "FLASH CRASH",   desc: "Algorithmic sell-off cascades across the market.", asset: "ALL",    impact: -0.18, color: "#F43F5E", icon: "alert-triangle", crash: true },
  { text: "BANK RUN",      desc: "Depositors panic. BANKR collapses.",               asset: "BANKR",  impact: -0.30, color: "#F43F5E", icon: "building",       crash: true },
  { text: "RUG PULL",      desc: "Major CRYPTX project exit-scams.",                 asset: "CRYPTX", impact: -0.40, color: "#F43F5E", icon: "skull",          crash: true },
  { text: "TECH MELTDOWN", desc: "Tech sector implodes on bad guidance.",            asset: "TECHX",  impact: -0.25, color: "#F43F5E", icon: "flame",          crash: true },
  { text: "BLACK SWAN",    desc: "Unknown unknowns hit. Everything dumps.",          asset: "ALL",    impact: -0.22, color: "#F43F5E", icon: "bird",           crash: true },
];

export type ModeId = "duel" | "royale" | "survival" | "sandbox";

export interface ModeConfig {
  id: ModeId;
  name: string;
  turns: number;
  icon: IconName;
  desc: string;
  bg: string;
  iconBg: string;
  featured: boolean;
  /** Volatility multiplier on per-turn noise. */
  volMultiplier: number;
  /** Bots present in this mode. Empty array means "all bots". */
  bots: BotId[];
  /** Whether the player has lives. If true, losing all lives ends the game. */
  livesEnabled: boolean;
  startingLives: number;
  /** % drawdown from peak that costs a life (0.2 = 20%). */
  drawdownThreshold: number;
  /** Force a crash event every N turns. 0 = no scheduled crashes. */
  crashEveryNTurns: number;
  /** Whether the player predicts the opponent's next action each turn. */
  prediction: boolean;
  /** Reward (in $) for a correct prediction. */
  predictionReward: number;
  /** Number of insider-tip peeks granted per game. */
  insiderTips: number;
  /** Whether this mode requires a setup step. */
  customizable: boolean;
}

export const GAME_MODES: ModeConfig[] = [
  {
    id: "duel",
    name: "Quick Duel",
    turns: 20,
    icon: "swords",
    desc: "Pick one bot. Predict every move. Beat them.",
    bg: "#E8E7FF",
    iconBg: "#3D3BF3",
    featured: false,
    volMultiplier: 1,
    bots: [], // overridden by setup
    livesEnabled: false,
    startingLives: 0,
    drawdownThreshold: 0,
    crashEveryNTurns: 0,
    prediction: true,
    predictionReward: 200,
    insiderTips: 2,
    customizable: true,
  },
  {
    id: "royale",
    name: "Arena Royale",
    turns: 50,
    icon: "layout-grid",
    desc: "You vs all 5 bots. Live leaderboard.",
    bg: "#3D3BF3",
    iconBg: "white",
    featured: true,
    volMultiplier: 1,
    bots: [], // all
    livesEnabled: false,
    startingLives: 0,
    drawdownThreshold: 0,
    crashEveryNTurns: 0,
    prediction: false,
    predictionReward: 0,
    insiderTips: 2,
    customizable: false,
  },
  {
    id: "survival",
    name: "Survival",
    turns: 60,
    icon: "skull",
    desc: "3 lives. Crashes every 8 turns. Don't get wrecked.",
    bg: "#FFE4E8",
    iconBg: "#F43F5E",
    featured: false,
    volMultiplier: 1.4,
    bots: [], // all
    livesEnabled: true,
    startingLives: 3,
    drawdownThreshold: 0.18,
    crashEveryNTurns: 8,
    prediction: false,
    predictionReward: 0,
    insiderTips: 3,
    customizable: false,
  },
  {
    id: "sandbox",
    name: "Sandbox",
    turns: 30,
    icon: "wrench",
    desc: "Configure everything. Make your own arena.",
    bg: "#D1FAE5",
    iconBg: "#10B981",
    featured: false,
    volMultiplier: 1,
    bots: [], // overridden by setup
    livesEnabled: false,
    startingLives: 0,
    drawdownThreshold: 0,
    crashEveryNTurns: 0,
    prediction: false,
    predictionReward: 0,
    insiderTips: 2,
    customizable: true,
  },
];

export function getMode(id: string | null | undefined): ModeConfig {
  return GAME_MODES.find((m) => m.id === id) || GAME_MODES[1]; // royale
}
