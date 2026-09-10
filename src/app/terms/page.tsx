import Link from "next/link";

const sections = [
  {
    title: "Acceptance of Terms",
    body: [
      "By accessing or using LoogansBluff.online, you agree to these Terms of Use. If you do not agree, please do not use the website or game.",
    ],
  },
  {
    title: "Entertainment Purpose",
    body: [
      "Loogans Bluff Online is provided for entertainment purposes. The website, game world, features, content, mechanics, availability, and functionality may be changed, updated, suspended, or removed at any time without notice.",
    ],
  },
  {
    title: "Use at Your Own Risk",
    body: [
      "You use LoogansBluff.online at your own risk. We do not guarantee that the website or game will always be available, error-free, secure, uninterrupted, accurate, or compatible with every device, browser, wallet, network, or third-party service.",
    ],
  },
  {
    title: "No Financial or Legal Advice",
    body: [
      "Nothing on LoogansBluff.online constitutes financial, investment, trading, legal, tax, or accounting advice. You are solely responsible for your own decisions, transactions, wallet activity, security, taxes, and compliance with applicable laws.",
    ],
  },
  {
    title: "Digital Assets and Volatility",
    body: [
      "Any cryptocurrency, token, blockchain asset, or other digital asset associated with or referenced through Loogans Bluff may be highly volatile. Prices can rise or fall rapidly, liquidity can change, transactions may be irreversible, and digital assets may lose some or all of their value.",
    ],
  },
  {
    title: "Limitation of Responsibility",
    body: [
      "Loogans Bluff is not responsible for losses caused by market volatility, user error, wallet compromise, lost passwords, lost seed phrases, blockchain failures, network congestion, smart-contract issues, third-party services, phishing, scams, hacks, downtime, failed transactions, incorrect addresses, or actions taken by users or third parties.",
    ],
  },
  {
    title: "Security Reminder",
    body: [
      "Never share your private keys, seed phrase, passwords, or other sensitive credentials with anyone claiming to represent Loogans Bluff. Loogans Bluff will never ask for your seed phrase or private keys.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "LoogansBluff.online may link to or interact with third-party websites, wallets, blockchain networks, social-media platforms, APIs, or other external services. These services operate independently and are subject to their own terms and privacy policies. Loogans Bluff does not control and is not responsible for their content, security, availability, conduct, or performance.",
    ],
  },
  {
    title: "Acceptable Use",
    body: [
      "You agree not to misuse the website or game. Prohibited conduct includes attempting to disrupt or damage the service, exploit bugs, cheat, interfere with other users, impersonate others, scrape or automate access in an abusive manner, introduce malicious code, conduct fraud, or use the service for unlawful purposes.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "All Loogans Bluff characters, names, branding, artwork, stories, graphics, game content, website design, code, and other original materials are owned by or licensed to Loogans Bluff unless otherwise stated. You may not copy, reproduce, redistribute, sell, modify, or commercially exploit protected content without permission.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, Loogans Bluff and its operators will not be liable for indirect, incidental, special, consequential, punitive, financial, trading, investment, or other losses arising from use of or inability to use LoogansBluff.online.",
    ],
  },
  {
    title: "Compliance With Local Laws",
    body: [
      "You are responsible for determining whether your use of the website, game, blockchain technology, cryptocurrency, or related services is lawful in your jurisdiction.",
    ],
  },
  {
    title: "Changes to These Terms",
    body: [
      "These Terms may be updated as LoogansBluff.online develops. The latest version will be posted on this page with an updated date.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          ← Back to Loogans Bluff
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Terms of Use</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: September 10, 2026</p>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-7 text-slate-300">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="mt-3 leading-7 text-slate-300">For questions regarding these Terms, contact:</p>
            <p className="mt-3 leading-7 text-slate-300">
              <strong className="text-slate-100">X:</strong> @LoogansBluff
              <br />
              <strong className="text-slate-100">Website:</strong> LoogansBluff.online
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
