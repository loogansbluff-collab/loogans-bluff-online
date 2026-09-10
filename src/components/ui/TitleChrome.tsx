"use client";

export default function TitleChrome() {
  return (
    <div className="pointer-events-none fixed left-4 top-4 z-20 flex items-center gap-3">
      <img
        src="/loogans-bluff.png"
        alt="Loogans Bluff"
        className="h-16 w-16 object-contain drop-shadow-lg sm:h-20 sm:w-20"
      />
      <div className="leading-none drop-shadow-lg">
        <div className="text-xl font-black tracking-wide text-red-900 sm:text-2xl">LOOGANS</div>
        <div className="mt-1 text-xl font-black tracking-wide text-blue-950 sm:text-2xl">BLUFF</div>
      </div>
    </div>
  );
}
