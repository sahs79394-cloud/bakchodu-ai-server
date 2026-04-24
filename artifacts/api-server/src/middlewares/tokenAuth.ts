import { type Request, type Response, type NextFunction } from "express";

const VALID_TOKENS = new Set([
  process.env["GITHUB_TOKEN"],
  process.env["RAILWAY_TOKEN"],
].filter(Boolean));

export function tokenAuth(req: Request, res: Response, next: NextFunction) {
  const body = req.body as Record<string, unknown>;
  const headerToken = req.headers["x-api-token"] as string | undefined;
  const bodyToken = typeof body?.token === "string" ? body.token : undefined;
  const token = headerToken ?? bodyToken;

  if (!token) {
    res.status(401).json({ error: "Token required! Bhai, pehle token dalo. 🔐" });
    return;
  }

  if (!VALID_TOKENS.has(token)) {
    res.status(401).json({ error: "Invalid token! Yeh token kahan se uthaya? 😂 Sahi token lao!" });
    return;
  }

  next();
}
