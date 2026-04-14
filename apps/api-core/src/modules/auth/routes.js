import { Router } from "express";
import crypto from "crypto";
import { db } from "../../db/store.js";
import { hashPassword, signAccessToken, verifyPassword } from "../../common/auth.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = db.getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  res.json({
    accessToken,
    refreshToken: `refresh-${Date.now()}`,
    user: { id: user.id, email: user.email, role: user.role, name: user.name }
  });
});

authRouter.post("/signup", (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "User already exists. Please login." });
  }

  const user = db.createUser({
    id: `u_${crypto.randomUUID()}`,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    role: "chef",
    passwordHash: hashPassword(String(password))
  });

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return res.status(201).json({
    accessToken,
    refreshToken: `refresh-${Date.now()}`,
    user: { id: user.id, email: user.email, role: user.role, name: user.name }
  });
});

authRouter.post("/refresh", (_req, res) => {
  res.json({ accessToken: "refresh-not-implemented-use-login" });
});
