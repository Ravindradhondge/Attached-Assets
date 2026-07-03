import { db } from "@workspace/db";
import { customersTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

router.get("/customers", async (req, res) => {
  const rows = await db.select().from(customersTable).orderBy(desc(customersTable.createdAt));
  res.json(rows);
});

router.get("/customers/:id", async (req, res) => {
  const rows = await db.select().from(customersTable).where(eq(customersTable.id, req.params.id));
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rows[0]);
});

router.post("/customers", async (req, res) => {
  const all = await db.select().from(customersTable);
  const num = all.length + 1;
  const customerId = `WB-${String(num).padStart(3, "0")}`;
  const [row] = await db.insert(customersTable).values({ ...req.body, customerId }).returning();
  res.status(201).json(row);
});

router.put("/customers/:id", async (req, res) => {
  const [row] = await db.update(customersTable).set(req.body).where(eq(customersTable.id, req.params.id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/customers/:id", async (req, res) => {
  await db.delete(customersTable).where(eq(customersTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
