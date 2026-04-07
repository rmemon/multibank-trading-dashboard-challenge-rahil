import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { findUserByEmail } from "../../services/mockUsers.js";
import { JWT_EXPIRES_IN, signAccessToken, validateCredentials } from "../../services/authService.js";

export const authRouter = Router();

/** POST /api/auth/login */
authRouter.post("/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await validateCredentials(email, password);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const accessToken = signAccessToken(user);
  res.json({
    tokenType: "Bearer",
    accessToken,
    expiresIn: JWT_EXPIRES_IN,
    user: { id: user.id, email: user.email },
  });
});

/** GET /api/auth/me — validate Bearer token */
authRouter.get("/me", authenticate, (req, res) => {
  const { sub, email } = req.auth!;
  const user = findUserByEmail(email);
  if (!user || user.id !== sub) {
    res.status(401).json({ error: "User no longer valid" });
    return;
  }
  res.json({ user: { id: user.id, email: user.email } });
});
