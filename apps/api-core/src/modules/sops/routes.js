import { Router } from "express";

export const sopRouter = Router();

sopRouter.get("/", (_req, res) => {
  res.json({ items: [] });
});

sopRouter.post("/upload", (_req, res) => {
  res.status(202).json({ status: "queued", message: "SOP ingestion job queued" });
});
