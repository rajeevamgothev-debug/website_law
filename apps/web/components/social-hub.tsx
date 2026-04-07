"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";

import type {
  SocialCommentResponse,
  SocialEngagementResponse,
  SocialFeedResponse,
  SocialFollowResponse,
  SocialPost
} from "@lexevo/contracts";

import { apiBaseUrl } from "./api-base-url";

interface SocialHubProps {
  title: string;
  description: string;
  highlightLabel: string;
  initialAuthorHandle?: string;
  initialContentType?: "" | "text" | "image" | "video";
  initialHashtag?: string;
}

interface FeedFilters {
  query: string;
  contentType: "" | "text" | "image" | "video";
  hashtag: string;
}

export function SocialHub({
  title,
  description,
  highlightLabel,
  initialAuthorHandle = "",
  initialContentType = "",
  initialHashtag = ""
}: SocialHubProps) {
  const [filters, setFilters] = useState<FeedFilters>({
    query: "",
    contentType: initialContentType,
    hashtag: initialHashtag
  });
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [trends, setTrends] = useState<SocialFeedResponse["trends"]>([]);
  const [suggestions, setSuggestions] = useState<SocialFeedResponse["suggestions"]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [activeRequestId, setActiveRequestId] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const nextFilters = {
      query: "",
      contentType: initialContentType,
      hashtag: initialHashtag
    };

    setFilters(nextFilters);
    void loadFeed(nextFilters);
  }, [initialAuthorHandle, initialContentType, initialHashtag]);

  async function loadFeed(nextFilters: FeedFilters) {
    setLoading(true);

    const params = new URLSearchParams();

    if (initialAuthorHandle) {
      params.set("authorHandle", initialAuthorHandle);
    }

    if (nextFilters.query) {
      params.set("query", nextFilters.query);
    }

    if (nextFilters.contentType) {
      params.set("contentType", nextFilters.contentType);
    }

    if (nextFilters.hashtag) {
      params.set("hashtag", nextFilters.hashtag);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/social/feed?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Feed request failed.");
      }

      const payload = (await response.json()) as SocialFeedResponse;
      startTransition(() => {
        setPosts(payload.posts);
        setTrends(payload.trends);
        setSuggestions(payload.suggestions);
        setErrorMessage("");
      });
    } catch {
      setErrorMessage("The social feed is unavailable right now. Confirm the API is running on port 4000.");
      startTransition(() => {
        setPosts([]);
        setTrends([]);
        setSuggestions([]);
      });
    } finally {
      setLoading(false);
    }
  }

  function updateFilter<K extends keyof FeedFilters>(field: K, value: FeedFilters[K]) {
    setFilters((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoticeMessage("");
    await loadFeed(filters);
  }

  async function handleTrendClick(hashtag: string) {
    const nextFilters = {
      ...filters,
      hashtag
    };

    setFilters(nextFilters);
    setNoticeMessage(`Showing posts tagged #${hashtag}.`);
    await loadFeed(nextFilters);
  }

  async function handleReset() {
    const nextFilters = {
      query: "",
      contentType: initialContentType,
      hashtag: initialHashtag
    };

    setFilters(nextFilters);
    setNoticeMessage("");
    await loadFeed(nextFilters);
  }

  async function handleEngagement(postId: string, action: "like" | "share") {
    setActiveRequestId(`${postId}:${action}`);

    try {
      const response = await fetch(`${apiBaseUrl}/api/social/posts/${postId}/engagement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error("Engagement failed.");
      }

      const payload = (await response.json()) as SocialEngagementResponse;
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                likeCount: payload.likeCount,
                shareCount: payload.shareCount,
                likedByViewer: payload.likedByViewer
              }
            : post
        )
      );
      setNoticeMessage(action === "share" ? "Share count updated for this post." : "Post liked.");
    } catch {
      setErrorMessage("Post engagement failed.");
    } finally {
      setActiveRequestId("");
    }
  }

  async function handleComment(postId: string) {
    const body = commentDrafts[postId]?.trim();

    if (!body) {
      return;
    }

    setActiveRequestId(`${postId}:comment`);

    try {
      const response = await fetch(`${apiBaseUrl}/api/social/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authorName: "Lexevo Viewer",
          authorRole: "Platform member",
          body
        })
      });

      if (!response.ok) {
        throw new Error("Comment failed.");
      }

      const payload = (await response.json()) as SocialCommentResponse;
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [payload.comment, ...post.comments]
              }
            : post
        )
      );
      setCommentDrafts((current) => ({
        ...current,
        [postId]: ""
      }));
      setNoticeMessage("Comment added to the feed.");
    } catch {
      setErrorMessage("Comment submission failed.");
    } finally {
      setActiveRequestId("");
    }
  }

  async function handleFollow(handle: string, mode: "follow" | "connect") {
    setActiveRequestId(`${handle}:${mode}`);

    try {
      const response = await fetch(`${apiBaseUrl}/api/social/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          handle,
          mode
        })
      });

      if (!response.ok) {
        throw new Error("Follow failed.");
      }

      const payload = (await response.json()) as SocialFollowResponse;
      setPosts((current) =>
        current.map((post) =>
          post.authorHandle === handle
            ? {
                ...post,
                isFollowingAuthor: true
              }
            : post
        )
      );
      setSuggestions((current) => current.filter((suggestion) => suggestion.handle !== handle));
      setNoticeMessage(
        payload.state === "connected"
          ? `Connected with ${handle}. Follower count is now ${payload.followerCount}.`
          : `Following ${handle}. Follower count is now ${payload.followerCount}.`
      );
    } catch {
      setErrorMessage("Follow request failed.");
    } finally {
      setActiveRequestId("");
    }
  }

  const videoPosts = posts.filter((post) => post.contentType === "video").slice(0, 3);

  return (
    <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">{highlightLabel}</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-mist/80">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/creator-studio" className="button-primary">
                Open creator studio
              </Link>
              <Link href="/network/reels" className="button-secondary">
                Watch legal tip reels
              </Link>
              <Link href="/find-lawyers" className="button-secondary">
                Back to discovery
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <article className="metric-card">
                <p className="metric-value">{posts.length}</p>
                <p className="metric-label">Posts in this view</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">{videoPosts.length}</p>
                <p className="metric-label">Short videos surfaced</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">{trends.length}</p>
                <p className="metric-label">Trending hashtags</p>
              </article>
            </div>
          </div>

          <aside className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Phase 3 intent</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-mist/80">
              <p>Make lawyers discoverable beyond search by turning expertise into audience-facing content.</p>
              <p>Feed posts support text, image, and short-video styles with likes, comments, shares, and follow state.</p>
              <p>AI-assisted drafting lives in the creator studio so lawyers can publish faster without lowering quality.</p>
            </div>
          </aside>
        </section>

        <section className="section-shell mt-10">
          <form className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]" onSubmit={handleSubmit}>
            <label className="field">
              <span>Search the feed</span>
              <input
                value={filters.query}
                onChange={(event) => updateFilter("query", event.target.value)}
                placeholder="Bail strategy, founder docs, custody planning"
              />
            </label>
            <label className="field">
              <span>Content type</span>
              <select
                value={filters.contentType}
                onChange={(event) => updateFilter("contentType", event.target.value as FeedFilters["contentType"])}
              >
                <option value="">All formats</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </label>
            <label className="field">
              <span>Hashtag</span>
              <input
                value={filters.hashtag}
                onChange={(event) => updateFilter("hashtag", event.target.value.replace(/^#/, ""))}
                placeholder="LegalTips"
              />
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <button className="button-primary" type="submit" disabled={loading}>
                {loading || isPending ? "Loading feed..." : "Apply filters"}
              </button>
              <button className="button-secondary" type="button" onClick={() => void handleReset()}>
                Reset
              </button>
            </div>
          </form>

          {errorMessage ? <p className="mt-4 text-sm text-rose-300">{errorMessage}</p> : null}
          {noticeMessage ? <p className="mt-4 text-sm text-emerald-300">{noticeMessage}</p> : null}

          {videoPosts.length > 0 ? (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Short legal tip reels</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {videoPosts.map((post) => (
                  <article key={`reel-${post.id}`} className="feature-card">
                    {renderMedia(post)}
                    <p className="mt-4 text-sm uppercase tracking-[0.22em] text-bronze">{post.authorName}</p>
                    <p className="mt-2 text-lg leading-8 text-sand/90">{post.caption}</p>
                    <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-mist/60">
                      <span>{post.viewCount} views</span>
                      <Link href={`/network?hashtag=${encodeURIComponent(post.hashtags[0] ?? "")}`} className="text-bronze">
                        Open topic
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.34fr]">
            <div className="space-y-5">
              {posts.map((post) => (
                <article key={post.id} className="feature-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-4xl text-sand">{post.authorName}</p>
                      <p className="mt-2 text-sm uppercase tracking-[0.24em] text-bronze">
                        {post.authorCity} | {post.authorResponseTimeLabel} | {post.contentType}
                      </p>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-mist/75">{post.authorHeadline}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {post.isFollowingAuthor ? (
                        <span className="tag">Following</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="button-secondary"
                            onClick={() => void handleFollow(post.authorHandle, "follow")}
                            disabled={activeRequestId === `${post.authorHandle}:follow`}
                          >
                            {activeRequestId === `${post.authorHandle}:follow` ? "Following..." : "Follow"}
                          </button>
                          <button
                            type="button"
                            className="button-secondary"
                            onClick={() => void handleFollow(post.authorHandle, "connect")}
                            disabled={activeRequestId === `${post.authorHandle}:connect`}
                          >
                            {activeRequestId === `${post.authorHandle}:connect` ? "Connecting..." : "Connect"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="mt-6 text-base leading-8 text-sand/90">{post.caption}</p>

                  {post.contentType !== "text" ? <div className="mt-6">{renderMedia(post)}</div> : null}

                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.hashtags.map((hashtag) => (
                      <button
                        key={`${post.id}-${hashtag}`}
                        type="button"
                        className="tag"
                        onClick={() => void handleTrendClick(hashtag)}
                      >
                        #{hashtag}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 text-sm text-mist/75 sm:grid-cols-4">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3">Likes: {post.likeCount}</div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3">Comments: {post.comments.length}</div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3">Shares: {post.shareCount}</div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3">Views: {post.viewCount}</div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="button-primary"
                      onClick={() => void handleEngagement(post.id, "like")}
                      disabled={activeRequestId === `${post.id}:like`}
                    >
                      {activeRequestId === `${post.id}:like`
                        ? "Saving..."
                        : post.likedByViewer
                          ? "Liked"
                          : "Like"}
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => void handleEngagement(post.id, "share")}
                      disabled={activeRequestId === `${post.id}:share`}
                    >
                      {activeRequestId === `${post.id}:share` ? "Sharing..." : "Share"}
                    </button>
                    <Link href={`/lawyers/${post.authorHandle}`} className="button-secondary">
                      View lawyer profile
                    </Link>
                    <Link href={`/consultations/${post.authorHandle}`} className="button-secondary">
                      Book consultation
                    </Link>
                  </div>

                  <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-bronze">Join the discussion</p>
                    <textarea
                      rows={3}
                      value={commentDrafts[post.id] ?? ""}
                      onChange={(event) =>
                        setCommentDrafts((current) => ({
                          ...current,
                          [post.id]: event.target.value
                        }))
                      }
                      placeholder="Add a thoughtful comment to this post."
                    />
                    <button
                      type="button"
                      className="button-secondary mt-3"
                      onClick={() => void handleComment(post.id)}
                      disabled={activeRequestId === `${post.id}:comment`}
                    >
                      {activeRequestId === `${post.id}:comment` ? "Posting..." : "Add comment"}
                    </button>
                  </div>

                  <div className="mt-6 space-y-3">
                    {post.comments.slice(0, 3).map((comment) => (
                      <div key={comment.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-sm leading-7 text-sand/90">{comment.body}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-mist/60">
                          {comment.authorName} | {comment.authorRole}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}

              {!loading && posts.length === 0 ? (
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm leading-7 text-mist/75">
                  No posts matched the current feed filters. Clear the hashtag filter or switch back to all formats.
                </div>
              ) : null}
            </div>

            <aside className="space-y-6">
              <section className="panel p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Trending topics</p>
                <div className="mt-5 space-y-3">
                  {trends.map((trend) => (
                    <button
                      key={trend.hashtag}
                      type="button"
                      className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-left transition hover:border-bronze/35"
                      onClick={() => void handleTrendClick(trend.hashtag)}
                    >
                      <p className="text-sm uppercase tracking-[0.22em] text-bronze">#{trend.hashtag}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-mist/60">{trend.momentumLabel}</p>
                      <p className="mt-3 text-sm leading-7 text-sand/90">{trend.sampleAngle}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-mist/60">{trend.postCount} posts</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Suggested lawyers to follow</p>
                <div className="mt-5 space-y-4">
                  {suggestions.map((lawyer) => (
                    <article key={lawyer.handle} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="font-display text-3xl text-sand">{lawyer.fullName}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-bronze">{lawyer.city}</p>
                      <p className="mt-3 text-sm leading-7 text-mist/80">{lawyer.headline}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => void handleFollow(lawyer.handle, "follow")}
                          disabled={activeRequestId === `${lawyer.handle}:follow`}
                        >
                          {activeRequestId === `${lawyer.handle}:follow` ? "Following..." : "Follow"}
                        </button>
                        <Link href={`/consultations/${lawyer.handle}`} className="button-secondary">
                          Consult
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function renderMedia(post: SocialPost) {
  const mediaUrl = post.mediaPosterUrl || post.mediaUrl;

  return (
    <div
      className="overflow-hidden rounded-[1.75rem] border border-white/10"
      style={
        mediaUrl
          ? {
              backgroundImage: `linear-gradient(rgba(9, 17, 31, 0.15), rgba(9, 17, 31, 0.15)), url(${mediaUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }
          : {
              background: "linear-gradient(135deg, rgba(200,154,75,0.22), rgba(9,17,31,0.88))"
            }
      }
    >
      <div className="flex min-h-[15rem] flex-col justify-end bg-gradient-to-t from-ink/80 via-transparent to-transparent p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-bronze">
          {post.contentType === "video" ? "Short legal tip" : "Visual post"}
        </p>
        <p className="mt-2 max-w-lg text-lg leading-8 text-sand/95">{post.caption}</p>
      </div>
    </div>
  );
}
