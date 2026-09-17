"use client";

import { useEffect, useState } from "react";

type PublicEconomyStats = {
  ownedCount: number;
  treasuryLoogansUi: string | null;
};

function formatLoogans(value: string) {
  const [whole, fraction = ""] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export default function EconomyFooter() {
  const [stats, setStats] = useState<PublicEconomyStats | null>(null);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const response = await fetch("/api/economy/public", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as PublicEconomyStats;
        if (active) setStats(payload);
      } catch {
        // Keep the last successful public snapshot if a refresh fails.
      }
    };

    void loadStats();
    const timer = window.setInterval(loadStats, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-0.5 whitespace-nowrap text-[10px] font-semibold text-slate-300 sm:bottom-0 sm:left-3 sm:translate-x-0 sm:flex-row sm:gap-4">
      <span>PLAYER-OWNED ASSETS: {stats?.ownedCount ?? "—"}</span>
      <span>
        TREASURY: {stats ? (stats.treasuryLoogansUi ? `${formatLoogans(stats.treasuryLoogansUi)} $LOOGANS` : "UNAVAILABLE") : "—"}
      </span>
    </div>
  );
}
