import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

import { aiRouter } from "./modules/ai/ai.routes";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { communicationsRouter } from "./modules/communications/communications.routes";
import { healthRouter } from "./modules/health/health.routes";
import { leadsRouter } from "./modules/leads/leads.routes";
import { profileRouter } from "./modules/profiles/profile.routes";
import { searchRouter } from "./modules/search/search.routes";
import { socialRouter } from "./modules/social/social.routes";
import { workspaceRouter } from "./modules/workspace/workspace.routes";

export function createApp() {
  const app = express();
  const allowedOrigins = new Set([
    env.CLIENT_ORIGIN,
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://localhost:3001"
  ]);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS"));
      }
    })
  );
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.json({
      name: "Lexevo API",
      phase: "Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 MVP",
      docs: {
        health: "/api/health",
        profiles: "/api/profiles/:handle",
        search: "/api/search/lawyers",
        searchCities: "/api/search/cities",
        otp: "/api/auth/request-otp",
        consultations: "/api/leads/consultations",
        socialFeed: "/api/social/feed",
        socialTrends: "/api/social/trending",
        socialCreate: "/api/social/posts",
        socialGenerate: "/api/social/generate",
        socialFollow: "/api/social/follow",
        communicationsDashboard: "/api/communications/dashboard",
        communicationsStream: "/api/communications/stream",
        communicationMessage: "/api/communications/conversations/:conversationId/messages",
        calls: "/api/communications/calls",
        groups: "/api/communications/groups",
        referrals: "/api/communications/referrals",
        aiOverview: "/api/ai/overview",
        aiCaseLaw: "/api/ai/case-law",
        aiLegalSections: "/api/ai/legal-sections",
        aiSummarizeJudgment: "/api/ai/summarize-judgment",
        aiExplainTerm: "/api/ai/explain-term",
        aiDiscussionInsights: "/api/ai/discussion-insights",
        aiPostDraft: "/api/ai/content/post-draft",
        aiLegalNotice: "/api/ai/content/legal-notice",
        workspaceDashboard: "/api/workspace/dashboard",
        workspaceDocuments: "/api/workspace/documents",
        workspaceAnalytics: "/api/workspace/analytics",
        workspaceCases: "/api/workspace/cases",
        workspaceInvoices: "/api/workspace/invoices"
      }
    });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/profiles", profileRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/leads", leadsRouter);
  app.use("/api/social", socialRouter);
  app.use("/api/communications", communicationsRouter);
  app.use("/api/workspace", workspaceRouter);

  app.use((_request, response) => {
    response.status(404).json({
      error: "Route not found"
    });
  });

  app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
    response.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  });

  return app;
}
