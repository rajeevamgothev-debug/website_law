import { Router } from "express";
import { z } from "zod";

import type { DirectorySearchFilters } from "@lexevo/contracts";

import { listDiscoveryCities, listProfileSummaries } from "../profiles/profile.service";

export const searchRouter = Router();

const searchQuerySchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  practiceArea: z.string().optional(),
  court: z.string().optional(),
  language: z.string().optional(),
  maxConsultationFeeInr: z.coerce.number().int().positive().optional()
});

searchRouter.get("/cities", (_request, response) => {
  const cities = listDiscoveryCities();

  return response.json({
    total: cities.length,
    cities
  });
});

searchRouter.get("/lawyers", (request, response) => {
  const parsed = searchQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    return response.status(400).json({
      error: "Invalid search filters",
      details: parsed.error.flatten()
    });
  }

  const filters = parsed.data as DirectorySearchFilters;
  const results = listProfileSummaries(filters);

  return response.json({
    total: results.length,
    filters,
    results
  });
});
