import React, { Suspense } from "react";
import { UnifiedCanvas } from "@/components/UnifiedCanvas";

/**
 * StrategyOS 2.0: Unified Canvas
 * 
 * We have deprecated the widget-heavy "Command Center" in favor of
 * a minimalist, intent-based writing studio.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--stitch-background,#080a0f)]">
      <Suspense fallback={<div className="min-h-screen bg-[var(--stitch-background,#080a0f)]" />}>
        <UnifiedCanvas />
      </Suspense>
    </main>
  );
}
