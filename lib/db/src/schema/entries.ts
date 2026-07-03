import { pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const entriesTable = pgTable("daily_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  date: text("date").notNull(),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  waterQuantity: real("water_quantity").notNull().default(0),
  rate: real("rate").notNull().default(0),
  totalAmount: real("total_amount").notNull().default(0),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default(""),
  remarks: text("remarks").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEntrySchema = createInsertSchema(entriesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type DbEntry = typeof entriesTable.$inferSelect;
