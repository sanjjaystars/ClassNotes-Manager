import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminsTable } from "@workspace/db";
import { SetupAdminBody } from "@workspace/api-zod";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY ?? "classnotes-admin-2024";

router.get("/admin/verify", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.userId, userId));

  res.json({ isAdmin: !!admin, userId });
});

router.post("/admin/setup", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = SetupAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.secretKey !== ADMIN_SECRET_KEY) {
    res.status(400).json({ error: "Invalid admin secret key" });
    return;
  }

  // Upsert admin record
  await db.insert(adminsTable).values({ userId }).onConflictDoNothing();

  res.json({ isAdmin: true, userId });
});

export default router;
