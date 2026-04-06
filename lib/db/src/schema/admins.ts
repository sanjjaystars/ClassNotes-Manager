import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const adminsTable = pgTable("admins", {
  userId: text("user_id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Admin = typeof adminsTable.$inferSelect;
