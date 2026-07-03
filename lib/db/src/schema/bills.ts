import { pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const billsTable = pgTable("monthly_bills", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  billNumber: text("bill_number").notNull(),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerMobile: text("customer_mobile").notNull().default(""),
  customerAddress: text("customer_address").notNull().default(""),
  customerArea: text("customer_area").notNull().default(""),
  billingMonth: text("billing_month").notNull(),
  billingDate: text("billing_date").notNull(),
  totalQuantity: real("total_quantity").notNull().default(0),
  totalAmount: real("total_amount").notNull().default(0),
  previousDue: real("previous_due").notNull().default(0),
  grandTotal: real("grand_total").notNull().default(0),
  status: text("status").notNull().default("pending"),
  paidAmount: real("paid_amount").notNull().default(0),
  paidDate: text("paid_date"),
  paymentMode: text("payment_mode").notNull().default(""),
  waterRate: real("water_rate").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBillSchema = createInsertSchema(billsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBill = z.infer<typeof insertBillSchema>;
export type DbBill = typeof billsTable.$inferSelect;
