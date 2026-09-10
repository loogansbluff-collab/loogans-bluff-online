import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← Back to Loogans Bluff</Link>
        <h1 className="mt-6 text-3xl font-bold">Terms of Use</h1>
        <p className="mt-6 text-slate-300">Terms of Use content will be added here.</p>
      </div>
    </main>
  );
}
