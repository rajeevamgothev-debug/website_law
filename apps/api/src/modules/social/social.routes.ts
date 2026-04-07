import { Router } from "express";
import { z } from "zod";

import type {
  AiPostGenerationRequest,
  SocialCommentRequest,
  SocialEngagementRequest,
  SocialFollowRequest,
  SocialPostCreateRequest,
  SocialPostType
} from "@lexevo/contracts";

import {
  addCommentToPost,
  createSocialPost,
  engageWithPost,
  followLawyer,
  generateAiPostDraft,
  listSocialFeed,
  listTrendTopics
} from "./social.service";

export const socialRouter = Router();

const postTypeValues: [SocialPostType, ...SocialPostType[]] = ["text", "image", "video"];

const feedQuerySchema = z.object({
  authorHandle: z.string().optional(),
  contentType: z.enum(postTypeValues).optional(),
  hashtag: z.string().optional(),
  query: z.string().optional()
});

const createPostSchema = z.object({
  authorHandle: z.string().min(3),
  contentType: z.enum(postTypeValues),
  caption: z.string().min(20),
  hashtags: z.array(z.string().min(2)).max(6),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  mediaPosterUrl: z.string().url().optional().or(z.literal(""))
});

const engagementSchema = z.object({
  action: z.enum(["like", "share"])
});

const commentSchema = z.object({
  authorName: z.string().min(2),
  authorRole: z.string().min(2),
  body: z.string().min(3)
});

const followSchema = z.object({
  handle: z.string().min(3),
  mode: z.enum(["follow", "connect"])
});

const aiDraftSchema = z.object({
  authorHandle: z.string().min(3),
  topic: z.string().min(3),
  audience: z.string().min(3),
  tone: z.enum(["authoritative", "approachable", "urgent", "educational"]),
  format: z.enum(["post", "thread", "video-script"]),
  includeHashtags: z.boolean()
});

socialRouter.get("/feed", (request, response) => {
  const parsed = feedQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid social feed filters",
      details: parsed.error.flatten()
    });
  }

  return response.json(listSocialFeed(parsed.data));
});

socialRouter.get("/trending", (_request, response) => {
  const trends = listTrendTopics();

  return response.json({
    total: trends.length,
    trends
  });
});

socialRouter.post("/posts", (request, response) => {
  const parsed = createPostSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid social post payload",
      details: parsed.error.flatten()
    });
  }

  const payload = parsed.data as SocialPostCreateRequest;
  const created = createSocialPost({
    ...payload,
    mediaUrl: payload.mediaUrl || undefined,
    mediaPosterUrl: payload.mediaPosterUrl || undefined
  });

  if (!created) {
    return response.status(404).json({
      error: "Author not found"
    });
  }

  return response.status(201).json(created);
});

socialRouter.post("/posts/:postId/engagement", (request, response) => {
  const parsed = engagementSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid engagement payload",
      details: parsed.error.flatten()
    });
  }

  const result = engageWithPost(request.params.postId, parsed.data as SocialEngagementRequest);

  if (!result) {
    return response.status(404).json({
      error: "Post not found"
    });
  }

  return response.json(result);
});

socialRouter.post("/posts/:postId/comments", (request, response) => {
  const parsed = commentSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid comment payload",
      details: parsed.error.flatten()
    });
  }

  const result = addCommentToPost(request.params.postId, parsed.data as SocialCommentRequest);

  if (!result) {
    return response.status(404).json({
      error: "Post not found"
    });
  }

  return response.status(201).json(result);
});

socialRouter.post("/follow", (request, response) => {
  const parsed = followSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid follow payload",
      details: parsed.error.flatten()
    });
  }

  const result = followLawyer(parsed.data as SocialFollowRequest);

  if (!result) {
    return response.status(404).json({
      error: "Lawyer not found"
    });
  }

  return response.json(result);
});

socialRouter.post("/generate", (request, response) => {
  const parsed = aiDraftSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid AI draft request",
      details: parsed.error.flatten()
    });
  }

  const result = generateAiPostDraft(parsed.data as AiPostGenerationRequest);

  if (!result) {
    return response.status(404).json({
      error: "Author not found"
    });
  }

  return response.json(result);
});
