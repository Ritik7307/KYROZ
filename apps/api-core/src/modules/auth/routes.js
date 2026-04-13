import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { email } = req.body ?? {};
  res.json({
    accessToken: "demo-access-token",
    refreshToken: "demo-refresh-token",
    user: { id: "u_demo", email: email || "chef@example.com", role: "chef" }
  });
});

authRouter.post("/refresh", (_req, res) => {
  res.json({ accessToken: "demo-access-token-2" });
});
