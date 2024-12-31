import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Updated SQL function to handle EST/EDT correctly
const getCurrentESTTimestamp = sql`(strftime('%Y-%m-%d %H:%M:%S', datetime('now', 'localtime'), '-5 hours'))`;

export const accountTable = sqliteTable("account", {
  userName: text("username").primaryKey().notNull(),
  walletAddress: text("wallet_address").notNull(),
  profileImage: text("profile_image").notNull(),
  createdAt: text("created_at").default(getCurrentESTTimestamp).notNull(),
  updatedAt: text("updated_at").$onUpdate(() => getCurrentESTTimestamp),
});
