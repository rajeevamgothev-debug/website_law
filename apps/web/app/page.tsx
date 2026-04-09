import Link from "next/link";

import { featuredLawyers } from "../components/mock-data";

const primaryFlows = [
  {
    title: "Find a lawyer",
    body: "Search by city, practice area, and profile strength when a client needs the right counsel quickly.",
    href: "/find-lawyers",
    cta: "Open search"
  },
  {
    title: "Use the AI workbench",
    body: "Ask legal questions, summarize matters, draft output, and match the right lawyer from one screen.",
    href: "/ai-workbench",
    cta: "Open AI"
  },
  {
    title: "Run daily work",
    body: "Move from research into cases, notes, documents, and invoices without leaving the product.",
    href: "/workspace",
    cta: "Open workspace"
  },
  {
    title: "Manage the platform",
    body: "Open the protected admin surface for session-based access, metrics, and route coverage.",
    href: "/admin",
    cta: "Open admin"
  }
];

const productSignals = [
  {
    value: "06",
    label: "core modules",
    note: "Onboarding, discovery, network, messages, AI, and workspace are live."
  },
  {
    value: "36",
    label: "routes and APIs",
    note: "The app now spans public pages, action surfaces, and backend integrations."
  },
  {
    value: "Local",
    label: "AI option",
    note: "The platform can route legal AI requests through your Ollama-backed local model."
  },
  {
    value: "Clear",
    label: "navigation",
    note: "Each major task now has a direct entry point instead of a crowded dashboard feel."
  }
];

const productPillars = [
  {
    title: "Profiles",
    body: "Lawyer pages feel like branded legal websites instead of thin directory listings."
  },
  {
    title: "Discovery",
    body: "Search and city routing help clients reach relevant lawyers with less friction."
  },
  {
    title: "Social",
    body: "Posts, reels-style sharing, and creator tools support legal audience building."
  },
  {
    title: "Communication",
    body: "Messages, calls, groups, and referrals keep the platform useful after discovery."
  },
  {
    title: "AI",
    body: "Research, summaries, explanations, drafting, and lawyer matching sit in one workbench."
  },
  {
    title: "Workspace",
    body: "Cases, documents, invoices, and notes make the product part of daily legal work."
  }
];

const supportLinks = [
  { href: "/onboarding", label: "Onboard a lawyer" },
  { href: "/creator-studio", label: "Creator studio" },
  { href: "/network", label: "Social feed" },
  { href: "/messages", label: "Messages" },
  { href: "/groups", label: "Practice groups" },
  { href: "/lawyers/adv-isha-reddy", label: "Open sample profile" }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-ink text-sand">
      <div className="absolute inset-0 -z-10 bg-grid bg-[size:42px_42px] opacity-20" />
      <div className="absolute left-1/2 top-0 -z-10 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-bronze/20 blur-3xl sm:h-[36rem] sm:w-[36rem]" />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-8 sm:pb-24 sm:pt-8 lg:px-12">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-mist/70">Lexevo</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-mist/75">
              A legal platform for lawyer identity, client discovery, communication, AI assistance, and daily work.
            </p>
          </div>
          <nav className="grid w-full grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:w-auto">
            <Link href="/find-lawyers" className="button-secondary min-h-[3rem]">
              Find lawyers
            </Link>
            <Link href="/ai-workbench" className="button-secondary min-h-[3rem]">
              AI workbench
            </Link>
            <Link href="/workspace" className="button-secondary min-h-[3rem]">
              Workspace
            </Link>
            <Link href="/admin" className="button-primary min-h-[3rem]">
              Admin
            </Link>
          </nav>
        </header>

        <section className="grid gap-8 pb-16 pt-12 sm:gap-10 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="eyebrow">Clean start point</p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] text-sand sm:text-6xl lg:text-7xl">
              A clearer legal product where every main task has an obvious place to start.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-mist/80 sm:text-lg sm:leading-8">
              Use discovery to find a lawyer, the AI workbench to analyze a matter, the workspace to continue legal
              operations, and the admin area to manage the platform. The UI is structured so non-technical users can
              understand what each surface does.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/find-lawyers" className="button-primary min-h-[3.25rem]">
                Start with lawyer search
              </Link>
              <Link href="/ai-workbench" className="button-secondary min-h-[3.25rem]">
                Open AI workbench
              </Link>
              <Link href="/workspace" className="button-secondary min-h-[3.25rem]">
                Open workspace
              </Link>
              <a href="#featured-lawyers" className="button-secondary min-h-[3.25rem]">
                View sample profiles
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {productSignals.map((signal) => (
                <article key={signal.label} className="metric-card">
                  <p className="metric-value">{signal.value}</p>
                  <p className="metric-label">{signal.label}</p>
                  <p className="mt-3 text-sm leading-7 text-mist/75">{signal.note}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="panel p-6 sm:p-8">
            <p className="eyebrow">Choose where to go</p>
            <h2 className="mt-4 font-display text-3xl text-sand sm:text-4xl">The fastest way into each part of the product.</h2>
            <div className="mt-6 grid gap-4">
              {primaryFlows.map((flow) => (
                <Link key={flow.title} href={flow.href} className="feature-card">
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">{flow.cta}</p>
                  <p className="mt-4 font-display text-2xl text-sand">{flow.title}</p>
                  <p className="mt-3 text-sm leading-7 text-mist/80">{flow.body}</p>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="section-shell">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">What Is Live</p>
              <h2 className="section-heading">Six product areas now connect into one usable legal workflow.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-mist/75">
              The UI is no longer just a concept board. Search, messaging, AI, and workspace routes all connect to real
              product flows.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {productPillars.map((pillar) => (
              <article key={pillar.title} className="feature-card">
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">{pillar.title}</p>
                <p className="mt-4 text-lg leading-8 text-sand/90">{pillar.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Support Routes</p>
            <h2 className="section-heading">Every major button now points to a live surface.</h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {supportLinks.map((item) => (
              <Link key={item.href} href={item.href} className="button-secondary min-h-[3.25rem]">
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section id="featured-lawyers" className="section-shell">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Profile previews</p>
            <h2 className="section-heading">Sample lawyer profiles that show the public-facing quality bar.</h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredLawyers.map((lawyer) => (
              <Link key={lawyer.handle} href={`/lawyers/${lawyer.handle}`} className="feature-card group">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-display text-2xl text-sand sm:text-3xl">{lawyer.fullName}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.25em] text-bronze">{lawyer.city}</p>
                  </div>
                  <span className="w-fit rounded-full border border-bronze/30 px-3 py-1 text-xs text-bronze">
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
