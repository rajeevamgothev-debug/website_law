import { Router } from "express";
import { z } from "zod";

import type { ConsultationBookingRequest, ConsultationBookingResponse } from "@lexevo/contracts";

import { findProfileByHandle } from "../profiles/profile.service";

export const leadsRouter = Router();

const bookingSchema = z.object({
  lawyerHandle: z.string().min(3),
  clientName: z.string().min(2),
  clientPhone: z.string().min(8),
  clientEmail: z.string().email().optional().or(z.literal("")),
  city: z.string().min(2),
  practiceArea: z.string().optional(),
  court: z.string().optional(),
  preferredDay: z.string().min(2),
  preferredSlot: z.string().min(2),
  budgetInr: z.coerce.number().int().positive().optional(),
  summary: z.string().min(10),
  paymentProvider: z.enum(["razorpay", "stripe"]),
  notifyOnWhatsApp: z.boolean()
});

leadsRouter.post("/consultations", (request, response) => {
  const parsed = bookingSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid consultation booking request",
      details: parsed.error.flatten()
    });
  }

  const payload = parsed.data as ConsultationBookingRequest;
  const lawyer = findProfileByHandle(payload.lawyerHandle);

  if (!lawyer) {
    return response.status(404).json({
      error: "Lawyer not found"
    });
  }

  const leadId = `lead_${Date.now()}`;
  const checkoutReference = `${payload.paymentProvider}_${Math.random().toString(36).slice(2, 10)}`;
  const scheduledLabel = `${payload.preferredDay} at ${payload.preferredSlot}`;
  const whatsappPreview = `New consultation lead for ${lawyer.fullName}: ${payload.clientName}, ${scheduledLabel}, ${payload.city}. Summary: ${payload.summary}`;

  const result: ConsultationBookingResponse = {
    leadId,
    status: "captured",
    lawyerHandle: lawyer.handle,
    checkoutProvider: payload.paymentProvider,
    checkoutReference,
    freeLeadApplied: true,
    whatsAppPreview: payload.notifyOnWhatsApp ? whatsappPreview : "WhatsApp notification disabled for this request.",
    scheduledLabel
  };

  return response.status(201).json(result);
});
