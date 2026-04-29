interface MiniChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showFill?: boolean;
}

/**
 * Tiny line chart with last-point dot. Auto-colors line green/red by direction
 * unless `color` overrides it.
 */
export function MiniChart({ data, color, width = 300, height = 80, showFill = false }: MiniChartProps) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} style={{ display: "block" }} />;
  }
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const range = mx - mn || 1;
  const pad = 4;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - mn) / range) * (height - pad * 2);
    return [x, y] as [number, number];
  });
  const last = data[data.length - 1];
  const first = data[0];
  const auto = last >= first ? "#10B981" : "#F43F5E";
  const stroke = color ?? auto;
  const ptsStr = points.map((p) => p.join(",")).join(" ");
  const lastPt = points[points.length - 1];
  const fillPath = showFill
    ? `M ${points[0][0]},${height - pad} L ${ptsStr.replace(/ /g, " L ")} L ${lastPt[0]},${height - pad} Z`
    : "";
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {showFill && (
        <path d={fillPath} fill={stroke} fillOpacity={0.12} />
      )}
      <polyline fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" points={ptsStr} />
      <circle cx={lastPt[0]} cy={lastPt[1]} r={4} fill={stroke} />
    </svg>
  );
}
