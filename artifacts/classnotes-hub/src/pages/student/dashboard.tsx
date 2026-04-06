import { useState } from "react";
import { Link } from "wouter";
import { useListSubjects, useGetRecentNotes } from "@workspace/api-client-react";
import { formatDate, formatFileSize, getFileTypeLabel, getFileTypeColor } from "@/lib/utils";
import { Search, BookOpen, FileText, Download } from "lucide-react";
import StudentLayout from "@/components/StudentLayout";

export default function StudentDashboard() {
  const [search, setSearch] = useState("");
  const { data: subjects, isLoading: subjectsLoading } = useListSubjects({ search: search || undefined });
  const { data: recentNotes, isLoading: notesLoading } = useGetRecentNotes({ limit: 6 });

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Notes</h1>
          <p className="text-slate-500 text-sm mt-0.5">Find and access all course materials</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Subjects Grid */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-4">Subjects</h2>
          {subjectsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse h-28"></div>
              ))}
            </div>
          ) : subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Link key={subject.id} href={`/student/subjects/${subject.id}`}>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: subject.color + "20" }}>
                        <BookOpen className="w-5 h-5" style={{ color: subject.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{subject.name}</p>
                        {subject.description && <p className="text-slate-500 text-sm mt-0.5 truncate">{subject.description}</p>}
                        <p className="text-xs text-slate-400 mt-1.5">{subject.noteCount} {subject.noteCount === 1 ? "note" : "notes"}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">{search ? "No subjects match your search" : "No subjects available yet"}</p>
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Uploads</h2>
            <Link href="/student/notes">
              <span className="text-sm text-indigo-600 hover:text-indigo-500 cursor-pointer">View all</span>
            </Link>
          </div>
          {notesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-16"></div>
              ))}
            </div>
          ) : recentNotes && recentNotes.length > 0 ? (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${getFileTypeColor(note.fileType)}`}>
                    {getFileTypeLabel(note.fileType)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{note.title}</p>
                    <p className="text-slate-500 text-xs">{note.subjectName} · {formatDate(note.createdAt)} · {formatFileSize(note.fileSize)}</p>
                  </div>
                  <a
                    href={`/api/storage${note.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500 font-medium shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No notes uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
