export function fmt$(v: number): string {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return sign + (v * 100).toFixed(1) + "%";
}

export function clamp(v: number, mn: number, mx: number): number {
  return Math.max(mn, Math.min(mx, v));
}
