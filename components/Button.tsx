import React from "react";

type Variant = "primary" | "secondary" | "ink" | "buy" | "sell" | "hold";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: { background: "var(--color-primary)", color: "white", boxShadow: "0 4px 16px rgba(61,59,243,0.3)" },
  secondary: { background: "white", color: "var(--color-ink)", border: "1.5px solid var(--color-border)" },
  ink: { background: "var(--color-ink)", color: "white", boxShadow: "0 4px 16px rgba(15,14,23,0.2)" },
  buy: { background: "var(--color-gain)", color: "white", boxShadow: "0 4px 16px rgba(16,185,129,0.25)" },
  sell: { background: "var(--color-loss)", color: "white", boxShadow: "0 4px 16px rgba(244,63,94,0.25)" },
  hold: { background: "var(--color-hold-dim)", color: "#B45309" },
};

const sizes: Record<NonNullable<ButtonProps["size"]>, React.CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: 12, borderRadius: 8 },
  md: { padding: "12px 24px", fontSize: 14, borderRadius: 9 },
  lg: { padding: "14px 32px", fontSize: 15, borderRadius: 10 },
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  style,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        transition: "all 0.15s var(--ease-out)",
        width: fullWidth ? "100%" : undefined,
        ...sizes[size],
        ...styles[variant],
        ...style,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.97)";
        rest.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "";
        rest.onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        rest.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}
