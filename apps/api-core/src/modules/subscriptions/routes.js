import { Router } from "express";
import { PLAN_CONFIG, getPlanConfig } from "../../common/plans.js";
import { getTenantDevices } from "../../common/entitlements.js";

export const subscriptionRouter = Router();

subscriptionRouter.get("/plans", (_req, res) => {
  res.json({
    plans: Object.values(PLAN_CONFIG)
  });
});

subscriptionRouter.get("/entitlements", (req, res) => {
  const tenantId = req.query.tenantId;
  const planCode = req.query.planCode;

  if (!tenantId || !planCode) {
    return res.status(400).json({ error: "tenantId and planCode are required" });
  }

  const plan = getPlanConfig(String(planCode));
  const activeDevices = getTenantDevices(String(tenantId));

  return res.json({
    tenantId,
    planCode: plan.code,
    limits: {
      maxDevices: plan.maxDevices,
      dailyChatLimit: plan.dailyChatLimit
    },
    activeDevices,
    activeDeviceCount: activeDevices.length
  });
});
