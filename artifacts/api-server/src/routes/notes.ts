import { Router, type IRouter } from "express";
import { eq, ilike, or, desc } from "drizzle-orm";
import { db, notesTable, subjectsTable, adminsTable } from "@workspace/db";
import {
  ListNotesBySubjectParams,
  ListNotesBySubjectQueryParams,
  ListNotesQueryParams,
  CreateNoteBody,
  GetNoteParams,
  UpdateNoteParams,
  UpdateNoteBody,
  DeleteNoteParams,
  GetRecentNotesQueryParams,
} from "@workspace/api-zod";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.userId, userId));
  return !!admin;
}

async function enrichNotes(notes: (typeof notesTable.$inferSelect)[]) {
  if (notes.length === 0) return [];

  const subjectIds = [...new Set(notes.map((n) => n.subjectId))];
  const subjects = await db
    .select()
    .from(subjectsTable)
    .where(
      subjectIds.length === 1
        ? eq(subjectsTable.id, subjectIds[0])
        : or(...subjectIds.map((id) => eq(subjectsTable.id, id)))
    );
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s.name]));

  return notes.map((n) => ({
    ...n,
    subjectName: subjectMap[n.subjectId] ?? "Unknown",
  }));
}

// List notes by subject
router.get("/subjects/:id/notes", async (req, res): Promise<void> => {
  const params = ListNotesBySubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const qp = ListNotesBySubjectQueryParams.safeParse(req.query);
  const search = qp.success ? qp.data.search : undefined;

  let notes = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.subjectId, params.data.id))
    .orderBy(desc(notesTable.createdAt));

  if (search) {
    const lower = search.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.description.toLowerCase().includes(lower)
    );
  }

  const enriched = await enrichNotes(notes);
  res.json(enriched);
});

// List all notes
router.get("/notes", async (req, res): Promise<void> => {
  const qp = ListNotesQueryParams.safeParse(req.query);
  const search = qp.success ? qp.data.search : undefined;
  const subjectId = qp.success ? qp.data.subjectId : undefined;

  let notes = await db.select().from(notesTable).orderBy(desc(notesTable.createdAt));

  if (subjectId) {
    notes = notes.filter((n) => n.subjectId === subjectId);
  }

  if (search) {
    const lower = search.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.description.toLowerCase().includes(lower)
    );
  }

  const enriched = await enrichNotes(notes);
  res.json(enriched);
});

// Create note (admin only)
router.post("/notes", async (req, res): Promise<void> => {
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

  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Verify subject exists
  const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, parsed.data.subjectId));
  if (!subject) {
    res.status(400).json({ error: "Subject not found" });
    return;
  }

  const [note] = await db
    .insert(notesTable)
    .values({ ...parsed.data, uploadedBy: userId })
    .returning();

  res.status(201).json({ ...note, subjectName: subject.name });
});

// Get note by ID
router.get("/notes/:id", async (req, res): Promise<void> => {
  const params = GetNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, params.data.id));
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, note.subjectId));

  res.json({ ...note, subjectName: subject?.name ?? "Unknown" });
});

// Update note (admin only)
router.patch("/notes/:id", async (req, res): Promise<void> => {
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

  const params = UpdateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateNoteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [note] = await db
    .update(notesTable)
    .set(body.data)
    .where(eq(notesTable.id, params.data.id))
    .returning();

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, note.subjectId));

  res.json({ ...note, subjectName: subject?.name ?? "Unknown" });
});

// Delete note (admin only)
router.delete("/notes/:id", async (req, res): Promise<void> => {
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

  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(notesTable)
    .where(eq(notesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.sendStatus(204);
});

// Get recent notes (for dashboard)
router.get("/dashboard/recent-notes", async (req, res): Promise<void> => {
  const qp = GetRecentNotesQueryParams.safeParse(req.query);
  const limit = qp.success && qp.data.limit ? Number(qp.data.limit) : 5;

  const notes = await db
    .select()
    .from(notesTable)
    .orderBy(desc(notesTable.createdAt))
    .limit(limit);

  const enriched = await enrichNotes(notes);
  res.json(enriched);
});

export default router;
