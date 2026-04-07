"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import type {
  AiPostGenerationResponse,
  LawyerProfileSummary,
  SocialPost,
  SocialPostType,
  TrendTopic
} from "@lexevo/contracts";

import { apiBaseUrl } from "./api-base-url";

interface GeneratorState {
  authorHandle: string;
  topic: string;
  audience: string;
  tone: "authoritative" | "approachable" | "urgent" | "educational";
  format: "post" | "thread" | "video-script";
  includeHashtags: boolean;
  contentType: SocialPostType;
  caption: string;
  hashtagsText: string;
  mediaUrl: string;
  mediaPosterUrl: string;
}

const defaultState: GeneratorState = {
  authorHandle: "",
  topic: "Urgent client intake checklist",
  audience: "founders and private clients",
  tone: "educational",
  format: "post",
  includeHashtags: true,
  contentType: "text",
  caption: "",
  hashtagsText: "",
  mediaUrl: "",
  mediaPosterUrl: ""
};

export function CreatorStudio() {
  const [authors, setAuthors] = useState<LawyerProfileSummary[]>([]);
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [form, setForm] = useState<GeneratorState>(defaultState);
  const [draft, setDraft] = useState<AiPostGenerationResponse | null>(null);
  const [publishedPost, setPublishedPost] = useState<SocialPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadContext() {
      try {
        const [authorsResponse, trendsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/search/lawyers`),
          fetch(`${apiBaseUrl}/api/social/trending`)
        ]);

        if (!authorsResponse.ok || !trendsResponse.ok) {
          throw new Error("Studio context failed to load.");
        }

        const authorsPayload = (await authorsResponse.json()) as { results: LawyerProfileSummary[] };
        const trendsPayload = (await trendsResponse.json()) as { trends: TrendTopic[] };
        const firstAuthor = authorsPayload.results[0]?.handle ?? "";

        setAuthors(authorsPayload.results);
        setTrends(trendsPayload.trends);
        setForm((current) => ({
          ...current,
          authorHandle: firstAuthor
        }));
      } catch {
        setErrorMessage("Creator studio context could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    void loadContext();
  }, []);

  function updateField<K extends keyof GeneratorState>(field: K, value: GeneratorState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerating(true);
    setErrorMessage("");
    setPublishedPost(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/social/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authorHandle: form.authorHandle,
          topic: form.topic,
          audience: form.audience,
          tone: form.tone,
          format: form.format,
          includeHashtags: form.includeHashtags
        })
      });

      if (!response.ok) {
        throw new Error("AI generation failed.");
      }

      const payload = (await response.json()) as AiPostGenerationResponse;
      setDraft(payload);
      setForm((current) => ({
        ...current,
        contentType: payload.suggestedContentType,
        caption: `${payload.headline}\n\n${payload.draftBody}`,
        hashtagsText: payload.hashtags.map((hashtag) => `#${hashtag}`).join(" ")
      }));
    } catch {
      setErrorMessage("AI draft generation failed. Confirm the API is running on port 4000.");
    } finally {
      setGenerating(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/social/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authorHandle: form.authorHandle,
          contentType: form.contentType,
          caption: form.caption,
          hashtags: form.hashtagsText
            .split(/\s+/)
            .map((tag) => tag.replace(/^#/, "").trim())
            .filter(Boolean),
          mediaUrl: form.mediaUrl || undefined,
          mediaPosterUrl: form.mediaPosterUrl || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Publish failed.");
      }

      const payload = (await response.json()) as SocialPost;
      setPublishedPost(payload);
    } catch {
      setErrorMessage("Publishing to the social feed failed.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="panel p-8">
            <p className="text-sm text-mist/75">Loading creator studio...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Phase 3 creator tools</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">
              Turn legal judgment into a steady content engine.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-mist/80">
              Generate AI-assisted posts, edit them into your voice, and publish directly into the Lexevo social feed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/network" className="button-secondary">
                Open network feed
              </Link>
              <Link href="/network/reels" className="button-secondary">
                Open reels view
              </Link>
            </div>
          </div>

          <aside className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Trending prompts</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {trends.map((trend) => (
                <button
                  key={trend.hashtag}
                  type="button"
                  className="tag"
                  onClick={() => updateField("topic", trend.sampleAngle)}
                >
                  #{trend.hashtag}
                </button>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-mist/75">
              Use a trend as the draft angle, then adapt the tone and format before publishing.
            </p>
          </aside>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form className="panel p-6" onSubmit={handleGenerate}>
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">AI brief</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="field md:col-span-2">
                <span>Author</span>
                <select value={form.authorHandle} onChange={(event) => updateField("authorHandle", event.target.value)}>
                  {authors.map((author) => (
                    <option key={author.handle} value={author.handle}>
                      {author.fullName} | {author.city}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field md:col-span-2">
                <span>Topic</span>
                <input value={form.topic} onChange={(event) => updateField("topic", event.target.value)} required />
              </label>
              <label className="field md:col-span-2">
                <span>Audience</span>
                <input value={form.audience} onChange={(event) => updateField("audience", event.target.value)} required />
              </label>
              <label className="field">
                <span>Tone</span>
                <select
                  value={form.tone}
                  onChange={(event) => updateField("tone", event.target.value as GeneratorState["tone"])}
                >
                  <option value="authoritative">Authoritative</option>
                  <option value="approachable">Approachable</option>
                  <option value="urgent">Urgent</option>
                  <option value="educational">Educational</option>
                </select>
              </label>
              <label className="field">
                <span>Format</span>
                <select
                  value={form.format}
                  onChange={(event) => updateField("format", event.target.value as GeneratorState["format"])}
                >
                  <option value="post">Post</option>
                  <option value="thread">Thread</option>
                  <option value="video-script">Video script</option>
                </select>
              </label>
            </div>

            <label className="mt-6 flex items-center gap-3 text-sm text-mist/75">
              <input
                type="checkbox"
                checked={form.includeHashtags}
                onChange={(event) => updateField("includeHashtags", event.target.checked)}
                className="mt-0 h-4 w-4 rounded border border-white/10 bg-white/5"
              />
              Include hashtags in the generated draft
            </label>

            {errorMessage ? <p className="mt-4 text-sm text-rose-300">{errorMessage}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="button-primary" type="submit" disabled={generating}>
                {generating ? "Generating..." : "Generate AI draft"}
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => {
                  setDraft(null);
                  setPublishedPost(null);
                  setForm((current) => ({
                    ...defaultState,
                    authorHandle: current.authorHandle
                  }));
                }}
              >
                Reset
              </button>
            </div>
          </form>

          <div className="space-y-6">
            <section className="panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Editor</p>
              {draft ? (
                <div className="mt-4 rounded-[1.5rem] border border-bronze/20 bg-bronze/10 p-4 text-sm leading-7 text-sand/90">
                  <p className="font-medium">{draft.headline}</p>
                  <p className="mt-2 text-mist/75">
                    Suggested format: {draft.suggestedContentType}. Edit before publishing if you want a different surface.
                  </p>
                </div>
              ) : null}
              <div className="mt-6 grid gap-4">
                <label className="field">
                  <span>Content type</span>
                  <select
                    value={form.contentType}
                    onChange={(event) => updateField("contentType", event.target.value as SocialPostType)}
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>
                <label className="field">
                  <span>Caption</span>
                  <textarea
                    rows={9}
                    value={form.caption}
                    onChange={(event) => updateField("caption", event.target.value)}
                    placeholder="Generate a draft first, then refine it here."
                  />
                </label>
                <label className="field">
                  <span>Hashtags</span>
                  <input
                    value={form.hashtagsText}
                    onChange={(event) => updateField("hashtagsText", event.target.value)}
                    placeholder="#LegalTips #FounderDocs"
                  />
                </label>
                <label className="field">
                  <span>Media URL</span>
                  <input
                    value={form.mediaUrl}
                    onChange={(event) => updateField("mediaUrl", event.target.value)}
                    placeholder="Optional image or video URL"
                  />
                </label>
                <label className="field">
                  <span>Poster URL</span>
                  <input
                    value={form.mediaPosterUrl}
                    onChange={(event) => updateField("mediaPosterUrl", event.target.value)}
                    placeholder="Optional poster URL for image/video preview"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="button-primary" type="button" onClick={() => void handlePublish()} disabled={publishing}>
                  {publishing ? "Publishing..." : "Publish to social feed"}
                </button>
                <Link href={form.authorHandle ? `/network?author=${encodeURIComponent(form.authorHandle)}` : "/network"} className="button-secondary">
                  View author feed
                </Link>
              </div>
            </section>

            <section className="panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Preview</p>
              <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
                {form.contentType === "image" || form.contentType === "video" ? (
                  <div
                    className="min-h-[14rem] bg-cover bg-center"
                    style={
                      form.mediaPosterUrl || form.mediaUrl
                        ? {
                            backgroundImage: `linear-gradient(rgba(9,17,31,0.15), rgba(9,17,31,0.15)), url(${form.mediaPosterUrl || form.mediaUrl})`
                          }
                        : {
                            background: "linear-gradient(135deg, rgba(200,154,75,0.22), rgba(9,17,31,0.9))"
                          }
                    }
                  />
                ) : null}
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-bronze">{form.contentType}</p>
                  <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-sand/90">
                    {form.caption || "Your edited caption will appear here."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.hashtagsText
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((tag) => (
                        <span key={tag} className="tag">
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </section>

            {publishedPost ? (
              <section className="panel p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Published</p>
                <div className="mt-5 space-y-3 text-sm text-mist/80">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    Post ID: <span className="text-sand">{publishedPost.id}</span>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    Author: <span className="text-sand">{publishedPost.authorName}</span>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/network?author=${encodeURIComponent(publishedPost.authorHandle)}`} className="button-primary">
                    Open published feed
                  </Link>
                  <Link href={`/lawyers/${publishedPost.authorHandle}`} className="button-secondary">
                    Open public profile
                  </Link>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
