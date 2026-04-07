"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { parseCommaOrLineList, parseList, parseReviewEntries, readDraft, type OnboardingDraft } from "./onboarding-storage";

export function ResumeView({ handle }: { handle: string }) {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDraft(readDraft());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <main className="min-h-screen bg-slate-100 px-6 py-10" />;
  }

  if (!draft || draft.profileHandle !== handle) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold">Resume preview unavailable</h1>
          <p className="mt-4 text-sm text-slate-600">
            Publish the profile from setup first so the local resume view has data to render.
          </p>
          <div className="mt-6">
            <Link href="/onboarding/profile-setup" className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm text-white">
              Back to profile setup
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const languages = parseCommaOrLineList(draft.languagesText || draft.primaryLanguage);
  const skills = parseCommaOrLineList(draft.skillsText);
  const courtsHandled = parseList(draft.courtsHandledText);
  const firms = parseList(draft.firmHistoryText);
  const cases = parseList(draft.caseHighlightsText);
  const achievements = parseList(draft.achievementsText);
  const articles = parseList(draft.articlesText);
  const videos = parseList(draft.videosText);
  const reviews = parseReviewEntries(draft.reviewsText);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:p-10 print:shadow-none">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Phase 1 resume export</p>
            <p className="mt-2 text-sm text-slate-600">Use browser print and save as PDF.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm text-white" type="button" onClick={() => window.print()}>
              Download PDF
            </button>
            <Link href={`/preview/${draft.profileHandle}`} className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm text-slate-900">
              Back to preview
            </Link>
          </div>
        </div>

        <header className="border-b border-slate-200 pb-8">
          <div className="flex items-start gap-5">
            {draft.profileImageDataUrl ? (
              <img src={draft.profileImageDataUrl} alt={draft.fullName} className="h-24 w-24 rounded-2xl object-cover" />
            ) : null}
            <div className="flex-1">
              <h1 className="text-4xl font-semibold">{draft.fullName}</h1>
              <p className="mt-3 text-lg text-slate-700">{draft.headline}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{draft.about}</p>
              <div className="mt-4 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                <p>{draft.city}</p>
                <p>{draft.visibility.showEmail ? draft.contactEmail || draft.phoneOrEmail : "Email hidden"}</p>
                <p>{draft.visibility.showPhone ? draft.contactPhone || "Phone not added" : "Phone hidden"}</p>
                <p>{languages.join(", ")}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 pt-8">
          <div>
            <h2 className="text-xs uppercase tracking-[0.25em] text-slate-500">Practice areas</h2>
            <p className="mt-3 text-sm leading-7">{draft.practiceAreas.join(", ")}</p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.25em] text-slate-500">Skills</h2>
            <p className="mt-3 text-sm leading-7">{skills.join(", ") || "Not added"}</p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.25em] text-slate-500">Experience</h2>
            <p className="mt-3 text-sm leading-7">{draft.experienceYears} years of practice</p>
            <div className="mt-3 grid gap-2 text-sm leading-7">
              {firms.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.25em] text-slate-500">Courts handled</h2>
            <div className="mt-3 grid gap-2 text-sm leading-7">
              {courtsHandled.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.25em] text-slate-500">Office</h2>
            <p className="mt-3 text-sm leading-7">
              {draft.visibility.showOfficeAddress ? draft.officeAddress : "Office address hidden"}
            </p>
          </div>

          {draft.visibility.showPortfolio ? (
            <div>
              <h2 className="text-xs uppercase tracking-[0.25em] text-slate-500">Portfolio</h2>
              <div className="mt-3 grid gap-2 text-sm leading-7">
                {draft.visibility.showCases
                  ? cases.map((item) => <p key={item}>Case: {item}</p>)
                  : <p>Cases hidden</p>}
                {achievements.map((item) => (
                  <p key={item}>Achievement: {item}</p>
                ))}
                {articles.map((item) => (
                  <p key={item}>Article: {item}</p>
                ))}
                {videos.map((item) => (
                  <p key={item}>Video: {item}</p>
                ))}
              </div>
            </div>
          ) : null}

          {draft.visibility.showReviews ? (
            <div>
              <h2 className="text-xs uppercase tracking-[0.25em] text-slate-500">Ratings and reviews</h2>
              <p className="mt-3 text-sm leading-7">Average rating: {draft.averageRating.toFixed(1)} / 5</p>
              <div className="mt-3 grid gap-3 text-sm leading-7">
                {reviews.map((review) => (
                  <div key={`${review.reviewer}-${review.quote}`}>
                    <p>{review.reviewer} | {review.role} | {review.rating}/5</p>
                    <p className="text-slate-600">{review.quote}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
