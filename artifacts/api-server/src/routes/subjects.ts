import { Router, type IRouter } from "express";
import { eq, sql, ilike, or } from "drizzle-orm";
import { db, subjectsTable, notesTable } from "@workspace/db";
import {
  ListSubjectsQueryParams,
  CreateSubjectBody,
  GetSubjectParams,
  UpdateSubjectParams,
  UpdateSubjectBody,
  DeleteSubjectParams,
} from "@workspace/api-zod";
import { getAuth } from "@clerk/express";
import { adminsTable } from "@workspace/db";

const router: IRouter = Router();

async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.userId, userId));
  return !!admin;
}

// List all subjects with note counts
router.get("/subjects", async (req, res): Promise<void> => {
  const params = ListSubjectsQueryParams.safeParse(req.query);
  const search = params.success ? params.data.search : undefined;

  const subjects = await db.select().from(subjectsTable);

  // Get note counts per subject
  const noteCounts = await db
    .select({ subjectId: notesTable.subjectId, count: sql<number>`count(*)::int` })
    .from(notesTable)
    .groupBy(notesTable.subjectId);

  const noteCountMap = Object.fromEntries(noteCounts.map((n) => [n.subjectId, n.count]));

  let result = subjects.map((s) => ({
    ...s,
    noteCount: noteCountMap[s.id] ?? 0,
  }));

  if (search) {
    const lower = search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.description.toLowerCase().includes(lower)
    );
  }

  res.json(result);
});

// Create subject (admin only)
router.post("/subjects", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!(await isAdmin(userId))) {
    res.status(403).json({ error: "Forbidden: admin only" });
    return;
  }

  const parsed = CreateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [subject] = await db.insert(subjectsTable).values(parsed.data).returning();

  res.status(201).json({ ...subject, noteCount: 0 });
});

// Get subject by ID
router.get("/subjects/:id", async (req, res): Promise<void> => {
  const params = GetSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, params.data.id));
  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notesTable)
    .where(eq(notesTable.subjectId, params.data.id));

  res.json({ ...subject, noteCount: countRow?.count ?? 0 });
});

// Update subject (admin only)
router.patch("/subjects/:id", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!(await isAdmin(userId))) {
    res.status(403).json({ error: "Forbidden: admin only" });
    return;
  }

  const params = UpdateSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateSubjectBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [subject] = await db
    .update(subjectsTable)
    .set(body.data)
    .where(eq(subjectsTable.id, params.data.id))
    .returning();

  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notesTable)
    .where(eq(notesTable.subjectId, params.data.id));

  res.json({ ...subject, noteCount: countRow?.count ?? 0 });
});

// Delete subject (admin only)
router.delete("/subjects/:id", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!(await isAdmin(userId))) {
    res.status(403).json({ error: "Forbidden: admin only" });
    return;
  }

  const params = DeleteSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Also delete associated notes
  await db.delete(notesTable).where(eq(notesTable.subjectId, params.data.id));

  const [deleted] = await db
    .delete(subjectsTable)
    .where(eq(subjectsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
