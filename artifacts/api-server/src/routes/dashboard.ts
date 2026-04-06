import { Router, type IRouter } from "express";
import { sql, gte } from "drizzle-orm";
import { db, subjectsTable, notesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [subjectCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subjectsTable);

  const [noteCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notesTable);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notesTable)
    .where(gte(notesTable.createdAt, sevenDaysAgo));

  const notesBySubject = await db
    .select({
      subjectId: notesTable.subjectId,
      subjectName: subjectsTable.name,
      noteCount: sql<number>`count(*)::int`,
    })
    .from(notesTable)
    .leftJoin(subjectsTable, sql`${notesTable.subjectId} = ${subjectsTable.id}`)
    .groupBy(notesTable.subjectId, subjectsTable.name);

  res.json({
    totalSubjects: subjectCount?.count ?? 0,
    totalNotes: noteCount?.count ?? 0,
    recentUploadsCount: recentCount?.count ?? 0,
    notesBySubject: notesBySubject.map((n) => ({
      subjectId: n.subjectId,
      subjectName: n.subjectName ?? "Unknown",
      noteCount: n.noteCount,
    })),
  });
});

export default router;
