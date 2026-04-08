import { Router } from "express";

import { readAdminSession } from "../auth/admin-auth.service";
import { getAdminOverview } from "./admin.service";

export const adminRouter = Router();

adminRouter.get("/overview", (request, response) => {
  const session = readAdminSession(request);

  if (!session) {
    return response.status(401).json({
      error: "Admin session missing or expired"
    });
  }

  return response.json(
    getAdminOverview({
      email: session.admin.email,
      displayName: session.admin.displayName
    })
  );
});
