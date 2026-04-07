import { Router } from "express";
import { z } from "zod";

import type {
  CallMode,
  CallRoomCreateRequest,
  ConversationMessageCreateRequest,
  GroupCreateRequest,
  GroupFileShareRequest,
  GroupMessageCreateRequest,
  ReferralCreateRequest,
  ReferralRespondRequest,
  SharedFileKind
} from "@lexevo/contracts";

import {
  createCallRoom,
  createGroup,
  createReferral,
  getConversationDetail,
  listCallRooms,
  listCommunicationsDashboard,
  listGroups,
  listReferrals,
  respondToReferral,
  sendConversationMessage,
  sendGroupMessage,
  shareGroupFile,
  subscribeToCommunicationEvents
} from "./communications.service";

export const communicationsRouter = Router();

const callModeValues: [CallMode, ...CallMode[]] = ["audio", "video"];
const fileKindValues: [SharedFileKind, ...SharedFileKind[]] = ["pdf", "doc", "image", "video"];

const conversationMessageSchema = z.object({
  authorName: z.string().min(2),
  authorRole: z.string().min(2),
  body: z.string().min(2),
  attachment: z
    .object({
      title: z.string().min(2),
      url: z.string().url(),
      fileKind: z.enum(fileKindValues)
    })
    .optional()
});

const groupCreateSchema = z.object({
  name: z.string().min(3),
  practiceArea: z.string().min(3),
  description: z.string().min(10)
});

const groupMessageSchema = z.object({
  authorName: z.string().min(2),
  authorRole: z.string().min(2),
  body: z.string().min(2)
});

const groupFileSchema = z.object({
  authorName: z.string().min(2),
  title: z.string().min(2),
  url: z.string().url(),
  fileKind: z.enum(fileKindValues)
});

const callCreateSchema = z.object({
  title: z.string().min(3),
  mode: z.enum(callModeValues),
  hostName: z.string().min(2),
  participants: z.array(z.string().min(2)).min(1),
  agenda: z.string().min(5),
  scheduledFor: z.string().datetime()
});

const referralCreateSchema = z.object({
  fromHandle: z.string().min(3),
  toHandle: z.string().min(3),
  practiceArea: z.string().min(3),
  city: z.string().min(2),
  note: z.string().min(10)
});

const referralRespondSchema = z.object({
  status: z.enum(["accepted", "declined"])
});

communicationsRouter.get("/dashboard", (_request, response) => {
  return response.json(listCommunicationsDashboard());
});

communicationsRouter.get("/stream", (request, response) => {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });

  response.write(`data: ${JSON.stringify({ type: "ready", createdAt: new Date().toISOString() })}\n\n`);

  const unsubscribe = subscribeToCommunicationEvents((event) => {
    response.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  const keepAlive = setInterval(() => {
    response.write(": keepalive\n\n");
  }, 15000);

  request.on("close", () => {
    clearInterval(keepAlive);
    unsubscribe();
    response.end();
  });
});

communicationsRouter.get("/conversations/:conversationId", (request, response) => {
  const conversation = getConversationDetail(request.params.conversationId);

  if (!conversation) {
    return response.status(404).json({
      error: "Conversation not found"
    });
  }

  return response.json(conversation);
});

communicationsRouter.post("/conversations/:conversationId/messages", (request, response) => {
  const parsed = conversationMessageSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid conversation message payload",
      details: parsed.error.flatten()
    });
  }

  const result = sendConversationMessage(
    request.params.conversationId,
    parsed.data as ConversationMessageCreateRequest
  );

  if (!result) {
    return response.status(404).json({
      error: "Conversation not found"
    });
  }

  return response.status(201).json(result);
});

communicationsRouter.get("/groups", (_request, response) => {
  return response.json({
    groups: listGroups()
  });
});

communicationsRouter.post("/groups", (request, response) => {
  const parsed = groupCreateSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid group payload",
      details: parsed.error.flatten()
    });
  }

  const group = createGroup(parsed.data as GroupCreateRequest);

  return response.status(201).json(group);
});

communicationsRouter.post("/groups/:groupId/messages", (request, response) => {
  const parsed = groupMessageSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid group message payload",
      details: parsed.error.flatten()
    });
  }

  const group = sendGroupMessage(request.params.groupId, parsed.data as GroupMessageCreateRequest);

  if (!group) {
    return response.status(404).json({
      error: "Group not found"
    });
  }

  return response.status(201).json(group);
});

communicationsRouter.post("/groups/:groupId/files", (request, response) => {
  const parsed = groupFileSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid group file payload",
      details: parsed.error.flatten()
    });
  }

  const group = shareGroupFile(request.params.groupId, parsed.data as GroupFileShareRequest);

  if (!group) {
    return response.status(404).json({
      error: "Group not found"
    });
  }

  return response.status(201).json(group);
});

communicationsRouter.get("/calls", (_request, response) => {
  return response.json({
    calls: listCallRooms()
  });
});

communicationsRouter.post("/calls", (request, response) => {
  const parsed = callCreateSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid call room payload",
      details: parsed.error.flatten()
    });
  }

  const room = createCallRoom(parsed.data as CallRoomCreateRequest);

  return response.status(201).json(room);
});

communicationsRouter.get("/referrals", (_request, response) => {
  return response.json({
    referrals: listReferrals()
  });
});

communicationsRouter.post("/referrals", (request, response) => {
  const parsed = referralCreateSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid referral payload",
      details: parsed.error.flatten()
    });
  }

  const referral = createReferral(parsed.data as ReferralCreateRequest);

  if (!referral) {
    return response.status(404).json({
      error: "Lawyer not found"
    });
  }

  return response.status(201).json(referral);
});

communicationsRouter.post("/referrals/:referralId/respond", (request, response) => {
  const parsed = referralRespondSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid referral response payload",
      details: parsed.error.flatten()
    });
  }

  const referral = respondToReferral(request.params.referralId, parsed.data as ReferralRespondRequest);

  if (!referral) {
    return response.status(404).json({
      error: "Referral not found"
    });
  }

  return response.json(referral);
});
