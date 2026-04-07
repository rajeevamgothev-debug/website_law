import Link from "next/link";
import { notFound } from "next/navigation";

import { FollowLawyerButton } from "../../../components/follow-lawyer-button";
import { featuredLawyers, profileByHandle } from "../../../components/mock-data";

export function generateStaticParams() {
  return featuredLawyers.map((lawyer) => ({ handle: lawyer.handle }));
}

export default function LawyerProfilePage({
  params
}: {
  params: { handle: string };
}) {
  const profile = profileByHandle[params.handle];

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="button-secondary">
            Back to platform overview
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/find-lawyers" className="button-secondary">
              Back to discovery
            </Link>
            <p className="text-xs uppercase tracking-[0.28em] text-mist/65">Custom-domain ready profile</p>
          </div>
        </div>

        <section className="panel mt-8 overflow-hidden p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="eyebrow">{profile.city}</p>
              <h1 className="mt-3 font-display text-6xl leading-none">{profile.fullName}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-mist/80">{profile.headline}</p>
              <p className="mt-6 max-w-3xl text-sm leading-8 text-sand/85">{profile.bio}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {profile.practiceAreas.map((area) => (
                  <span key={area} className="tag">
                    {area}
                  </span>
                ))}
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <article className="metric-card">
                  <p className="metric-value">{profile.experienceYears}y</p>
                  <p className="metric-label">Experience</p>
                </article>
                <article className="metric-card">
                  <p className="metric-value">{profile.averageRating.toFixed(1)}</p>
                  <p className="metric-label">Average rating</p>
                </article>
                <article className="metric-card">
                  <p className="metric-value">INR {profile.consultationFeeInr}</p>
                  <p className="metric-label">Consultation fee</p>
                </article>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/consultations/${profile.handle}`} className="button-primary">
                  Book consultation
                </Link>
                <Link href="/messages" className="button-secondary">
                  Message lawyer
                </Link>
                <Link href="/messages" className="button-secondary">
                  Request call
                </Link>
                <FollowLawyerButton handle={profile.handle} />
                <Link href={`/network?author=${encodeURIComponent(profile.handle)}`} className="button-secondary">
                  Open social feed
                </Link>
                <Link href="/creator-studio" className="button-secondary">
                  Open creator studio
                </Link>
                <Link href={`/find-lawyers/city/${encodeURIComponent(profile.city)}`} className="button-secondary">
                  Explore {profile.city}
                </Link>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Contact options</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.contactChannels.map((channel) => (
                  <span key={channel} className="tag">
                    {channel}
                  </span>
                ))}
              </div>
              <div className="mt-6 space-y-3 text-sm text-mist/80">
                <p>Office: {profile.visibility.showOfficeAddress ? profile.officeAddress : "Hidden by privacy settings"}</p>
                <p>Languages: {profile.languages.join(", ")}</p>
                <p>Courts: {profile.courtsHandled.join(", ")}</p>
              </div>
              <div className="mt-6 rounded-3xl border border-bronze/20 bg-bronze/10 p-4 text-sm text-sand/90">
                <p className="font-medium">{profile.leadOffer}</p>
                <p className="mt-2 text-mist/75">
                  Response time: {profile.responseTimeLabel}. Contact fields, office details, and portfolio sections can
                  be selectively exposed per lawyer.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Portfolio</p>
            <div className="mt-6 grid gap-4">
              {profile.portfolio.map((item) => (
                <article key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-display text-3xl text-sand">{item.title}</p>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-mist/70">
                      {item.type}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-mist/80">{item.summary}</p>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Skills</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Achievements</p>
              <div className="mt-5 space-y-3">
                {profile.achievements.map((achievement) => (
                  <div key={achievement} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-sand/85">
                    {achievement}
                  </div>
                ))}
              </div>
            </section>

            <section className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Client reviews</p>
              <div className="mt-5 space-y-4">
                {profile.reviews.map((review) => (
                  <article key={`${review.reviewer}-${review.quote}`} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm leading-7 text-sand/85">&quot;{review.quote}&quot;</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.25em] text-mist/65">
                      {review.reviewer} | {review.role} | {review.rating}/5
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Availability</p>
              <div className="mt-5 grid gap-3">
                {profile.availability.map((window) => (
                  <div key={window.day} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
                    <span className="font-medium text-sand">{window.day}</span>
                    <span className="text-mist/75">{window.slots.join(" | ")}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
