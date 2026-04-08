import Link from "next/link";

import { featuredLawyers } from "../components/mock-data";

const platformSignals = [
  "Identity pages with custom-domain readiness",
  "Search metadata structured for local SEO and lead routing",
  "Consultation booking, payment placeholders, and trust signals designed into the profile surface",
  "Social feed, follow graph, short-video surfaces, and AI-assisted creator tools now wired into the product",
  "Phase 4 communication stack with inbox, call rooms, groups, file sharing, and lawyer referrals",
  "Phase 5 AI layer for research suggestions, judgment summaries, term explanations, insights, and drafting",
  "Phase 6 workspace with case tracking, document storage, invoices, analytics, and local Ollama-backed workflow support"
];

const mvpTracks = [
  {
    title: "Identity Engine",
    body: "Every lawyer gets a profile that behaves like a polished personal website, not a generic directory listing."
  },
  {
    title: "Discovery Layer",
    body: "Search-ready cards, city metadata, and practice tagging form the base for future client acquisition."
  },
  {
    title: "Trust Framework",
    body: "Ratings, achievements, visibility controls, and verification hooks are part of the core model from day one."
  },
  {
    title: "Social Branding",
    body: "Lawyers can now build audience with posts, reels-style legal tips, and AI-assisted content publishing."
  },
  {
    title: "Communication Layer",
    body: "The platform now supports live messaging, call-room setup, practice groups, and referral coordination."
  },
  {
    title: "AI Intelligence",
    body: "A local-first legal workbench now handles research direction, summaries, explanations, and drafting."
  },
  {
    title: "Professional Tools",
    body: "Cases, documents, invoices, and analytics now make the product part of the daily workflow."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-ink text-sand">
      <div className="absolute inset-0 -z-10 bg-grid bg-[size:42px_42px] opacity-20" />
      <div className="absolute left-1/2 top-0 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-bronze/20 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-8 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-mist/70">Lexevo</p>
            <p className="mt-2 max-w-md text-sm text-mist/75">
              Legal identity, discovery, client growth, and audience-building for the next generation of law practice.
            </p>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/onboarding" className="button-secondary">
              View onboarding
            </Link>
            <Link href="/find-lawyers" className="button-secondary">
              Find lawyers
            </Link>
            <Link href="/network" className="button-secondary">
              Social feed
            </Link>
            <Link href="/messages" className="button-secondary">
              Messages
            </Link>
            <Link href="/admin" className="button-secondary">
              Admin
            </Link>
            <Link href="/ai-workbench" className="button-secondary">
              AI
            </Link>
            <Link href="/workspace" className="button-secondary">
              Workspace
            </Link>
            <Link href="/lawyers/adv-isha-reddy" className="button-primary">
              Open profile preview
            </Link>
          </nav>
        </header>

        <section className="grid gap-10 pb-20 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="eyebrow">Phase 6 workspace live</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">
              A legal platform where every lawyer owns a premium digital identity, audience engine, communication layer, AI workbench, and daily workspace.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-mist/80">
              Designed to merge the discoverability of a marketplace, the authority of a personal website,
              and the network effects of a professional graph without flattening lawyers into commodity listings.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/onboarding" className="button-primary">
                Start onboarding flow
              </Link>
              <Link href="/find-lawyers" className="button-secondary">
                Browse lawyer discovery
              </Link>
              <Link href="/creator-studio" className="button-secondary">
                Open creator studio
              </Link>
              <Link href="/network" className="button-secondary">
                Explore social feed
              </Link>
              <Link href="/messages" className="button-secondary">
                Open message center
              </Link>
              <Link href="/admin" className="button-secondary">
                Open admin
              </Link>
              <Link href="/groups" className="button-secondary">
                Open practice groups
              </Link>
              <Link href="/ai-workbench" className="button-secondary">
                Open AI workbench
              </Link>
              <Link href="/workspace" className="button-secondary">
                Open workspace
              </Link>
              <a href="#featured-lawyers" className="button-secondary">
                Explore featured profiles
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <article className="metric-card">
                <p className="metric-value">06</p>
                <p className="metric-label">MVP phases live locally</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">36</p>
                <p className="metric-label">Product routes and APIs</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">09</p>
                <p className="metric-label">Roadmap phases preserved in docs</p>
              </article>
            </div>
          </div>

          <aside className="panel relative overflow-hidden p-8 shadow-halo">
            <div className="absolute right-6 top-6 h-24 w-24 rounded-full border border-bronze/30 bg-bronze/10 blur-sm" />
            <p className="eyebrow">Why this foundation matters</p>
            <div className="mt-6 space-y-5">
              {platformSignals.map((signal) => (
                <div key={signal} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm leading-7 text-mist/85">{signal}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="section-shell">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Product pillars</p>
              <h2 className="section-heading">Built for identity first, not feature sprawl first.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-mist/75">
              The first release focuses on reputation, discoverability, conversion, and audience-building so later phases
              can extend into communication, AI assistance, and workflow tooling.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-7">
            {mvpTracks.map((track) => (
              <article key={track.title} className="feature-card">
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">{track.title}</p>
                <p className="mt-4 text-lg leading-8 text-sand/90">{track.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="featured-lawyers" className="section-shell">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Profile previews</p>
            <h2 className="section-heading">Lawyer profiles that read like polished legal brands.</h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {featuredLawyers.map((lawyer) => (
              <Link key={lawyer.handle} href={`/lawyers/${lawyer.handle}`} className="feature-card group">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-3xl text-sand">{lawyer.fullName}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.25em] text-bronze">{lawyer.city}</p>
                  </div>
                  <span className="rounded-full border border-bronze/30 px-3 py-1 text-xs text-bronze">
                    {lawyer.averageRating.toFixed(1)} / 5
                  </span>
                </div>
                <p className="mt-6 text-sm leading-7 text-mist/80">{lawyer.headline}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {lawyer.practiceAreas.map((area) => (
                    <span key={area} className="tag">
                      {area}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-7 text-sand/85">&quot;{lawyer.featuredReview}&quot;</p>
                <p className="mt-6 text-xs uppercase tracking-[0.3em] text-mist/60 transition group-hover:text-sand">
                  Open public profile
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
