import { db } from "@workspace/db";
import { billsTable, customersTable, entriesTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
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
  const { month, billingDay = 1 } = req.body as { month: string; billingDay?: number };

  const [allEntries, allCustomers, allBills] = await Promise.all([
    db.select().from(entriesTable),
    db.select().from(customersTable),
    db.select().from(billsTable),
  ]);

  const monthEntries = allEntries.filter((e) => e.date.startsWith(month));
  const existingCustomerIds = new Set(
    allBills.filter((b) => b.billingMonth === month).map((b) => b.customerId)
  );

  const grouped: Record<string, typeof monthEntries> = {};
  for (const e of monthEntries) {
    if (!grouped[e.customerId]) grouped[e.customerId] = [];
    grouped[e.customerId].push(e);
  }

  let billCount = allBills.length;
  let generated = 0;
  let skipped = 0;

  for (const [customerId, entries] of Object.entries(grouped)) {
    if (existingCustomerIds.has(customerId)) { skipped++; continue; }
    const customer = allCustomers.find((c) => c.id === customerId);
    if (!customer) continue;

    const prevPending = allEntries.filter(
      (e) => e.customerId === customerId && !e.date.startsWith(month) && e.paymentStatus === "pending"
    );
    const previousDue = prevPending.reduce((s, e) => s + (e.totalAmount ?? 0), 0);
    const totalQuantity = entries.reduce((s, e) => s + (e.waterQuantity ?? 0), 0);
    const totalAmount = entries.reduce((s, e) => s + (e.totalAmount ?? 0), 0);
    const grandTotal = totalAmount + previousDue;

    billCount++;
    const billNumber = `WB-${month.replace("-", "")}-${String(billCount).padStart(3, "0")}`;
    const [y, m] = month.split("-");
    const maxDay = new Date(parseInt(y), parseInt(m), 0).getDate();
    const day = Math.min(billingDay, maxDay);
    const billingDate = `${y}-${m}-${String(day).padStart(2, "0")}`;

    await db.insert(billsTable).values({
      billNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerAddress: customer.address,
      customerArea: customer.area,
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
      waterRate: customer.waterRate,
    });
    generated++;
  }

  res.json({ generated, skipped });
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
