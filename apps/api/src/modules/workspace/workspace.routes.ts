import { Router } from "express";
import { z } from "zod";

import type {
  PracticeArea,
  WorkspaceCaseCreateRequest,
  WorkspaceCaseNoteCreateRequest,
  WorkspaceCasePriority,
  WorkspaceCaseStatus,
  WorkspaceCaseStatusUpdateRequest,
  WorkspaceDocumentCreateRequest,
  WorkspaceInvoiceCreateRequest
} from "@lexevo/contracts";

import {
  addCaseDocument,
  addCaseNote,
  createWorkspaceCase,
  createWorkspaceInvoice,
  getWorkspaceAnalytics,
  getWorkspaceDashboard,
  listWorkspaceDocuments,
  listWorkspaceInvoices,
  updateCaseStatus
} from "./workspace.service";

export const workspaceRouter = Router();

const practiceAreaValues: [PracticeArea, ...PracticeArea[]] = [
  "Criminal Law",
  "Civil Litigation",
  "Corporate Advisory",
  "Family Law",
  "Property Law",
  "Tax Law",
  "Arbitration"
];

const casePriorityValues: [WorkspaceCasePriority, ...WorkspaceCasePriority[]] = ["low", "medium", "high", "urgent"];
const caseStatusValues: [WorkspaceCaseStatus, ...WorkspaceCaseStatus[]] = [
  "intake",
  "documents-pending",
  "strategy",
  "filing",
  "hearing",
  "closed"
];

const caseCreateSchema = z.object({
  clientId: z.string().min(3),
  lawyerHandle: z.string().min(3),
  title: z.string().min(3),
  practiceArea: z.enum(practiceAreaValues),
  court: z.string().min(2),
  priority: z.enum(casePriorityValues),
  nextAction: z.string().min(5),
  nextHearingAt: z.string().datetime().optional().or(z.literal(""))
});

const caseNoteSchema = z.object({
  authorName: z.string().min(2),
  body: z.string().min(3)
});

const caseDocumentSchema = z.object({
  clientId: z.string().min(3),
  title: z.string().min(2),
  category: z.enum(["evidence", "agreement", "court-filing", "note", "invoice"]),
  url: z.string().url(),
  uploadedBy: z.string().min(2)
});

const caseStatusSchema = z.object({
  status: z.enum(caseStatusValues)
});

const invoiceCreateSchema = z.object({
  clientId: z.string().min(3),
  lawyerHandle: z.string().min(3),
  title: z.string().min(3),
  dueAt: z.string().datetime(),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(2),
        quantity: z.coerce.number().positive(),
        rateInr: z.coerce.number().positive()
      })
    )
    .min(1)
});

workspaceRouter.get("/dashboard", (_request, response) => {
  return response.json(getWorkspaceDashboard());
});

workspaceRouter.get("/documents", (_request, response) => {
  return response.json({
    documents: listWorkspaceDocuments()
  });
});

workspaceRouter.get("/analytics", (_request, response) => {
  return response.json(getWorkspaceAnalytics());
});

workspaceRouter.get("/invoices", (_request, response) => {
  return response.json({
    invoices: listWorkspaceInvoices()
  });
});

workspaceRouter.post("/cases", (request, response) => {
  const parsed = caseCreateSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid case payload",
      details: parsed.error.flatten()
    });
  }

  const created = createWorkspaceCase({
    ...parsed.data,
    nextHearingAt: parsed.data.nextHearingAt || undefined
  } as WorkspaceCaseCreateRequest);

  if (!created) {
    return response.status(404).json({
      error: "Client not found"
    });
  }

  return response.status(201).json(created);
});

workspaceRouter.post("/cases/:caseId/notes", (request, response) => {
  const parsed = caseNoteSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid case note payload",
      details: parsed.error.flatten()
    });
  }

  const updated = addCaseNote(request.params.caseId, parsed.data as WorkspaceCaseNoteCreateRequest);

  if (!updated) {
    return response.status(404).json({
      error: "Case not found"
    });
  }

  return response.status(201).json(updated);
});

workspaceRouter.post("/cases/:caseId/documents", (request, response) => {
  const parsed = caseDocumentSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid case document payload",
      details: parsed.error.flatten()
    });
  }

  const updated = addCaseDocument(request.params.caseId, parsed.data as WorkspaceDocumentCreateRequest);

  if (!updated) {
    return response.status(404).json({
      error: "Case not found"
    });
  }

  return response.status(201).json(updated);
});

workspaceRouter.patch("/cases/:caseId/status", (request, response) => {
  const parsed = caseStatusSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid case status payload",
      details: parsed.error.flatten()
    });
  }

  const updated = updateCaseStatus(request.params.caseId, parsed.data as WorkspaceCaseStatusUpdateRequest);

  if (!updated) {
    return response.status(404).json({
      error: "Case not found"
    });
  }

  return response.json(updated);
});

workspaceRouter.post("/invoices", (request, response) => {
  const parsed = invoiceCreateSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid invoice payload",
      details: parsed.error.flatten()
    });
  }

  const invoice = createWorkspaceInvoice(parsed.data as WorkspaceInvoiceCreateRequest);

  if (!invoice) {
    return response.status(404).json({
      error: "Client not found"
    });
  }

  return response.status(201).json(invoice);
});
