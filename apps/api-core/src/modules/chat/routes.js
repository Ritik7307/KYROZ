import { Router } from "express";
import { validateAndTrackChatUsage, validateDeviceAccess } from "../../common/entitlements.js";
import { getPlanConfig } from "../../common/plans.js";

export const chatRouter = Router();

chatRouter.post("/query", (req, res) => {
  const tenantId = req.body?.tenantId;
  const userId = req.body?.userId;
  const planCode = req.body?.planCode;
  const deviceId = req.headers["x-device-id"] || req.body?.deviceId;

  if (!tenantId || !userId || !planCode || !deviceId) {
    return res.status(400).json({
      error: "tenantId, userId, planCode and deviceId are required"
    });
  }

  const deviceCheck = validateDeviceAccess({
    tenantId,
    deviceId: String(deviceId),
    planCode
  });
  if (!deviceCheck.allowed) {
    return res.status(403).json({ error: deviceCheck.reason });
  }

  const usageCheck = validateAndTrackChatUsage({ tenantId, userId, planCode });
  if (!usageCheck.allowed) {
    return res.status(429).json({ error: usageCheck.reason });
  }

  const plan = getPlanConfig(planCode);
  const question = req.body?.question || "";
  return res.json({
    answer: `Demo answer for: ${question}`,
    citations: [],
    model: "gpt-4o-mini",
    tenantId,
    plan: {
      code: plan.code,
      maxDevices: plan.maxDevices,
      dailyChatLimit: plan.dailyChatLimit
    },
    usage: {
      remainingToday: usageCheck.remaining
    }
  });
});
