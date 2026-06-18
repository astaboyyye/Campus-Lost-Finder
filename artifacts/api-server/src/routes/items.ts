import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db, itemsTable, usersTable, claimsTable } from "@workspace/db";
import { eq, and, ilike, count, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { getOrCreateUser } from "./users";

const router = Router();

function formatItem(item: any, user?: any, claimCount?: number) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    category: item.category,
    location: item.location,
    dateLostFound: item.dateLostFound,
    imageUrl: item.imageUrl,
    status: item.status,
    userId: item.userId,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    claimCount: claimCount ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

router.get("/stats", async (req, res) => {
  try {
    const [lostCount] = await db
      .select({ count: count() })
      .from(itemsTable)
      .where(eq(itemsTable.type, "lost"));
    const [foundCount] = await db
      .select({ count: count() })
      .from(itemsTable)
      .where(eq(itemsTable.type, "found"));
    const [resolvedCount] = await db
      .select({ count: count() })
      .from(itemsTable)
      .where(eq(itemsTable.status, "resolved"));
    const [openCount] = await db
      .select({ count: count() })
      .from(itemsTable)
      .where(eq(itemsTable.status, "open"));
    const [claimedCount] = await db
      .select({ count: count() })
      .from(itemsTable)
      .where(eq(itemsTable.status, "claimed"));

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentCount] = await db
      .select({ count: count() })
      .from(itemsTable)
      .where(sql`${itemsTable.createdAt} >= ${sevenDaysAgo}`);

    const categoryCounts = await db
      .select({ category: itemsTable.category, count: count() })
      .from(itemsTable)
      .groupBy(itemsTable.category)
      .orderBy(desc(count()));

    res.json({
      totalLost: Number(lostCount.count),
      totalFound: Number(foundCount.count),
      totalResolved: Number(resolvedCount.count),
      totalOpen: Number(openCount.count),
      totalClaimed: Number(claimedCount.count),
      recentCount: Number(recentCount.count),
      categoryCounts: categoryCounts.map((c) => ({
        category: c.category,
        count: Number(c.count),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const items = await db
      .select()
      .from(itemsTable)
      .orderBy(desc(itemsTable.createdAt))
      .limit(limit);
    const userIds = [...new Set(items.map((i) => i.userId))];
    const users =
      userIds.length > 0
        ? await db
            .select()
            .from(usersTable)
            .where(sql`${usersTable.clerkUserId} = ANY(${sql.raw(`ARRAY[${userIds.map((id) => `'${id}'`).join(",")}]`)})`)
        : [];
    const userMap = Object.fromEntries(users.map((u) => [u.clerkUserId, u]));
    res.json(items.map((item) => formatItem(item, userMap[item.userId])));
  } catch (err) {
    req.log.error({ err }, "Failed to get recent items");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { type, category, status, search, location, page, limit } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (type) conditions.push(eq(itemsTable.type, type as "lost" | "found"));
    if (category) conditions.push(eq(itemsTable.category, category as string));
    if (status) conditions.push(eq(itemsTable.status, status as "open" | "claimed" | "resolved"));
    if (search) conditions.push(ilike(itemsTable.title, `%${search}%`));
    if (location) conditions.push(ilike(itemsTable.location, `%${location}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(itemsTable)
      .where(whereClause);

    const items = await db
      .select()
      .from(itemsTable)
      .where(whereClause)
      .orderBy(desc(itemsTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const userIds = [...new Set(items.map((i) => i.userId))];
    const users =
      userIds.length > 0
        ? await db
            .select()
            .from(usersTable)
            .where(sql`${usersTable.clerkUserId} = ANY(${sql.raw(`ARRAY[${userIds.map((id) => `'${id}'`).join(",")}]`)})`)
        : [];
    const userMap = Object.fromEntries(users.map((u) => [u.clerkUserId, u]));

    const claimCounts = await db
      .select({ itemId: claimsTable.itemId, count: count() })
      .from(claimsTable)
      .where(sql`${claimsTable.itemId} = ANY(${sql.raw(`ARRAY[${items.map((i) => i.id).join(",")}]`)})`)
      .groupBy(claimsTable.itemId);
    const claimMap = Object.fromEntries(claimCounts.map((c) => [c.itemId, Number(c.count)]));

    res.json({
      items: items.map((item) => formatItem(item, userMap[item.userId], claimMap[item.id] ?? 0)),
      total: Number(totalResult.count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list items");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth(), async (req, res) => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const email = (sessionClaims?.email as string) ?? "";
    await getOrCreateUser(userId, email);

    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(["lost", "found"]),
      category: z.string().min(1),
      location: z.string().optional(),
      dateLostFound: z.string().optional(),
      imageUrl: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const [item] = await db
      .insert(itemsTable)
      .values({ ...data, userId, status: "open" })
      .returning();
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);
    res.status(201).json(formatItem(item, user[0], 0));
  } catch (err) {
    req.log.error({ err }, "Failed to create item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, id)).limit(1);
    if (!item) return res.status(404).json({ error: "Item not found" });
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, item.userId))
      .limit(1);
    const [claimCountRow] = await db
      .select({ count: count() })
      .from(claimsTable)
      .where(eq(claimsTable.itemId, id));
    res.json(formatItem(item, user[0], Number(claimCountRow.count)));
  } catch (err) {
    req.log.error({ err }, "Failed to get item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(itemsTable).where(eq(itemsTable.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Item not found" });

    const requestingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);
    const isAdmin = requestingUser[0]?.role === "admin";
    if (existing.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      location: z.string().optional(),
      dateLostFound: z.string().optional(),
      imageUrl: z.string().optional(),
      status: z.enum(["open", "claimed", "resolved"]).optional(),
    });
    const data = schema.parse(req.body);
    const [updated] = await db
      .update(itemsTable)
      .set(data)
      .where(eq(itemsTable.id, id))
      .returning();
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, updated.userId))
      .limit(1);
    res.json(formatItem(updated, user[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to update item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(itemsTable).where(eq(itemsTable.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Item not found" });

    const requestingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);
    const isAdmin = requestingUser[0]?.role === "admin";
    if (existing.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await db.delete(claimsTable).where(eq(claimsTable.itemId, id));
    await db.delete(itemsTable).where(eq(itemsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete item");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
