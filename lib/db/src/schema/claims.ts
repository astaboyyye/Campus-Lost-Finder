import { pgTable, text, serial, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const claimStatusEnum = pgEnum("claim_status", ["pending", "approved", "rejected"]);

export const claimsTable = pgTable("claims", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  userId: text("user_id").notNull(),
  description: text("description"),
  proofImageUrl: text("proof_image_url"),
  status: claimStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertClaimSchema = createInsertSchema(claimsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claimsTable.$inferSelect;
