export const PLAN_CODES = {
  BASIC_999: "basic_999",
  PRO_2999: "pro_2999",
  PREMIUM_4999: "premium_4999"
};

export const PLAN_CONFIG = {
  [PLAN_CODES.BASIC_999]: {
    code: PLAN_CODES.BASIC_999,
    priceInr: 999,
    maxDevices: 1,
    dailyChatLimit: null,
    features: ["unlimited_chatbot", "single_device_access"]
  },
  [PLAN_CODES.PRO_2999]: {
    code: PLAN_CODES.PRO_2999,
    priceInr: 2999,
    maxDevices: 2,
    dailyChatLimit: null,
    features: ["unlimited_chatbot", "two_device_access", "voice_support"]
  },
  [PLAN_CODES.PREMIUM_4999]: {
    code: PLAN_CODES.PREMIUM_4999,
    priceInr: 4999,
    maxDevices: null,
    dailyChatLimit: null,
    features: ["unlimited_all_access", "advanced_analytics", "team_access"]
  }
};

export function getPlanConfig(planCode) {
  return PLAN_CONFIG[planCode] ?? PLAN_CONFIG[PLAN_CODES.BASIC_999];
}
