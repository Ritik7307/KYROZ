import { Router } from "express";

export const analyticsRouter = Router();

analyticsRouter.get("/overview", (_req, res) => {
  res.json({ activeUsers: 0, queryCount: 0, revenueInr: 0 });
});
