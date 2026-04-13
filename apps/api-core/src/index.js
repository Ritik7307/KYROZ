import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import { authRouter } from "./modules/auth/routes.js";
import { tenantRouter } from "./modules/tenants/routes.js";
import { subscriptionRouter } from "./modules/subscriptions/routes.js";
import { sopRouter } from "./modules/sops/routes.js";
import { chatRouter } from "./modules/chat/routes.js";
import { inventoryRouter } from "./modules/inventory/routes.js";
import { analyticsRouter } from "./modules/analytics/routes.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api-core", ts: new Date().toISOString() });
});

app.use("/v1/auth", authRouter);
app.use("/v1/tenants", tenantRouter);
app.use("/v1/subscriptions", subscriptionRouter);
app.use("/v1/sops", sopRouter);
app.use("/v1/chat", chatRouter);
app.use("/v1/inventory", inventoryRouter);
app.use("/v1/analytics", analyticsRouter);

const port = Number(process.env.PORT || 8000);
app.listen(port, () => {
  console.log(`api-core listening on ${port}`);
});
