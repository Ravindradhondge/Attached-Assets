import { db } from "@workspace/db";
import { entriesTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

router.get("/entries", async (req, res) => {
  const rows = await db.select().from(entriesTable).orderBy(desc(entriesTable.createdAt));
  res.json(rows);
});

router.get("/entries/:id", async (req, res) => {
  const rows = await db.select().from(entriesTable).where(eq(entriesTable.id, req.params.id));
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rows[0]);
});

router.post("/entries", async (req, res) => {
  const [row] = await db.insert(entriesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.put("/entries/:id", async (req, res) => {
  const [row] = await db.update(entriesTable).set(req.body).where(eq(entriesTable.id, req.params.id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/entries/:id", async (req, res) => {
  await db.delete(entriesTable).where(eq(entriesTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
