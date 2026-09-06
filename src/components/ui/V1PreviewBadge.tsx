"use client";

export default function V1PreviewBadge() {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-20 max-w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-white/10 bg-slate-950/85 px-3 py-2 text-right text-white shadow-lg backdrop-blur-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-200">Explore V1</div>
      <div className="mt-0.5 text-[11px] text-slate-400">Walking the town is live. Ownership coming soon.</div>
    </div>
  );
}
