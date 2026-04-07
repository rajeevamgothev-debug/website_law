import { Router } from "express";
import { z } from "zod";

export const authRouter = Router();

const otpRequestSchema = z.object({
  phoneOrEmail: z.string().min(5)
});

authRouter.post("/request-otp", (request, response) => {
  const parsed = otpRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid phone or email",
      details: parsed.error.flatten()
    });
  }

  const value = parsed.data.phoneOrEmail;
  const deliveryChannel = value.includes("@") ? "email" : "sms";

  return response.status(202).json({
    challengeId: "otp_demo_01",
    deliveryChannel,
    retryInSeconds: 30
  });
});

