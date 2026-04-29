import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RL Arena — Can you beat Reinforcement Learning?",
  description:
    "A browser-based stock market battle simulator. Trade against 5 AI bots, each trained with a different reward function. Learn how RL agents think — by beating them.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
