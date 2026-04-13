import { Router } from "express";

export const inventoryRouter = Router();

inventoryRouter.get("/suggestions", (_req, res) => {
  res.json({ substitutions: [], shortages: [] });
});
