import { Router } from "express";

export const tenantRouter = Router();

tenantRouter.get("/", (_req, res) => {
  res.json({ items: [{ id: "t_1", name: "Demo Kitchen", plan: "pro_1999" }] });
});
