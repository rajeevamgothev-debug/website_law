import type { ReactNode } from "react";

import {
  parseCommaOrLineList,
  parseList,
  parseReviewEntries,
  sectionLabels,
  type OnboardingDraft,
  type PublicSectionId
} from "./onboarding-storage";

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "LP";
}

function formatChannel(channel: string) {
  return channel.charAt(0).toUpperCase() + channel.slice(1);
}

function renderBulletList(items: string[]) {
  if (items.length === 0) {
    return <p className="text-sm text-mist/60">Nothing added yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-sand/85">
          {item}
        </div>
      ))}
    </div>
  );
}

function SectionShell({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-bronze">{title}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function DraftProfilePreview({
  draft,
  compact = false
}: {
  draft: OnboardingDraft;
  compact?: boolean;
}) {
  const languages = parseCommaOrLineList(draft.languagesText || draft.primaryLanguage);
  const skills = parseCommaOrLineList(draft.skillsText);
  const courtsHandled = parseList(draft.courtsHandledText);
  const firmHistory = parseList(draft.firmHistoryText);
  const caseHighlights = parseList(draft.caseHighlightsText);
  const achievements = parseList(draft.achievementsText);
  const articles = parseList(draft.articlesText);
  const videos = parseList(draft.videosText);
  const reviews = parseReviewEntries(draft.reviewsText);
  const publishedDate = draft.publishedAt
    ? new Date(draft.publishedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  const orderedSections = draft.sectionOrder.filter((section) => draft.sectionVisibility[section]);

  const sectionContent: Record<PublicSectionId, React.ReactNode> = {
    practiceAreas: (
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {draft.practiceAreas.length > 0 ? (
            draft.practiceAreas.map((area) => (
              <span key={area} className="tag">
                {area}
              </span>
            ))
          ) : (
            <span className="tag">Practice areas pending</span>
          )}
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-mist/80">
          <p>Primary language: {draft.primaryLanguage || "English"}</p>
          <p className="mt-2">Additional languages: {languages.join(", ") || "Not added yet"}</p>
        </div>
      </div>
    ),
    skills: renderBulletList(skills),
    experience: (
      <div className="grid gap-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-3xl font-semibold text-sand">{draft.experienceYears || 0} years</p>
          <p className="mt-2 text-sm text-mist/70">Practice experience</p>
        </div>
        <div>
          <p className="mb-3 text-sm text-mist/70">Firm history</p>
          {renderBulletList(firmHistory)}
        </div>
        <div>
          <p className="mb-3 text-sm text-mist/70">Courts handled</p>
          {renderBulletList(courtsHandled)}
        </div>
      </div>
    ),
    office: (
      <div className="space-y-4 text-sm leading-7 text-mist/80">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-sand">{draft.visibility.showOfficeAddress ? draft.officeAddress || "Office address pending" : "Office address hidden"}</p>
        </div>
        {draft.visibility.showLiveLocation && draft.liveLocationUrl ? (
          <a
            href={draft.liveLocationUrl}
            target="_blank"
            rel="noreferrer"
            className="button-secondary"
          >
            Open live location
          </a>
        ) : (
          <p className="text-mist/60">Live location is hidden or not configured.</p>
        )}
      </div>
    ),
    contact: (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {draft.contactChannels.map((channel) => (
            <span key={channel} className="tag">
              {formatChannel(channel)}
            </span>
          ))}
        </div>
        <div className="grid gap-3 text-sm text-mist/80">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            Email: {draft.visibility.showEmail ? draft.contactEmail || draft.phoneOrEmail || "Not added yet" : "Hidden"}
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            Phone: {draft.visibility.showPhone ? draft.contactPhone || "Not added yet" : "Hidden"}
          </div>
        </div>
      </div>
    ),
    portfolio: (
      <div className="grid gap-5">
        {draft.visibility.showCases ? (
          <div>
            <p className="mb-3 text-sm text-mist/70">Cases handled</p>
            {renderBulletList(caseHighlights)}
          </div>
        ) : (
          <p className="text-sm text-mist/60">Case highlights are hidden by privacy controls.</p>
        )}
        <div>
          <p className="mb-3 text-sm text-mist/70">Achievements</p>
          {renderBulletList(achievements)}
        </div>
        <div>
          <p className="mb-3 text-sm text-mist/70">Articles</p>
          {renderBulletList(articles)}
        </div>
        <div>
          <p className="mb-3 text-sm text-mist/70">Videos</p>
          {renderBulletList(videos)}
        </div>
      </div>
    ),
    reviews: (
      <div className="grid gap-4">
        <div className="rounded-[1.5rem] border border-bronze/20 bg-bronze/10 p-4">
          <p className="text-3xl font-semibold text-sand">{draft.averageRating.toFixed(1)} / 5</p>
          <p className="mt-2 text-sm text-mist/75">Average rating</p>
        </div>
        {draft.visibility.showReviews ? (
          reviews.length > 0 ? (
            reviews.map((review) => (
              <article key={`${review.reviewer}-${review.quote}`} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-7 text-sand/85">&quot;{review.quote}&quot;</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-mist/65">
                  {review.reviewer} · {review.role} · {review.rating}/5
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-mist/60">No reviews added yet.</p>
          )
        ) : (
          <p className="text-sm text-mist/60">Reviews are hidden by privacy controls.</p>
        )}
      </div>
    )
  };

  function renderSection(section: PublicSectionId) {
    if (section === "portfolio" && !draft.visibility.showPortfolio) {
      return <p className="text-sm text-mist/60">Portfolio is hidden by privacy controls.</p>;
    }

    return sectionContent[section];
  }

  return (
    <div className="panel overflow-hidden p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-5">
          {draft.profileImageDataUrl ? (
            <img
              src={draft.profileImageDataUrl}
              alt={draft.fullName || "Lawyer profile"}
              className="h-24 w-24 rounded-[1.75rem] border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-bronze/25 bg-bronze/10 font-display text-3xl text-bronze">
              {getInitials(draft.fullName)}
            </div>
          )}

          <div>
            <p className="eyebrow">{draft.city || "City pending"}</p>
            <h2 className="mt-3 font-display text-5xl leading-none text-sand">
              {draft.fullName || "Lawyer name"}
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-sand/85">
              {draft.headline || "Public profile headline"}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-mist/80">
              {draft.about || "A short public introduction will appear here after the lawyer adds profile copy."}
            </p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-mist/80 lg:min-w-[18rem]">
          <p className="text-xs uppercase tracking-[0.28em] text-bronze">Identity</p>
          <div className="mt-4 space-y-2">
            <p>Handle: @{draft.profileHandle || "pending-handle"}</p>
            <p>Subdomain: {draft.profileHandle || "handle"}.lexevo.in</p>
            <p>Custom domain: {draft.customDomain || "Not configured"}</p>
            <p>Photo: {draft.profileImageName || "Not added yet"}</p>
            {publishedDate ? <p>Published: {publishedDate}</p> : null}
          </div>
        </div>
      </div>

      <div className={`mt-8 grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        <div className="metric-card">
          <p className="metric-value">{draft.experienceYears || 0}y</p>
          <p className="metric-label">Experience</p>
        </div>
        <div className="metric-card">
          <p className="metric-value">{draft.averageRating.toFixed(1)}</p>
          <p className="metric-label">Average rating</p>
        </div>
        <div className="metric-card">
          <p className="metric-value">{languages.length || 1}</p>
          <p className="metric-label">Languages</p>
        </div>
      </div>

      {compact ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {orderedSections.slice(0, 4).map((section) => (
            <SectionShell key={section} title={sectionLabels[section]}>
              {renderSection(section)}
            </SectionShell>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-5">
          {orderedSections.map((section) => (
            <SectionShell key={section} title={sectionLabels[section]}>
              {renderSection(section)}
            </SectionShell>
          ))}
        </div>
      )}
    </div>
  );
}
