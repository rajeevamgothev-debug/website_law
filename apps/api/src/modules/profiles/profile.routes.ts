import { Router } from "express";

import { findProfileByHandle } from "./profile.service";

export const profileRouter = Router();

profileRouter.get("/:handle", (request, response) => {
  const profile = findProfileByHandle(request.params.handle);

  if (!profile) {
    return response.status(404).json({
      error: "Profile not found"
    });
  }

  return response.json(profile);
});

