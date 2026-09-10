"use client";

export default function TitleChrome() {
  return (
    <div className="pointer-events-none fixed left-4 top-4 z-20">
      <img
        src="/loogans-bluff.png"
        alt="Loogans Bluff"
        className="h-[160px] w-[160px] object-contain drop-shadow-lg"
      />
    </div>
  );
}
