import {
  // Bots
  Shield, Zap, Crosshair, Shuffle, Target,
  // Modes
  Swords, LayoutGrid, Skull, Wrench,
  // Events
  TrendingUp, TrendingDown, Dices, Banknote, AlertTriangle, Scissors, Snowflake, Building2, Waves, Flame, Bird,
  // UI
  Trophy, Crown, MessageCircle, Settings, Brain, Sparkles, BarChart3, User, Activity, Info,
  // Controls
  Check, X, Pause, FastForward, Heart, Coins, RefreshCw, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft,
  // Learn page
  Eye, Gem, Key, Gamepad2, BookOpen, Lightbulb, Compass, Layers, Network, Telescope, GitBranch, Workflow,
  // Misc
  Hammer, Sliders, Lock, Search, MousePointerClick, ArrowUpRight, Repeat, Hourglass, Award, Cpu, LineChart,
  type LucideIcon, type LucideProps,
} from "lucide-react";

const ICONS = {
  // Bots
  shield: Shield, zap: Zap, crosshair: Crosshair, shuffle: Shuffle, target: Target,
  // Modes
  swords: Swords, "layout-grid": LayoutGrid, skull: Skull, wrench: Wrench,
  // Events
  "trending-up": TrendingUp, "trending-down": TrendingDown, dices: Dices, banknote: Banknote,
  "alert-triangle": AlertTriangle, scissors: Scissors, snowflake: Snowflake, building: Building2,
  waves: Waves, flame: Flame, bird: Bird,
  // UI
  trophy: Trophy, crown: Crown, "message-circle": MessageCircle, settings: Settings, brain: Brain,
  sparkles: Sparkles, "bar-chart": BarChart3, user: User, activity: Activity, info: Info,
  // Controls
  check: Check, x: X, pause: Pause, "fast-forward": FastForward, heart: Heart, coins: Coins,
  refresh: RefreshCw, "arrow-right": ArrowRight, "arrow-left": ArrowLeft,
  "chevron-right": ChevronRight, "chevron-left": ChevronLeft,
  // Learn
  eye: Eye, gem: Gem, key: Key, gamepad: Gamepad2, book: BookOpen, lightbulb: Lightbulb,
  compass: Compass, layers: Layers, network: Network, telescope: Telescope,
  "git-branch": GitBranch, workflow: Workflow,
  // Misc
  hammer: Hammer, sliders: Sliders, lock: Lock, search: Search, click: MousePointerClick,
  "arrow-up-right": ArrowUpRight, repeat: Repeat, hourglass: Hourglass, award: Award,
  cpu: Cpu, "line-chart": LineChart,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, strokeWidth = 1.75, ...rest }: IconProps) {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component size={size} strokeWidth={strokeWidth} {...rest} />;
}
