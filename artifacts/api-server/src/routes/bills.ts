import { db } from "@workspace/db";
import { billsTable, customersTable, entriesTable } from "@workspace/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

router.get("/bills", async (req, res) => {
  const rows = await db.select().from(billsTable).orderBy(desc(billsTable.createdAt));
  res.json(rows);
});

router.get("/bills/:id", async (req, res) => {
  const rows = await db.select().from(billsTable).where(eq(billsTable.id, req.params.id));
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rows[0]);
});

router.post("/bills/generate", async (req, res) => {
  try {
    const { month, billingDay = 1 } = req.body as { month: string; billingDay?: number };

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      res.status(400).json({ error: "Invalid month format. Use YYYY-MM." });
      return;
    }

    const [allEntries, activeCustomers, allBills] = await Promise.all([
      db.select().from(entriesTable),
      db.select().from(customersTable).where(eq(customersTable.status, "active")),
      db.select().from(billsTable),
    ]);

    const existingCustomerIds = new Set(
      allBills.filter((b) => b.billingMonth === month).map((b) => b.customerId)
    );

    const [y, m] = month.split("-");
    const maxDay = new Date(parseInt(y), parseInt(m), 0).getDate();
    const day = Math.min(Math.max(1, billingDay), maxDay);
    const billingDate = `${y}-${m}-${String(day).padStart(2, "0")}`;

    let billCount = allBills.length;
    let generated = 0;
    let skipped = 0;

    for (const customer of activeCustomers) {
      if (existingCustomerIds.has(customer.id)) {
        skipped++;
        continue;
      }

      const customerEntries = allEntries.filter(
        (e) => e.customerId === customer.id && e.date.startsWith(month)
      );

      const prevPendingEntries = allEntries.filter(
        (e) =>
          e.customerId === customer.id &&
          !e.date.startsWith(month) &&
          e.paymentStatus === "pending"
      );

      const totalQuantity = customerEntries.reduce((s, e) => s + (e.waterQuantity ?? 0), 0);
      const totalAmount = customerEntries.reduce((s, e) => s + (e.totalAmount ?? 0), 0);
      const previousDue = prevPendingEntries.reduce((s, e) => s + (e.totalAmount ?? 0), 0);
      const grandTotal = totalAmount + previousDue;

      billCount++;
      const billNumber = `WB-${month.replace("-", "")}-${String(billCount).padStart(3, "0")}`;

      await db.insert(billsTable).values({
        billNumber,
        customerId: customer.id,
        customerName: customer.name,
        customerMobile: customer.mobile ?? "",
        customerAddress: customer.address ?? "",
        customerArea: customer.area ?? "",
        billingMonth: month,
        billingDate,
        totalQuantity,
        totalAmount,
        previousDue,
        grandTotal,
        status: "pending",
        paidAmount: 0,
        paidDate: null,
        paymentMode: "",
        waterRate: customer.waterRate ?? 0,
      });
      generated++;
    }

    res.json({ generated, skipped });
  } catch (err) {
    req.log.error(err, "Failed to generate bills");
    res.status(500).json({ error: "Failed to generate bills" });
  }
});

router.put("/bills/:id", async (req, res) => {
  const [row] = await db.update(billsTable).set(req.body).where(eq(billsTable.id, req.params.id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/bills/:id", async (req, res) => {
  await db.delete(billsTable).where(eq(billsTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
