import { Router } from "express";
import { z } from "zod";

import { loginAdmin, readAdminSession, revokeAdminSession } from "./admin-auth.service";

export const authRouter = Router();

const otpRequestSchema = z.object({
  phoneOrEmail: z.string().min(5)
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
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

authRouter.post("/admin/login", (request, response) => {
  const parsed = adminLoginSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid admin credentials payload",
      details: parsed.error.flatten()
    });
  }

  const session = loginAdmin(parsed.data.email, parsed.data.password);

  if (!session) {
    return response.status(401).json({
      error: "Invalid admin email or password"
    });
  }

  return response.status(200).json(session);
});

authRouter.get("/admin/session", (request, response) => {
  const session = readAdminSession(request);

  if (!session) {
    return response.status(401).json({
      error: "Admin session missing or expired"
    });
  }

  return response.status(200).json(session);
});

authRouter.post("/admin/logout", (request, response) => {
  revokeAdminSession(request);
  return response.status(204).send();
});
