import { integer, pgTable, real, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const settingsTable = pgTable("settings", {
  id: text("id").primaryKey().default("app_settings"),
  businessName: text("business_name").notNull().default("Water Billing"),
  defaultCurrency: text("default_currency").notNull().default("₹"),
  defaultWaterRate: real("default_water_rate").notNull().default(10),
  billingDay: integer("billing_day").notNull().default(1),
});

export const insertSettingsSchema = createInsertSchema(settingsTable);
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type DbSettings = typeof settingsTable.$inferSelect;
