import { getPlanConfig } from "./plans.js";

const tenantDeviceRegistry = new Map();
const userDailyQueryRegistry = new Map();

function getDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function makeUserDayKey(tenantId, userId, dayKey) {
  return `${tenantId}:${userId}:${dayKey}`;
}

export function validateDeviceAccess({ tenantId, deviceId, planCode }) {
  const plan = getPlanConfig(planCode);
  if (!tenantId || !deviceId) {
    return { allowed: false, reason: "tenantId and deviceId are required" };
  }

  if (plan.maxDevices === null) {
    return { allowed: true };
  }

  const deviceSet = tenantDeviceRegistry.get(tenantId) ?? new Set();
  if (!deviceSet.has(deviceId) && deviceSet.size >= plan.maxDevices) {
    return {
      allowed: false,
      reason: `Device limit exceeded for ${plan.code}. Max allowed: ${plan.maxDevices}`
    };
  }

  deviceSet.add(deviceId);
  tenantDeviceRegistry.set(tenantId, deviceSet);
  return { allowed: true };
}

export function validateAndTrackChatUsage({ tenantId, userId, planCode }) {
  const plan = getPlanConfig(planCode);
  if (!tenantId || !userId) {
    return { allowed: false, reason: "tenantId and userId are required" };
  }

  if (plan.dailyChatLimit === null) {
    return { allowed: true, remaining: null };
  }

  const key = makeUserDayKey(tenantId, userId, getDayKey());
  const used = userDailyQueryRegistry.get(key) ?? 0;
  if (used >= plan.dailyChatLimit) {
    return {
      allowed: false,
      reason: `Daily chatbot limit reached for ${plan.code}. Limit: ${plan.dailyChatLimit}/day`
    };
  }

  const nextUsed = used + 1;
  userDailyQueryRegistry.set(key, nextUsed);

  return {
    allowed: true,
    remaining: plan.dailyChatLimit - nextUsed
  };
}

export function getTenantDevices(tenantId) {
  return Array.from(tenantDeviceRegistry.get(tenantId) ?? []);
}
