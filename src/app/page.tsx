import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8">
          <span className="text-5xl">📍</span>
        </div>
        <h1 className="text-4xl font-extrabold text-text-primary mb-4 leading-tight">
          It&apos;s 11pm.<br />
          <span className="text-accent-primary">Where can you actually go?</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-md mb-8">
          Real-time, crowdsourced data on what&apos;s actually open near UK universities.
          Study spaces, cafes, late-night food — verified by students.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link
            href="/signup"
            className="w-full py-3.5 bg-accent-primary text-bg-primary rounded-full text-sm font-bold
              hover:opacity-90 transition-opacity text-center"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full py-3.5 border border-border-subtle text-text-secondary rounded-full text-sm font-medium
              hover:border-border-hover transition-colors text-center"
          >
            Log In
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="px-6 py-16 max-w-lg mx-auto w-full">
        <div className="space-y-8">
          <Feature
            emoji="🗺️"
            title="Real-time map"
            description="See what's open right now near you with live, colour-coded pins."
          />
          <Feature
            emoji="✅"
            title="Crowdsourced verification"
            description="Students check in to confirm if places are actually open. No more wrong Google hours."
          />
          <Feature
            emoji="🌙"
            title="Built for late nights"
            description="Find 24-hour spots, late-night cafes, and study spaces when you need them most."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Where&apos;s Open? — For UK university students.
        </p>
      </footer>
    </div>
  );
}

function Feature({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
