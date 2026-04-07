import type {
  AiPostGenerationRequest,
  AiPostGenerationResponse,
  SocialComment,
  SocialCommentRequest,
  SocialCommentResponse,
  SocialEngagementRequest,
  SocialEngagementResponse,
  SocialFeedResponse,
  SocialFollowRequest,
  SocialFollowResponse,
  SocialPost,
  SocialPostCreateRequest,
  SocialPostType,
  TrendTopic
} from "@lexevo/contracts";

import { findProfileByHandle, listProfileSummaries } from "../profiles/profile.service";

interface SocialFeedFilters {
  authorHandle?: string;
  contentType?: SocialPostType;
  hashtag?: string;
  query?: string;
}

type InternalSocialPost = Omit<SocialPost, "isFollowingAuthor" | "likedByViewer">;

const viewerLikedPostIds = new Set<string>(["post_isha_bail", "post_naina_video"]);
const viewerFollowingHandles = new Set<string>(["adv-isha-reddy"]);
const viewerConnectedHandles = new Set<string>();
const followerCountByHandle = new Map<string, number>([
  ["adv-isha-reddy", 1820],
  ["arjun-mehta-counsel", 1460],
  ["naina-kapoor-familylaw", 1675]
]);

const socialPosts: InternalSocialPost[] = [
  {
    id: "post_isha_bail",
    authorHandle: "adv-isha-reddy",
    authorName: "Adv. Isha Reddy",
    authorHeadline: "High-stakes criminal defense and constitutional strategy",
    authorCity: "Hyderabad",
    authorResponseTimeLabel: "~15 min",
    contentType: "text",
    caption:
      "A bail conversation goes wrong when the client meets counsel without a chronology. Start with three things: the allegation, the document trail, and what happened in the last 48 hours. Most urgency is really confusion plus incomplete facts.",
    hashtags: ["CriminalDefense", "BailStrategy", "KnowYourRights"],
    publishedAt: hoursAgo(3),
    likeCount: 38,
    shareCount: 12,
    viewCount: 584,
    comments: [
      createSeedComment("comment_1", "Neha P.", "Founder", "This framing is useful for first-time clients.", 2.5),
      createSeedComment("comment_2", "Sandeep R.", "Litigator", "Chronology first is the right discipline.", 1.4)
    ]
  },
  {
    id: "post_arjun_founder_docs",
    authorHandle: "arjun-mehta-counsel",
    authorName: "Arjun Mehta",
    authorHeadline: "Corporate, startup, and cross-border advisory counsel",
    authorCity: "Bengaluru",
    authorResponseTimeLabel: "~30 min",
    contentType: "image",
    caption:
      "Founders usually wait too long to standardize the first board memo, founder vesting note, and customer fallback clause. Those three documents reduce avoidable friction long before a financing process starts.",
    hashtags: ["StartupLaw", "FounderDocs", "CommercialContracts"],
    mediaPosterUrl: createPosterDataUrl("Founder document stack", "#c89a4b"),
    publishedAt: hoursAgo(8),
    likeCount: 51,
    shareCount: 19,
    viewCount: 802,
    comments: [
      createSeedComment("comment_3", "Aakriti J.", "Startup COO", "This is exactly where teams slip into avoidable risk.", 6.1)
    ]
  },
  {
    id: "post_naina_video",
    authorHandle: "naina-kapoor-familylaw",
    authorName: "Naina Kapoor",
    authorHeadline: "Discreet family law representation with negotiation focus",
    authorCity: "Delhi",
    authorResponseTimeLabel: "~20 min",
    contentType: "video",
    caption:
      "Short legal tip: before a first custody strategy meeting, bring the school calendar, current caregiving routine, and every message that shows the child's weekly pattern. Emotion matters, but judges still ask for structure.",
    hashtags: ["FamilyLaw", "CustodyPlanning", "LegalTips"],
    mediaPosterUrl: createPosterDataUrl("Custody prep short video", "#9ca3af"),
    publishedAt: hoursAgo(14),
    likeCount: 73,
    shareCount: 26,
    viewCount: 1384,
    comments: [
      createSeedComment("comment_4", "Anonymous", "Private client", "The checklist helped me organize the first consultation.", 12.3)
    ]
  },
  {
    id: "post_isha_rights_video",
    authorHandle: "adv-isha-reddy",
    authorName: "Adv. Isha Reddy",
    authorHeadline: "High-stakes criminal defense and constitutional strategy",
    authorCity: "Hyderabad",
    authorResponseTimeLabel: "~15 min",
    contentType: "video",
    caption:
      "Short video script in practice: what to do in the first phone call after a complaint is threatened. Preserve messages, stop improvising on calls, and do not sign summaries you have not read line by line.",
    hashtags: ["LegalTips", "ClientCrisis", "CriminalDefense"],
    mediaPosterUrl: createPosterDataUrl("Complaint response legal tip", "#d4a373"),
    publishedAt: hoursAgo(20),
    likeCount: 64,
    shareCount: 21,
    viewCount: 1112,
    comments: []
  }
];

export function listSocialFeed(filters: SocialFeedFilters = {}): SocialFeedResponse {
  const normalizedHashtag = normalizeHashtag(filters.hashtag);
  const normalizedQuery = filters.query?.trim().toLowerCase();

  const posts = socialPosts
    .filter((post) => {
      if (filters.authorHandle && post.authorHandle !== filters.authorHandle) {
        return false;
      }

      if (filters.contentType && post.contentType !== filters.contentType) {
        return false;
      }

      if (normalizedHashtag && !post.hashtags.map(normalizeHashtag).includes(normalizedHashtag)) {
        return false;
      }

      if (normalizedQuery) {
        const haystack = [
          post.authorName,
          post.authorHeadline,
          post.authorCity,
          post.caption,
          ...post.hashtags
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    })
    .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
    .map(toViewerPost);

  const trends = listTrendTopics();
  const suggestions = listProfileSummaries()
    .filter((profile) => !viewerFollowingHandles.has(profile.handle) && profile.handle !== filters.authorHandle)
    .slice(0, 3);

  return {
    posts,
    trends,
    suggestions
  };
}

export function listTrendTopics(): TrendTopic[] {
  const counts = new Map<string, number>();

  for (const post of socialPosts) {
    for (const hashtag of post.hashtags) {
      const normalized = normalizeHashtag(hashtag);
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 6)
    .map(([hashtag, postCount], index) => ({
      hashtag,
      postCount,
      momentumLabel: index === 0 ? "Hot now" : postCount > 1 ? "Building" : "Emerging",
      sampleAngle: sampleAngleForHashtag(hashtag)
    }));
}

export function createSocialPost(payload: SocialPostCreateRequest): SocialPost | undefined {
  const author = findProfileByHandle(payload.authorHandle);

  if (!author) {
    return undefined;
  }

  const normalizedHashtags = payload.hashtags
    .map(normalizeHashtag)
    .filter((hashtag, index, hashtags) => Boolean(hashtag) && hashtags.indexOf(hashtag) === index)
    .slice(0, 6);

  const post: InternalSocialPost = {
    id: `post_${Date.now()}`,
    authorHandle: author.handle,
    authorName: author.fullName,
    authorHeadline: author.headline,
    authorCity: author.city,
    authorResponseTimeLabel: author.responseTimeLabel,
    contentType: payload.contentType,
    caption: payload.caption.trim(),
    hashtags: normalizedHashtags,
    mediaUrl: payload.mediaUrl,
    mediaPosterUrl: payload.mediaPosterUrl,
    publishedAt: new Date().toISOString(),
    likeCount: 0,
    shareCount: 0,
    viewCount: payload.contentType === "video" ? 24 : 8,
    comments: []
  };

  socialPosts.unshift(post);

  return toViewerPost(post);
}

export function engageWithPost(
  postId: string,
  payload: SocialEngagementRequest
): SocialEngagementResponse | undefined {
  const post = socialPosts.find((entry) => entry.id === postId);

  if (!post) {
    return undefined;
  }

  if (payload.action === "like") {
    if (!viewerLikedPostIds.has(postId)) {
      viewerLikedPostIds.add(postId);
      post.likeCount += 1;
    }
  }

  if (payload.action === "share") {
    post.shareCount += 1;
  }

  return {
    postId,
    action: payload.action,
    likeCount: post.likeCount,
    shareCount: post.shareCount,
    likedByViewer: viewerLikedPostIds.has(postId)
  };
}

export function addCommentToPost(
  postId: string,
  payload: SocialCommentRequest
): SocialCommentResponse | undefined {
  const post = socialPosts.find((entry) => entry.id === postId);

  if (!post) {
    return undefined;
  }

  const comment: SocialComment = {
    id: `comment_${Date.now()}`,
    authorName: payload.authorName.trim(),
    authorRole: payload.authorRole.trim(),
    body: payload.body.trim(),
    createdAt: new Date().toISOString()
  };

  post.comments = [comment, ...post.comments];

  return {
    postId,
    comment,
    commentCount: post.comments.length
  };
}

export function followLawyer(payload: SocialFollowRequest): SocialFollowResponse | undefined {
  const author = findProfileByHandle(payload.handle);

  if (!author) {
    return undefined;
  }

  const wasFollowing = viewerFollowingHandles.has(author.handle);
  viewerFollowingHandles.add(author.handle);

  if (payload.mode === "connect") {
    viewerConnectedHandles.add(author.handle);
  }

  if (!wasFollowing) {
    followerCountByHandle.set(author.handle, (followerCountByHandle.get(author.handle) ?? 0) + 1);
  }

  return {
    handle: author.handle,
    mode: payload.mode,
    state: viewerConnectedHandles.has(author.handle) ? "connected" : "following",
    followerCount: followerCountByHandle.get(author.handle) ?? 1
  };
}

export function generateAiPostDraft(
  payload: AiPostGenerationRequest
): AiPostGenerationResponse | undefined {
  const author = findProfileByHandle(payload.authorHandle);

  if (!author) {
    return undefined;
  }

  const headline = `${payload.topic.trim()}: a ${payload.tone} brief for ${payload.audience.trim()}`;
  const toneOpening = toneOpeningLine(payload.tone);
  const formatBody = draftBodyForFormat(payload, author.headline);
  const hashtags = payload.includeHashtags
    ? [
        normalizeHashtag(payload.topic),
        normalizeHashtag(author.practiceAreas[0] ?? "LegalTips"),
        normalizeHashtag(author.city),
        payload.format === "video-script" ? "ShortVideo" : "LegalBranding"
      ].filter((tag, index, tags) => Boolean(tag) && tags.indexOf(tag) === index)
    : [];

  return {
    authorHandle: author.handle,
    headline,
    draftBody: `${toneOpening}\n\n${formatBody}`,
    hashtags,
    suggestedContentType: payload.format === "video-script" ? "video" : payload.format === "post" ? "image" : "text"
  };
}

function toViewerPost(post: InternalSocialPost): SocialPost {
  return {
    ...post,
    comments: [...post.comments],
    likedByViewer: viewerLikedPostIds.has(post.id),
    isFollowingAuthor: viewerFollowingHandles.has(post.authorHandle)
  };
}

function createSeedComment(
  id: string,
  authorName: string,
  authorRole: string,
  body: string,
  hours: number
): SocialComment {
  return {
    id,
    authorName,
    authorRole,
    body,
    createdAt: hoursAgo(hours)
  };
}

function normalizeHashtag(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/^#/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function sampleAngleForHashtag(hashtag: string) {
  const sampleAngles: Record<string, string> = {
    CriminalDefense: "Break one urgent defense concept into a calm checklist for non-lawyers.",
    BailStrategy: "Explain the first consultation inputs that reduce avoidable delay.",
    KnowYourRights: "Convert a recurring FAQ into a short authority-building explainer.",
    StartupLaw: "Package one founder mistake into a reusable legal systems post.",
    FounderDocs: "Show the first three documents startups standardize too late.",
    CommercialContracts: "Turn one negotiation lesson into a visual carousel or thread.",
    FamilyLaw: "Use a discreet client-prep checklist instead of abstract doctrine.",
    CustodyPlanning: "Translate a high-stress custody issue into structured planning guidance.",
    LegalTips: "Create a short video with one strong hook and one actionable takeaway."
  };

  return sampleAngles[hashtag] ?? "Turn one repeated client question into a crisp, specific legal explainer.";
}

function toneOpeningLine(tone: AiPostGenerationRequest["tone"]) {
  switch (tone) {
    case "approachable":
      return "Clients do not need legal theatre. They need a calm explanation of what actually matters first.";
    case "urgent":
      return "When timing collapses, the lawyer who gives structure first earns trust fastest.";
    case "educational":
      return "Most legal confusion comes from missing sequence, not missing intelligence.";
    case "authoritative":
    default:
      return "A strong legal brand is built by turning repeat judgment into repeatable public insight.";
  }
}

function draftBodyForFormat(payload: AiPostGenerationRequest, authorHeadline: string) {
  switch (payload.format) {
    case "thread":
      return [
        `1. ${payload.topic} is usually misunderstood because people focus on noise before sequence.`,
        `2. For ${payload.audience}, the first practical step is to separate facts, documents, and urgency.`,
        `3. The legal risk rises when communication stays informal and unstructured.`,
        `4. ${authorHeadline} means the advice has to stay precise, not generic.`,
        "5. End with one invitation: bring the chronology, key documents, and your actual objective."
      ].join("\n");
    case "video-script":
      return [
        `Hook: "If you are dealing with ${payload.topic}, do not start with panic. Start with structure."`,
        "Beat 1: Name the one mistake clients make early.",
        "Beat 2: Give the exact checklist or sequence that improves the first legal consultation.",
        `Beat 3: Explain why that matters specifically for ${payload.audience}.`,
        "CTA: Invite viewers to save the tip or book a consultation if the matter is time sensitive."
      ].join("\n");
    case "post":
    default:
      return [
        `If you advise ${payload.audience}, ${payload.topic} is a strong content angle because it shows judgment, not just information.`,
        "Lead with one concrete mistake, move into one short checklist, then close with the business or personal consequence of delay.",
        "That pattern reads as practical authority and converts better than abstract legal commentary."
      ].join("\n\n");
  }
}

function createPosterDataUrl(title: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#09111f" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="720" fill="url(#g)" rx="48" />
      <circle cx="980" cy="140" r="140" fill="rgba(255,255,255,0.08)" />
      <circle cx="180" cy="560" r="200" fill="rgba(255,255,255,0.06)" />
      <text x="90" y="260" fill="#f8f1e7" font-size="72" font-family="Georgia, serif">${title}</text>
      <text x="92" y="350" fill="#d8cfc1" font-size="28" font-family="Arial, sans-serif">Lexevo Phase 3 social media poster</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
