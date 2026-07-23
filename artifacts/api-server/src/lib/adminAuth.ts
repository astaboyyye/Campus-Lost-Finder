import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";

export const ADMIN_EMAIL = "liebesta2903@gmail.com";

export function isAdminEmail(email: unknown): boolean {
  return typeof email === "string" && email.trim().toLowerCase() === ADMIN_EMAIL;
}

export function requireAdmin(req: Request, res: Response): boolean {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  if (!isAdminEmail(res.locals.authEmail)) {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
}
