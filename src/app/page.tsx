import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Organic blobs */}
      <div className="blob blob-ruby -top-64 -left-32 opacity-60"></div>
      <div className="blob blob-green bottom-32 -right-48 opacity-40"></div>

      {/* Hero */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            {/* Logo */}
            <Image
              src="/logo.png"
              alt="Employly - Build Success"
              width={280}
              height={80}
              className="mb-8"
              priority
            />

            {/* Headline */}
            <h1 className="mb-6">
              <span className="text-[var(--cream)] block">Find work that</span>
              <span className="gradient-text">actually fits.</span>
            </h1>

            {/* Sub */}
            <p className="text-[var(--stone)] text-lg max-w-md mb-10 leading-relaxed">
              AI matches your skills to roles. Blockchain verifies every payment.
              No noise, just opportunities.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/auth/register" className="btn-primary">
                Get started free
              </Link>
              <Link href="/jobs" className="btn-secondary">
                Browse jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="divider max-w-3xl mx-auto"></div>

      {/* How it works */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="mb-12">
            <span className="label text-[var(--ruby)]">How It Works</span>
            <h2 className="text-[var(--cream)] mt-2">
              Three steps. Done.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-[var(--ruby)] flex items-center justify-center text-white font-bold text-sm">1</span>
              </div>
              <h3 className="text-[var(--cream)] mb-2">Create profile</h3>
              <p className="text-[var(--ash)] text-sm leading-relaxed">
                Add your skills and connect your wallet. Takes 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-[var(--parrot)] flex items-center justify-center text-[var(--ink)] font-bold text-sm">2</span>
              </div>
              <h3 className="text-[var(--cream)] mb-2">AI analyzes</h3>
              <p className="text-[var(--ash)] text-sm leading-relaxed">
                GPT extracts your skills and scores you against open roles.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center text-[var(--ink)] font-bold text-sm">3</span>
              </div>
              <h3 className="text-[var(--cream)] mb-2">Get matched</h3>
              <p className="text-[var(--ash)] text-sm leading-relaxed">
                See compatibility scores. Apply with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-5">
            {/* AI */}
            <div className="card p-7">
              <div className="w-11 h-11 rounded-xl bg-[var(--ruby)]/15 flex items-center justify-center mb-5">
                <span className="text-xl">🧠</span>
              </div>
              <h3 className="text-[var(--cream)] text-lg mb-2">AI Skill Matching</h3>
              <p className="text-[var(--ash)] text-sm leading-relaxed">
                Not keyword matching. Actual understanding of what you know
                and what roles need.
              </p>
            </div>

            {/* Web3 */}
            <div className="card p-7">
              <div className="w-11 h-11 rounded-xl bg-[var(--parrot)]/15 flex items-center justify-center mb-5">
                <span className="text-xl">⛓</span>
              </div>
              <h3 className="text-[var(--cream)] text-lg mb-2">Blockchain Verified</h3>
              <p className="text-[var(--ash)] text-sm leading-relaxed">
                Every job post is verified on Polygon. Low fees, full transparency.
              </p>
            </div>

            {/* Interview Prep */}
            <div className="card p-7">
              <div className="w-11 h-11 rounded-xl bg-[var(--gold)]/15 flex items-center justify-center mb-5">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-[var(--cream)] text-lg mb-2">Interview Prep</h3>
              <p className="text-[var(--ash)] text-sm leading-relaxed">
                Get AI-generated questions tailored to each role and your skill gaps.
              </p>
            </div>

            {/* Community */}
            <div className="card p-7">
              <div className="w-11 h-11 rounded-xl bg-[var(--ruby)]/15 flex items-center justify-center mb-5">
                <span className="text-xl">💬</span>
              </div>
              <h3 className="text-[var(--cream)] text-lg mb-2">Community Feed</h3>
              <p className="text-[var(--ash)] text-sm leading-relaxed">
                Share wins, get advice, connect with others in your field.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider max-w-3xl mx-auto"></div>

      {/* CTA */}
      <section className="py-16 relative">
        <div className="max-w-xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-[var(--cream)] mb-4">
            Ready to find your match?
          </h2>
          <p className="text-[var(--ash)] mb-8">
            Free to use. No credit card required.
          </p>
          <Link href="/auth/register" className="btn-primary text-base px-8 py-3.5">
            Create your profile
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--charcoal)] py-8 mt-8">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Image
              src="/logo.png"
              alt="Employly"
              width={120}
              height={35}
              className="h-8 w-auto object-contain"
            />

            <div className="flex items-center gap-6 text-sm text-[var(--ash)]">
              <Link href="/jobs" className="hover:text-[var(--cream)] transition-colors">Jobs</Link>
              <Link href="/feed" className="hover:text-[var(--cream)] transition-colors">Community</Link>
            </div>

            <p className="text-xs text-[var(--smoke)]">
              AI × Web3
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
