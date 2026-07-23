import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";
import { requireVerifiedAuth } from "../middlewares/requireVerifiedAuth";
import { isAdminEmail, requireAdmin } from "../lib/adminAuth";

const router = Router();

async function getOrCreateUser(clerkUserId: string, email: string) {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const role = isAdminEmail(email) ? "admin" : "user";
  if (existing.length > 0) {
    const user = existing[0];
    if (user.email !== email || user.role !== role) {
      const [updated] = await db.update(usersTable).set({ email, role }).where(eq(usersTable.clerkUserId, clerkUserId)).returning();
      return updated;
    }
    return user;
  }
  const [created] = await db
    .insert(usersTable)
    .values({ clerkUserId, email, role })
    .returning();
  return created;
}

router.get("/me", requireVerifiedAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const email = res.locals.authEmail as string;
    const user = await getOrCreateUser(userId, email);
    res.json({
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      studentId: user.studentId,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/me", requireVerifiedAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const schema = z.object({
      name: z.string().optional(),
      studentId: z.string().optional(),
      phone: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const [updated] = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.clerkUserId, userId))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({
      id: updated.id,
      clerkUserId: updated.clerkUserId,
      email: updated.email,
      name: updated.name,
      studentId: updated.studentId,
      phone: updated.phone,
      role: updated.role,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireVerifiedAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!requireAdmin(req, res)) return;
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(
      users.map((u) => ({
        id: u.id,
        clerkUserId: u.clerkUserId,
        email: u.email,
        name: u.name,
        studentId: u.studentId,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list users");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { getOrCreateUser };
export default router;
