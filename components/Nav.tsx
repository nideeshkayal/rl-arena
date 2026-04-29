"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  rightSlot?: React.ReactNode;
}

export function Nav({ rightSlot }: NavProps) {
  const pathname = usePathname();
  const onLanding = pathname === "/";

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        height: 60,
        background: "white",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            background: "var(--color-primary)",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 14 L7 8 L11 11 L15 4 L17 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="17" cy="6" r="2" fill="#10B981" />
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-ink)" }}>
          RL Arena
        </span>
      </Link>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {rightSlot ?? (
          <>
            <Link href="/learn" style={{ fontSize: 13, fontWeight: 600, color: pathname === "/learn" ? "var(--color-primary)" : "var(--color-ink-3)" }}>
              Learn RL
            </Link>
            {onLanding ? (
              <Link
                href="/play"
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Enter Arena
              </Link>
            ) : null}
          </>
        )}
      </div>
    </nav>
  );
}
