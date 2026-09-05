"use client";

export default function TitleChrome() {
  return (
    <div className="pointer-events-none fixed left-4 top-4 z-20 rounded bg-slate-950/75 px-4 py-3 text-white shadow-lg backdrop-blur-sm">
      <h1 className="text-lg font-bold tracking-[0.18em] sm:text-xl">LOOGANS BLUFF ONLINE</h1>
      <p className="mt-1 text-xs text-slate-300 sm:text-sm">A town on the rise.</p>
    </div>
  );
}
