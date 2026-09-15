"use client";

import { useState } from "react";
import { propertyAssetCatalog } from "@/data/propertyAssetCatalog";
import { shortWallet } from "@/lib/phantom";

export type DashboardPlayer = {
  id: string;
  walletAddress: string;
  createdAt: string;
  propertyAssetsCollected: number;
  propertyAssetsTotal: number;
};

type PlayerDashboardProps = {
  player: DashboardPlayer;
  onClose: () => void;
};

const FUTURE_SECTIONS = [
  "Vehicles",
  "Collectibles",
  "Equipment",
  "Event Assets",
  "Private Property",
];

export default function PlayerDashboard({ player, onClose }: PlayerDashboardProps) {
  const [propertyAssetsOpen, setPropertyAssetsOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <section className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-emerald-400/30 bg-slate-950/95 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Player Dashboard</p>
            <h2 className="mt-1 text-2xl font-bold">Player #{player.id}</h2>
            <p className="mt-1 font-mono text-sm text-slate-300">{shortWallet(player.walletAddress)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700"
          >
            CLOSE
          </button>
        </div>

        {propertyAssetsOpen ? (
          <div className="flex min-h-0 flex-1 flex-col p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Property Assets</h3>
                <p className="mt-1 text-sm text-slate-300">Collectible assets tied to shared town locations.</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-300">0 / {propertyAssetCatalog.length}</p>
                <p className="text-xs uppercase tracking-wider text-slate-400">collected</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/55">
              {propertyAssetCatalog.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0"
                >
                  <span aria-hidden="true" className="text-xl text-slate-500">□</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{asset.name}</p>
                    <p className="truncate text-xs text-slate-400">{asset.id}</p>
                  </div>
                  <div className="hidden text-right text-xs text-slate-400 sm:block">
                    <p>{asset.width} × {asset.height} × {asset.depth}</p>
                    <p>Volume {asset.volume.toFixed(1)}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Uncollected</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPropertyAssetsOpen(false)}
                className="rounded-lg border border-white/15 bg-slate-800 px-4 py-2 text-sm font-bold hover:bg-slate-700"
              >
                BACK TO DASHBOARD
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold hover:bg-emerald-600"
              >
                BACK TO TOWN
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto p-5">
            <button
              type="button"
              onClick={() => setPropertyAssetsOpen(true)}
              className="w-full rounded-xl border border-emerald-400/25 bg-emerald-950/20 p-4 text-left hover:bg-emerald-950/35"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Property Assets</h3>
                  <p className="text-sm text-slate-300">Commercial collectible assets</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-300">
                    {player.propertyAssetsCollected} / {propertyAssetCatalog.length}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-slate-400">collected</p>
                </div>
              </div>
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              {FUTURE_SECTIONS.map((label) => (
                <div key={label} className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
                  <h3 className="font-semibold">{label}</h3>
                  <p className="mt-1 text-sm text-slate-400">Coming later</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold hover:bg-emerald-600"
              >
                BACK TO TOWN
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
