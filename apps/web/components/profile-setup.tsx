"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { DraftProfilePreview } from "./draft-profile-preview";
import {
  contactChannelOptions,
  defaultDraft,
  moveSection,
  readDraft,
  sectionLabels,
  slugifyHandle,
  withDerivedHandle,
  writeDraft,
  type OnboardingDraft,
  type PublicSectionId
} from "./onboarding-storage";

type VisibilityKey = keyof OnboardingDraft["visibility"];

export function ProfileSetup() {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedDraft = readDraft();
    setDraft(savedDraft ?? null);
    setLoading(false);
  }, []);

  function updateDraft<K extends keyof OnboardingDraft>(field: K, value: OnboardingDraft[K]) {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  }

  function toggleChannel(channel: (typeof contactChannelOptions)[number]) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const contactChannels = current.contactChannels.includes(channel)
        ? current.contactChannels.filter((item) => item !== channel)
        : [...current.contactChannels, channel];

      return {
        ...current,
        contactChannels
      };
    });
  }

  function toggleVisibility(setting: VisibilityKey) {
    setDraft((current) =>
      current
        ? {
            ...current,
            visibility: {
              ...current.visibility,
              [setting]: !current.visibility[setting]
            }
          }
        : current
    );
  }

  function toggleSection(section: PublicSectionId) {
    setDraft((current) =>
      current
        ? {
            ...current,
            sectionVisibility: {
              ...current.sectionVisibility,
              [section]: !current.sectionVisibility[section]
            }
          }
        : current
    );
  }

  function reorderSection(section: PublicSectionId, direction: "up" | "down") {
    setDraft((current) =>
      current
        ? {
            ...current,
            sectionOrder: moveSection(current.sectionOrder, section, direction)
          }
        : current
    );
  }

  function persist(nextDraft: OnboardingDraft) {
    const normalizedDraft = withDerivedHandle({
      ...nextDraft,
      profileHandle: slugifyHandle(nextDraft.profileHandle || nextDraft.fullName)
    });

    writeDraft(normalizedDraft);
    setDraft(normalizedDraft);
    return normalizedDraft;
  }

  function handleSave() {
    if (!draft) {
      return;
    }

    persist(draft);
    setStatusMessage("Phase 1 profile setup saved locally.");
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!draft || !file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage("Use an image smaller than 2 MB for this local prototype.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatusMessage("The selected image could not be read.");
        return;
      }

      const nextDraft = persist({
        ...draft,
        profileImageDataUrl: reader.result,
        profileImageName: file.name
      });

      setStatusMessage(`Profile image saved locally: ${nextDraft.profileImageName}`);
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleRemoveImage() {
    if (!draft) {
      return;
    }

    persist({
      ...draft,
      profileImageDataUrl: "",
      profileImageName: ""
    });
    setStatusMessage("Profile image removed.");
  }

  function handlePublish() {
    if (!draft) {
      return;
    }

    if (!draft.profileHandle.trim() && !draft.fullName.trim()) {
      setStatusMessage("Add a full name or profile handle before publishing.");
      return;
    }

    const publishedDraft = persist({
      ...draft,
      publishedAt: new Date().toISOString()
    });

    router.push(`/preview/${publishedDraft.profileHandle}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ink px-6 py-10 text-sand sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="panel p-8">
            <p className="text-sm text-mist/75">Loading onboarding draft...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!draft) {
    return (
      <main className="min-h-screen bg-ink px-6 py-10 text-sand sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="panel p-8">
            <p className="eyebrow">Profile setup</p>
            <h1 className="mt-3 font-display text-5xl">No onboarding draft found.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-mist/75">
              Start from the onboarding form first so the lawyer identity draft exists in local storage.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/onboarding" className="button-primary">
                Go to onboarding
              </Link>
              <button className="button-secondary" type="button" onClick={() => setDraft(defaultDraft)}>
                Start empty draft here
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-sand sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Phase 1 profile setup</p>
            <h1 className="section-heading max-w-3xl">
              Finish the public legal identity: image, practice profile, contact controls, portfolio, reviews, and layout.
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-7 text-mist/75">
            This screen completes the Phase 1 MVP surface from the spec, including section customization, privacy
            controls, shareable public preview, and a printable resume flow.
          </p>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-bronze">Identity and domain</p>
                  <p className="mt-2 text-sm leading-7 text-mist/75">
                    Set the public headline, handle, custom domain, and profile image.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-mist/65">Step 2 of 3</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="field md:col-span-2">
                  <span>Headline</span>
                  <input
                    value={draft.headline}
                    onChange={(event) => updateDraft("headline", event.target.value)}
                    placeholder="Dispute resolution, litigation strategy, and urgent case response"
                  />
                </label>
                <label className="field">
                  <span>Profile handle</span>
                  <input
                    value={draft.profileHandle}
                    onChange={(event) => updateDraft("profileHandle", slugifyHandle(event.target.value))}
                    placeholder="adv-isha-reddy"
                  />
                </label>
                <label className="field">
                  <span>Custom domain</span>
                  <input
                    value={draft.customDomain}
                    onChange={(event) => updateDraft("customDomain", event.target.value)}
                    placeholder="isha.reddy.law"
                  />
                </label>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-mist/75">Profile image</p>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                  {draft.profileImageDataUrl ? (
                    <img
                      src={draft.profileImageDataUrl}
                      alt={draft.fullName || "Profile preview"}
                      className="h-24 w-24 rounded-[1.5rem] border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-bronze/25 bg-bronze/10 text-xs uppercase tracking-[0.22em] text-bronze">
                      No image
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="field">
                      <span>Upload headshot</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <p className="mt-3 text-sm text-mist/65">
                      {draft.profileImageName || "PNG, JPG, or WebP up to 2 MB. Stored only in this browser."}
                    </p>
                  </div>

                  {draft.profileImageDataUrl ? (
                    <button className="button-secondary" type="button" onClick={handleRemoveImage}>
                      Remove image
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Professional profile</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="field md:col-span-2">
                  <span>Skills</span>
                  <textarea
                    rows={4}
                    value={draft.skillsText}
                    onChange={(event) => updateDraft("skillsText", event.target.value)}
                    placeholder={"Drafting\nLitigation\nArbitration"}
                  />
                </label>
                <label className="field">
                  <span>Languages</span>
                  <textarea
                    rows={4}
                    value={draft.languagesText}
                    onChange={(event) => updateDraft("languagesText", event.target.value)}
                    placeholder={"English\nTelugu\nHindi"}
                  />
                </label>
                <label className="field">
                  <span>Courts handled</span>
                  <textarea
                    rows={4}
                    value={draft.courtsHandledText}
                    onChange={(event) => updateDraft("courtsHandledText", event.target.value)}
                    placeholder={"High Court of Telangana\nDistrict Court Hyderabad"}
                  />
                </label>
                <label className="field md:col-span-2">
                  <span>Firm history</span>
                  <textarea
                    rows={4}
                    value={draft.firmHistoryText}
                    onChange={(event) => updateDraft("firmHistoryText", event.target.value)}
                    placeholder={"2022-Present | Founder | Reddy Legal Chambers\n2018-2022 | Senior Associate | Rao & Partners"}
                  />
                </label>
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Office and contact</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="field md:col-span-2">
                  <span>Office address</span>
                  <input
                    value={draft.officeAddress}
                    onChange={(event) => updateDraft("officeAddress", event.target.value)}
                    placeholder="Banjara Hills, Hyderabad"
                  />
                </label>
                <label className="field">
                  <span>Contact email</span>
                  <input
                    value={draft.contactEmail}
                    onChange={(event) => updateDraft("contactEmail", event.target.value)}
                    placeholder="isha@lexevo.in"
                  />
                </label>
                <label className="field">
                  <span>Contact phone</span>
                  <input
                    value={draft.contactPhone}
                    onChange={(event) => updateDraft("contactPhone", event.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label className="field md:col-span-2">
                  <span>Live location link</span>
                  <input
                    value={draft.liveLocationUrl}
                    onChange={(event) => updateDraft("liveLocationUrl", event.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </label>
              </div>

              <div className="mt-6">
                <p className="text-sm text-mist/75">Contact options</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {contactChannelOptions.map((channel) => {
                    const selected = draft.contactChannels.includes(channel);

                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel(channel)}
                        className={
                          selected
                            ? "rounded-full border border-bronze/40 bg-bronze px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink"
                            : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-mist/75 transition hover:border-bronze/35 hover:text-sand"
                        }
                      >
                        {channel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Portfolio and reviews</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="field">
                  <span>Cases handled</span>
                  <textarea
                    rows={4}
                    value={draft.caseHighlightsText}
                    onChange={(event) => updateDraft("caseHighlightsText", event.target.value)}
                    placeholder={"Urgent anticipatory bail in commercial dispute\nProperty conflict with criminal complaint overlap"}
                  />
                </label>
                <label className="field">
                  <span>Achievements</span>
                  <textarea
                    rows={4}
                    value={draft.achievementsText}
                    onChange={(event) => updateDraft("achievementsText", event.target.value)}
                    placeholder={"Handled 180+ urgent matters\nSpeaker on legal rights awareness"}
                  />
                </label>
                <label className="field">
                  <span>Articles</span>
                  <textarea
                    rows={4}
                    value={draft.articlesText}
                    onChange={(event) => updateDraft("articlesText", event.target.value)}
                    placeholder={"Citizen rights after arrest\nDue diligence before filing a complaint"}
                  />
                </label>
                <label className="field">
                  <span>Videos</span>
                  <textarea
                    rows={4}
                    value={draft.videosText}
                    onChange={(event) => updateDraft("videosText", event.target.value)}
                    placeholder={"Bail strategy primer\nHow to prepare for first consultation"}
                  />
                </label>
                <label className="field">
                  <span>Average rating</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={draft.averageRating}
                    onChange={(event) => updateDraft("averageRating", Math.max(1, Math.min(5, Number(event.target.value) || 1)))}
                  />
                </label>
                <label className="field md:col-span-2">
                  <span>Reviews</span>
                  <textarea
                    rows={5}
                    value={draft.reviewsText}
                    onChange={(event) => updateDraft("reviewsText", event.target.value)}
                    placeholder={"Rohan S. | Founder | Calm under pressure and precise in urgent matters. | 5\nPriyanka V. | Private client | Clear, composed, and practical. | 5"}
                  />
                </label>
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Section customization</p>
              <div className="mt-5 grid gap-3">
                {draft.sectionOrder.map((section, index) => (
                  <div key={section} className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-sand">{sectionLabels[section]}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mist/55">
                        Position {index + 1}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="button-secondary" type="button" onClick={() => reorderSection(section, "up")}>
                        Move up
                      </button>
                      <button className="button-secondary" type="button" onClick={() => reorderSection(section, "down")}>
                        Move down
                      </button>
                      <button className="button-secondary" type="button" onClick={() => toggleSection(section)}>
                        {draft.sectionVisibility[section] ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Privacy controls</p>
              <div className="mt-5 grid gap-3">
                {(Object.keys(draft.visibility) as VisibilityKey[]).map((setting) => (
                  <button
                    key={setting}
                    type="button"
                    onClick={() => toggleVisibility(setting)}
                    className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-bronze/35"
                  >
                    <span className="text-sm capitalize text-sand">{setting.replace(/([A-Z])/g, " $1")}</span>
                    <span
                      className={
                        draft.visibility[setting]
                          ? "rounded-full bg-bronze px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink"
                          : "rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-mist/60"
                      }
                    >
                      {draft.visibility[setting] ? "Visible" : "Hidden"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {statusMessage ? <p className="text-sm text-emerald-300">{statusMessage}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button className="button-primary" type="button" onClick={handlePublish}>
                Publish Phase 1 preview
              </button>
              <button className="button-secondary" type="button" onClick={handleSave}>
                Save setup
              </button>
              <Link href="/onboarding" className="button-secondary">
                Back to onboarding
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <DraftProfilePreview draft={draft} compact />
            <div className="rounded-[1.75rem] border border-bronze/20 bg-bronze/10 p-5 text-sm leading-7 text-sand/90">
              <p className="font-medium">Publish output</p>
              <p className="mt-2 text-mist/75">
                Publishing stores the completed profile locally, opens a public preview route, and exposes a printable
                resume page you can save as PDF.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
