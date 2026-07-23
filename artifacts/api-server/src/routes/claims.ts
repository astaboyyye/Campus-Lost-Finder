import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, claimsTable, itemsTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { getOrCreateUser } from "./users";
import { requireVerifiedAuth } from "../middlewares/requireVerifiedAuth";
import { isAdminEmail, requireAdmin } from "../lib/adminAuth";

const router = Router();

function formatClaim(claim: any, item?: any, user?: any) {
  return {
    id: claim.id,
    itemId: claim.itemId,
    itemTitle: item?.title ?? null,
    userId: claim.userId,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    description: claim.description,
    proofImageUrl: claim.proofImageUrl,
    status: claim.status,
    adminNote: claim.adminNote,
    createdAt: claim.createdAt.toISOString(),
    updatedAt: claim.updatedAt.toISOString(),
  };
}

router.get("/", requireVerifiedAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const isAdmin = isAdminEmail(res.locals.authEmail);

    const conditions: any[] = [];
    if (!isAdmin) conditions.push(eq(claimsTable.userId, userId));
    if (req.query.itemId) conditions.push(eq(claimsTable.itemId, Number(req.query.itemId)));
    if (req.query.status) conditions.push(eq(claimsTable.status, req.query.status as any));

    const claims = await db
      .select()
      .from(claimsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(claimsTable.createdAt);

    const itemIds = [...new Set(claims.map((c) => c.itemId))];
    const items =
      itemIds.length > 0
        ? await db
            .select()
            .from(itemsTable)
            .where(sql`${itemsTable.id} = ANY(ARRAY[${sql.raw(itemIds.join(","))}]::int[])`)
        : [];
    const itemMap = Object.fromEntries(items.map((i) => [i.id, i]));

    const userIds = [...new Set(claims.map((c) => c.userId))];
    const users =
      userIds.length > 0
        ? await db
            .select()
            .from(usersTable)
            .where(
              sql`${usersTable.clerkUserId} = ANY(${sql.raw(`ARRAY[${userIds.map((id) => `'${id}'`).join(",")}]`)})`,
            )
        : [];
    const userMap = Object.fromEntries(users.map((u) => [u.clerkUserId, u]));

    res.json(claims.map((c) => formatClaim(c, itemMap[c.itemId], userMap[c.userId])));
  } catch (err) {
    req.log.error({ err }, "Failed to list claims");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireVerifiedAuth, async (req, res) => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const email = (sessionClaims?.email as string) ?? "";
    await getOrCreateUser(userId, email);

    const schema = z.object({
      itemId: z.number().int(),
      description: z.string().optional(),
      proofImageUrl: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, data.itemId)).limit(1);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const [claim] = await db
      .insert(claimsTable)
      .values({ ...data, userId, status: "pending" })
      .returning();

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);
    res.status(201).json(formatClaim(claim, item, user[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to create claim");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireVerifiedAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [claim] = await db.select().from(claimsTable).where(eq(claimsTable.id, id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Claim not found" });

    const isAdmin = isAdminEmail(res.locals.authEmail);
    if (claim.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, claim.itemId)).limit(1);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkUserId, claim.userId)).limit(1);
    res.json(formatClaim(claim, item, user));
  } catch (err) {
    req.log.error({ err }, "Failed to get claim");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireVerifiedAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    if (!requireAdmin(req, res)) return;

    const schema = z.object({
      status: z.enum(["pending", "approved", "rejected"]),
      adminNote: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const [updated] = await db
      .update(claimsTable)
      .set(data)
      .where(eq(claimsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Claim not found" });

    if (data.status === "approved") {
      await db
        .update(itemsTable)
        .set({ status: "claimed" })
        .where(eq(itemsTable.id, updated.itemId));
    }

    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, updated.itemId)).limit(1);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkUserId, updated.userId)).limit(1);
    res.json(formatClaim(updated, item, user));
  } catch (err) {
    req.log.error({ err }, "Failed to update claim");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
