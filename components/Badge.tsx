interface BadgeProps {
  children: React.ReactNode;
  color: string;
  bg: string;
  style?: React.CSSProperties;
}

export function Badge({ children, color, bg, style = {} }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 9999,
        background: bg,
        color,
        fontFamily: "var(--font-body)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
