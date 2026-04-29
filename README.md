# RL Arena 🏟️

A browser-based stock market battle simulator where you compete against 5 AI trading bots, each "trained" with a different reinforcement-learning reward function.

> *Same market. Different rewards. Different bots.*

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Then:

- `npm run build` — production build
- `npm run start` — serve production build

Deploys to Vercel out of the box.

## What's inside

| Page | Path | What |
|---|---|---|
| Landing | `/` | Hero, mode picker, opponent strip |
| Arena | `/play?mode=royale` | The game — chart, trade panel, leaderboard, bot chatter, results modal |
| Learn RL | `/learn` | The reward functions explained, RL concepts in plain English |

## Project layout

```
app/
  page.tsx              # Landing
  play/
    page.tsx            # Wrapper (Suspense)
    PlayClient.tsx      # Game arena + post-game results modal
  learn/page.tsx        # Educational page
  globals.css           # Design tokens (colors, type, animations)
  layout.tsx
components/
  Nav.tsx
  Badge.tsx
  Button.tsx
  MiniChart.tsx
  Leaderboard.tsx
  BotChatter.tsx
lib/
  data.ts               # Bots, assets, events, game modes
  engine.ts             # Market sim + RL bot decision policy
  format.ts             # Number/percent formatters
```

## How the bots "think"

Each bot has a small set of policy weights — `aggression`, `patience`, `riskTolerance`, `sellDiscipline`, `adaptiveness`, `trendBias`, `noise`. On every turn, `decideBot()` (in [lib/engine.ts](lib/engine.ts)) scores every (action, asset) pair against the bot's weights and picks the highest. The shape of that decision — observe state, score actions by expected reward, pick — is exactly how an RL agent acts at inference. We just ship the weights instead of training live.

The bots:

| Bot | Reward function (training-time goal) | Behavior |
|---|---|---|
| **SafeBot** | `return − 4 × drawdown` | Cautious. Buys dips, sells profits early. |
| **YOLOBot** | `max(return)` | All-in on momentum. Wins big or loses everything. |
| **SniperBot** | `win_rate × avg_win_size` | Patient. Few trades, high precision. |
| **ChaosBot** | `E[return | high-noise observations]` | Unpredictable. Sometimes genius, sometimes terrible. |
| **AdaptiveBot** | `relative_rank_improvement` | Watches the leaderboard. Aggressive when behind, defensive when ahead. |

## Design

The visuals are ported from the design system in `design-extract/rl-arena-design-system/` — warm off-white background, deep indigo brand, Space Grotesk display + Plus Jakarta Sans body + JetBrains Mono numbers, soft shadows, spring-eased animations, distinct identity colors per bot and per asset.
