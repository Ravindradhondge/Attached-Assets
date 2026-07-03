import { pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customersTable = pgTable("customers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id").notNull(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull(),
  address: text("address").notNull().default(""),
  area: text("area").notNull(),
  waterRate: real("water_rate").notNull().default(10),
  status: text("status").notNull().default("active"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  id: true,
  customerId: true,
  createdAt: true,
});
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type DbCustomer = typeof customersTable.$inferSelect;
