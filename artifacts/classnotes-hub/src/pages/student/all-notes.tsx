import { useState } from "react";
import { Link } from "wouter";
import { useListNotes, useListSubjects } from "@workspace/api-client-react";
import { formatDate, formatFileSize, getFileTypeLabel, getFileTypeColor, canPreviewInBrowser } from "@/lib/utils";
import { Search, Download, Eye, FileText } from "lucide-react";
import StudentLayout from "@/components/StudentLayout";

export default function AllNotes() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: subjects } = useListSubjects();
  const { data: notes, isLoading } = useListNotes({
    search: search || undefined,
    subjectId: selectedSubject ? parseInt(selectedSubject) : undefined,
  });

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Notes</h1>
          <p className="text-slate-500 text-sm mt-0.5">Browse and download all course materials</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-48"
          >
            <option value="">All Subjects</option>
            {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Preview Modal */}
        {previewUrl && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
            <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="font-medium text-slate-900 text-sm">Preview</p>
                <button onClick={() => setPreviewUrl(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
              </div>
              <iframe src={previewUrl} className="flex-1 w-full" style={{ minHeight: "60vh" }} title="File preview" />
            </div>
          </div>
        )}

        {/* Notes Count */}
        {notes && <p className="text-sm text-slate-500">{notes.length} note{notes.length !== 1 ? "s" : ""} found</p>}

        {/* Notes */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse h-20"></div>
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 mt-0.5 ${getFileTypeColor(note.fileType)}`}>
                    {getFileTypeLabel(note.fileType)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{note.title}</p>
                    {note.description && <p className="text-slate-500 text-sm mt-0.5">{note.description}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Link href={`/student/subjects/${note.subjectId}`}>
                        <span className="text-xs text-indigo-600 hover:text-indigo-500 cursor-pointer">{note.subjectName}</span>
                      </Link>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{formatDate(note.createdAt)}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{formatFileSize(note.fileSize)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {canPreviewInBrowser(note.fileType) && (
                      <button
                        onClick={() => setPreviewUrl(`/api/storage${note.fileUrl}`)}
                        className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                    )}
                    <a
                      href={`/api/storage${note.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">{search || selectedSubject ? "No notes match your search" : "No notes available yet"}</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
