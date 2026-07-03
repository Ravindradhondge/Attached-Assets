import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

const DEFAULT = {
  id: "app_settings",
  businessName: "Water Billing",
  defaultCurrency: "₹",
  defaultWaterRate: 10,
  billingDay: 1,
};

router.get("/settings", async (req, res) => {
  const rows = await db.select().from(settingsTable).where(eq(settingsTable.id, "app_settings"));
  res.json(rows[0] ?? DEFAULT);
});

router.put("/settings", async (req, res) => {
  const existing = await db.select().from(settingsTable).where(eq(settingsTable.id, "app_settings"));
  if (existing.length === 0) {
    const [row] = await db.insert(settingsTable).values({ ...DEFAULT, ...req.body, id: "app_settings" }).returning();
    res.json(row);
  } else {
    const [row] = await db.update(settingsTable).set(req.body).where(eq(settingsTable.id, "app_settings")).returning();
    res.json(row);
  }
});

export default router;
