import { clerkClient, getAuth, requireAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { isAdminEmail } from "../lib/adminAuth";

const clerkAuth = requireAuth();

export function requireVerifiedAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  clerkAuth(req, res, async (error?: unknown) => {
    if (error) return next(error);

    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const clerkUser = await clerkClient.users.getUser(userId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
      );
      const approvedAdminEmail = clerkUser.emailAddresses.find(
        (email) =>
          isAdminEmail(email.emailAddress) &&
          email.verification?.status === "verified",
      );
      const authenticatedEmail = approvedAdminEmail ?? primaryEmail;

      if (!authenticatedEmail || authenticatedEmail.verification?.status !== "verified") {
        return res.status(403).json({
          error: "A verified Google account email is required",
        });
      }

      res.locals.authEmail = authenticatedEmail.emailAddress.trim().toLowerCase();
      next();
    } catch (error) {
      next(error);
    }
  });
}
