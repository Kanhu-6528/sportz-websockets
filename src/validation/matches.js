import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
};

// ---------------------------------------------------------------------------
// Query / Param schemas
// ---------------------------------------------------------------------------

/** GET /matches?limit=N */
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/** Route param: /matches/:id */
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Body schemas
// ---------------------------------------------------------------------------

/** POST /matches */
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, "sport is required"),
    homeTeam: z.string().min(1, "homeTeam is required"),
    awayTeam: z.string().min(1, "awayTeam is required"),

    startTime: z.string().min(1, "startTime is required"),
    endTime: z.string().min(1, "endTime is required"),

    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  // Validate that startTime and endTime are valid ISO 8601 date strings
  .refine((data) => !isNaN(Date.parse(data.startTime)), {
    message: "startTime must be a valid ISO date string",
    path: ["startTime"],
  })
  .refine((data) => !isNaN(Date.parse(data.endTime)), {
    message: "endTime must be a valid ISO date string",
    path: ["endTime"],
  })
  // Validate that endTime is chronologically after startTime
  .superRefine((data, ctx) => {
    const start = Date.parse(data.startTime);
    const end = Date.parse(data.endTime);

    if (!isNaN(start) && !isNaN(end) && end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endTime must be chronologically after startTime",
        path: ["endTime"],
      });
    }
  });

/** PATCH /matches/:id/score */
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
