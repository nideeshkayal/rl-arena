"use client";

import { Suspense } from "react";
import { PlayClient } from "./PlayClient";

export default function PlayPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}>
      <PlayClient />
    </Suspense>
  );
}
