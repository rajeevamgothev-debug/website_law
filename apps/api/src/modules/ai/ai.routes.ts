import { Router } from "express";
import { z } from "zod";

import type {
  AiChatRequest,
  AiLawyerMatchRequest,
  AiPostGenerationRequest,
  AiSummaryRequest,
  JudgmentSummaryRequest,
  LegalNoticeDraftRequest,
  LegalTermExplanationRequest,
  MatterResearchRequest,
  PracticeArea
} from "@lexevo/contracts";

import {
  chatWithAi,
  draftContentPost,
  draftLegalNotice,
  explainLegalTerm,
  generateDiscussionInsights,
  getAiOverview,
  matchLawyersForCase,
  suggestCaseLaw,
  suggestLegalSections,
  summarizeJudgment,
  summarizeText
} from "./ai.service";

export const aiRouter = Router();

const practiceAreaValues: [PracticeArea, ...PracticeArea[]] = [
  "Criminal Law",
  "Civil Litigation",
  "Corporate Advisory",
  "Family Law",
  "Property Law",
  "Tax Law",
  "Arbitration"
];

const matterResearchSchema = z.object({
  query: z.string().min(3),
  practiceArea: z.enum(practiceAreaValues).optional(),
  court: z.string().optional(),
  goals: z.string().optional()
});

const judgmentSummarySchema = z.object({
  title: z.string().min(3),
  text: z.string().min(20)
});

const explainTermSchema = z.object({
  term: z.string().min(2),
  context: z.string().optional()
});

const personaValues: ["client-advocate", "litigation-strategist", "business-counsel"] = [
  "client-advocate",
  "litigation-strategist",
  "business-counsel"
];

const chatSchema = z.object({
  persona: z.enum(personaValues),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1)
    })
  ).min(1)
});

const summarySchema = z.object({
  text: z.string().min(20),
  length: z.enum(["short", "medium", "detailed"]),
  context: z.string().optional()
});

const lawyerMatchSchema = z.object({
  caseSummary: z.string().min(20),
  practiceArea: z.enum(practiceAreaValues).optional(),
  city: z.string().optional(),
  urgency: z.string().optional(),
  goals: z.string().optional()
});

const postDraftSchema = z.object({
  authorHandle: z.string().min(3),
  topic: z.string().min(3),
  audience: z.string().min(3),
  tone: z.enum(["authoritative", "approachable", "urgent", "educational"]),
  format: z.enum(["post", "thread", "video-script"]),
  includeHashtags: z.boolean()
});

const legalNoticeSchema = z.object({
  authorHandle: z.string().min(3),
  recipientName: z.string().min(2),
  noticeType: z.string().min(3),
  matterSummary: z.string().min(20),
  demands: z.array(z.string().min(2)).min(1),
  tone: z.enum(["firm", "measured", "urgent"]),
  deadlineDays: z.coerce.number().int().positive().optional()
});

aiRouter.get("/overview", async (_request, response) => {
  return response.json(await getAiOverview());
});

aiRouter.post("/case-law", async (request, response) => {
  const parsed = matterResearchSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid case-law request",
      details: parsed.error.flatten()
    });
  }

  return response.json(await suggestCaseLaw(parsed.data as MatterResearchRequest));
});

aiRouter.post("/legal-sections", async (request, response) => {
  const parsed = matterResearchSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid legal-section request",
      details: parsed.error.flatten()
    });
  }

  return response.json(await suggestLegalSections(parsed.data as MatterResearchRequest));
});

aiRouter.post("/summarize-judgment", async (request, response) => {
  const parsed = judgmentSummarySchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid judgment summarization request",
      details: parsed.error.flatten()
    });
  }

  return response.json(await summarizeJudgment(parsed.data as JudgmentSummaryRequest));
});

aiRouter.post("/explain-term", async (request, response) => {
  const parsed = explainTermSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid explain-term request",
      details: parsed.error.flatten()
    });
  }

  return response.json(await explainLegalTerm(parsed.data as LegalTermExplanationRequest));
});

aiRouter.get("/discussion-insights", (_request, response) => {
  return response.json(generateDiscussionInsights());
});

aiRouter.post("/content/post-draft", async (request, response) => {
  const parsed = postDraftSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid post-draft request",
      details: parsed.error.flatten()
    });
  }

  const result = await draftContentPost(parsed.data as AiPostGenerationRequest);

  if (!result) {
    return response.status(404).json({
      error: "Author not found"
    });
  }

  return response.json(result);
});

aiRouter.post("/content/legal-notice", async (request, response) => {
  const parsed = legalNoticeSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid legal-notice request",
      details: parsed.error.flatten()
    });
  }

  const result = await draftLegalNotice(parsed.data as LegalNoticeDraftRequest);

  if (!result) {
    return response.status(404).json({
      error: "Author not found"
    });
  }

  return response.json(result);
});

aiRouter.post("/chat", async (request, response) => {
  const parsed = chatSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid chat request",
      details: parsed.error.flatten()
    });
  }

  return response.json(await chatWithAi(parsed.data as AiChatRequest));
});

aiRouter.post("/summarize", async (request, response) => {
  const parsed = summarySchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid summary request",
      details: parsed.error.flatten()
    });
  }

  return response.json(await summarizeText(parsed.data as AiSummaryRequest));
});

aiRouter.post("/match-lawyers", async (request, response) => {
  const parsed = lawyerMatchSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid lawyer-match request",
      details: parsed.error.flatten()
    });
  }

  return response.json(await matchLawyersForCase(parsed.data as AiLawyerMatchRequest));
});
