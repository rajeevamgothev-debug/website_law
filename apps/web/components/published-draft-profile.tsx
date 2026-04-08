"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { clearDraft, readDraft, type OnboardingDraft } from "./onboarding-storage";
import { DraftProfilePreview } from "./draft-profile-preview";

function fallbackCopyText(value: string) {
  const textArea = document.createElement("textarea");

  textArea.value = value;
  textArea.setAttribute("readonly", "true");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";

  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand("copy");

  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error("Document copy command was rejected.");
  }
}

export function PublishedDraftProfile({ handle }: { handle: string }) {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const savedDraft = readDraft();
    setDraft(savedDraft);
    setLoaded(true);
  }, []);

  async function copyLink(value: string, message: string) {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        fallbackCopyText(value);
      }

      setStatusMessage(message);
    } catch (error) {
      console.error("Failed to copy published profile link.", {
        value,
        error
      });
      setStatusMessage("Clipboard access failed in this browser.");
    }
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-ink px-6 py-10 text-sand sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="panel p-8">
            <p className="text-sm text-mist/75">Loading published preview...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!draft || draft.profileHandle !== handle) {
    return (
      <main className="min-h-screen bg-ink px-6 py-10 text-sand sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="panel p-8">
            <p className="eyebrow">Preview unavailable</p>
            <h1 className="mt-3 font-display text-5xl">This draft preview is not available in browser storage.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-mist/75">
              Publish again from profile setup to recreate the local preview payload.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/onboarding" className="button-primary">
                Restart onboarding
              </Link>
              <Link href="/onboarding/profile-setup" className="button-secondary">
                Back to profile setup
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const publicSubdomain = `${draft.profileHandle}.lexevo.in`;

  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-sand sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Published locally</p>
            <h1 className="section-heading max-w-3xl">
              The Phase 1 profile is now available as a shareable local preview and printable resume.
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-7 text-mist/75">
            This still uses browser-local data, but it now behaves like a finished identity prototype with share and
            export actions.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Public routes</p>
            <div className="mt-5 grid gap-3 text-sm text-mist/80">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                Preview URL: <span className="text-sand">{`http://127.0.0.1:3001/preview/${draft.profileHandle}`}</span>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                Resume URL: <span className="text-sand">{`http://127.0.0.1:3001/resume/${draft.profileHandle}`}</span>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                Subdomain concept: <span className="text-sand">{publicSubdomain}</span>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                Custom domain: <span className="text-sand">{draft.customDomain || "Not configured"}</span>
              </div>
            </div>
          </div>

          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Actions</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/onboarding/profile-setup" className="button-primary">
                Edit profile setup
              </Link>
              <Link href={`/resume/${draft.profileHandle}`} className="button-secondary">
                Open resume export
              </Link>
              <button
                className="button-secondary"
                type="button"
                onClick={() => copyLink(window.location.href, "Preview link copied.")}
              >
                Copy preview link
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => copyLink(publicSubdomain, "Subdomain concept copied.")}
              >
                Copy subdomain
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => {
                  clearDraft();
                  setDraft(null);
                }}
              >
                Clear local draft
              </button>
            </div>
            {statusMessage ? <p className="mt-4 text-sm text-emerald-300">{statusMessage}</p> : null}
          </div>
        </div>

        <div className="mt-8">
          <DraftProfilePreview draft={draft} />
        </div>
      </div>
    </main>
  );
}
