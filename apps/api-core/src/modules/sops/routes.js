import { Router } from "express";
import { requireAuth } from "../../common/auth.js";
import { listSops } from "../../common/chatbot.js";

export const sopRouter = Router();

sopRouter.get("/", requireAuth, (_req, res) => {
  res.json({ items: listSops() });
});

sopRouter.post("/upload", (_req, res) => {
  res.status(202).json({ status: "queued", message: "SOP ingestion job queued" });
});
