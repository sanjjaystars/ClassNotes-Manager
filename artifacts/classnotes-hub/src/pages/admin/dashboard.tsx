import { Link } from "wouter";
import { useGetDashboardStats, useGetRecentNotes } from "@workspace/api-client-react";
import { formatDate, formatFileSize, getFileTypeLabel, getFileTypeColor } from "@/lib/utils";
import { BookOpen, FileText, TrendingUp, Plus, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentNotes, isLoading: notesLoading } = useGetRecentNotes({ limit: 6 });

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Overview of ClassNotes Hub</p>
          </div>
          <Link href="/admin/notes/upload">
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm">
              <Plus className="w-4 h-4" />
              Upload Note
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-slate-100 rounded mb-3 w-2/3"></div>
                <div className="h-8 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-indigo-200" />
                  <span className="text-indigo-200 text-sm font-medium">Total Subjects</span>
                </div>
                <p className="text-4xl font-bold">{stats?.totalSubjects ?? 0}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 text-sm font-medium">Total Notes</span>
                </div>
                <p className="text-4xl font-bold text-slate-900">{stats?.totalNotes ?? 0}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 text-sm font-medium">Uploads (7 days)</span>
                </div>
                <p className="text-4xl font-bold text-slate-900">{stats?.recentUploadsCount ?? 0}</p>
              </div>
            </>
          )}
        </div>

        {/* Notes by Subject */}
        {stats && stats.notesBySubject.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Notes by Subject</h2>
            <div className="space-y-3">
              {stats.notesBySubject.map((s) => (
                <div key={s.subjectId} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 font-medium">{s.subjectName}</span>
                      <span className="text-sm text-slate-500">{s.noteCount}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (s.noteCount / (stats.totalNotes || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Uploads</h2>
            <Link href="/admin/subjects">
              <span className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer">
                Manage Subjects <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          {notesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded mb-2 w-1/2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : recentNotes && recentNotes.length > 0 ? (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                  <div className={`text-xs font-bold px-2 py-1 rounded-lg ${getFileTypeColor(note.fileType)}`}>
                    {getFileTypeLabel(note.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{note.title}</p>
                    <p className="text-slate-500 text-xs">{note.subjectName} · {formatDate(note.createdAt)} · {formatFileSize(note.fileSize)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/notes/${note.id}/edit`}>
                      <button className="text-xs text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                        Edit
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No notes uploaded yet</p>
              <Link href="/admin/notes/upload">
                <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 font-medium">Upload your first note</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
