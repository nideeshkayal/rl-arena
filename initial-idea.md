# RL Arena — Full Build Prompt for Claude Code

## Project Overview

Build a **production-ready, highly interactive fintech web game** called **RL Arena** using **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and deployable directly on **Vercel** with minimal backend requirements.

RL Arena is a browser-based stock market battle simulator where users compete against multiple AI trading bots trained using Reinforcement Learning strategies.

The experience should feel like a polished startup product + strategy game.

Users should feel:

- Excited to compete
- Curious to test strategies
- Motivated to beat bots
- Interested in learning how RL agents behave differently

---

# Core Concept

User starts with virtual money.

Each game session simulates a market timeline (30 turns / 60 turns / 100 turns).

Every turn:

- Stock prices move
- News/events may happen
- User can Buy / Sell / Hold
- Bots also act simultaneously

At the end:

- Portfolio values are compared
- Rankings shown
- Bot decisions explained
- User performance analyzed

---

# Main Goal

Create a game that teaches Reinforcement Learning through competition.

Different bots should behave differently because they were "trained" in different reward environments.

---

# Tech Stack

## Frontend + Fullstack

- Next.js latest (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI components
- Framer Motion animations

## Storage

Use:

- LocalStorage for sessions
- JSON files for bot configs
- No database required initially

## Backend

Use only Next.js API routes if needed.

No separate Python server required.

Deploy directly to Vercel.

---

# Important Architecture Rule

Do NOT build a heavy backend.

Everything possible should run client-side or via lightweight serverless API routes.

---

# RL Bot Design (Simulated RL Logic)

We are not training live models in production.

Instead create prebuilt RL-style policy bots using weighted decision logic inspired by trained environments.

This keeps deployment simple and fast.

Each bot should feel distinct.

---

# Bots Required

## 1. SafeBot

Reward trained for:

- Minimize losses
- Stable growth
- Avoid volatility

Behavior:

- Buys on dips
- Sells early profit
- Keeps cash reserve

Personality:

"Cautious investor"

---

## 2. YOLOBot

Reward trained for:

- Max returns only
- High risk acceptable

Behavior:

- Heavy buys during momentum
- All-in trades
- Holds volatile assets

Personality:

"Risk addict"

---

## 3. SniperBot

Reward trained for:

- Timing entries perfectly

Behavior:

- Waits many turns
- Executes fewer high-confidence trades

Personality:

"Silent assassin"

---

## 4. ChaosBot

Reward trained under noisy environment.

Behavior:

- Unpredictable
- Sometimes genius
- Sometimes terrible

Personality:

"Market gambler"

---

## 5. AdaptiveBot

Reward trained for relative competition.

Behavior:

- Watches leaderboard
- Changes aggression if losing
- Protects lead if winning

Personality:

"Competitive strategist"

---

# Gameplay Modes

## Mode 1: Quick Duel

User vs 1 selected bot

20 turns

Fast game mode

---

## Mode 2: Arena Royale

User vs all 5 bots

50 turns

Leaderboard updates every turn

---

## Mode 3: Survival Mode

Market crash events happen.

Goal = survive.

---

## Mode 4: Custom Sandbox

User selects:

- Starting money
- Volatility
- Number of turns
- Bots enabled

---

# Game Loop

Each turn:

1. Show price movement chart
2. Generate event/news card
3. User chooses:
   - Buy
   - Sell
   - Hold
4. Bots make decisions
5. Animate portfolio updates
6. Show ranking changes
7. Proceed to next turn

---

# Make It Feel Fun

## Must Include:

### 1. Animated Leaderboard

Live ranking changes every turn.

### 2. Trash Talk / Bot Dialogue

Examples:

SafeBot:
"I prefer not losing."

YOLOBot:
"ALL IN."

ChaosBot:
"No one knows anything."

AdaptiveBot:
"I am adjusting."

### 3. Event Cards

Examples:

- Interest rates rise
- Tech rally begins
- Market panic
- Meme stock frenzy
- Recession fears
- Earnings surprise

These affect price movement.

### 4. Sound Effects (optional muted by default)

- Buy click
- Rank rise
- Win screen

### 5. Reward Screen

At game end:

- Winner podium
- Portfolio chart replay
- Best trade
- Worst trade
- Performance grade

---

# Market Simulation Engine

Create deterministic + random hybrid engine.

Every turn stock price changes based on:

## Inputs

- Trend momentum
- Volatility level
- News event modifier
- Mean reversion chance
- Random noise

Formula example:

nextPrice =
currentPrice *
(1 + trend + noise + eventImpact)

Use 3 tradable assets:

- TECHX (growth stock)
- BANKR (stable stock)
- CRYPTX (high volatility)

---

# Bot Decision Engine

Each bot evaluates:

## State Inputs

- Cash available
- Holdings
- Price trend
- Volatility
- Turn remaining
- Current rank

## Actions

- Buy asset
- Sell asset
- Hold
- Rotate asset

---

# UI Pages Required

## 1. Landing Page

Hero section:

"Can you beat Reinforcement Learning?"

Buttons:

- Start Arena
- How It Works

Modern dark fintech aesthetic.

---

## 2. Bot Selection Page

Cards for all bots with:

- Avatar
- Strategy
- Risk level
- Win rate

---

## 3. Game Arena Page

Main gameplay screen.

Layout:

Left:
- Market chart
- Event cards

Center:
- Buy / Sell controls

Right:
- Leaderboard
- Bot dialogue feed

Bottom:
- Portfolio summary

---

## 4. Results Page

Show:

- Final rankings
- Profit %
- Replay chart
- Strategy summary

---

## 5. Learn RL Page

Explain how each bot was rewarded differently.

Simple educational UI.

---

# Visual Style

Use:

- Dark mode
- Neon finance aesthetic
- Smooth animations
- Glassmorphism cards
- Premium dashboard feel

---

# Components Required

## Reusable Components

- BotCard
- LeaderboardTable
- MarketChart
- TradePanel
- EventCard
- ResultsModal
- AnimatedCounter
- PortfolioStats

---

# Data Structure

## Bot Config Example

```ts
{
  name: "YOLOBot",
  aggression: 0.95,
  patience: 0.1,
  riskTolerance: 1.0,
  sellDiscipline: 0.2,
  adaptiveness: 0.4
}