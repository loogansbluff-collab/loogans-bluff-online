import Link from "next/link";

export default function LegalLinks() {
  return (
    <div className="fixed bottom-1 left-1/2 z-40 -translate-x-1/2 text-[10px] text-slate-400">
      <Link href="/privacy" className="hover:text-white">Privacy</Link>
      <span className="px-1.5">|</span>
      <Link href="/terms" className="hover:text-white">Terms</Link>
    </div>
  );
}
