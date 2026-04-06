import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetSubject, useListNotesBySubject } from "@workspace/api-client-react";
import { formatDate, formatFileSize, getFileTypeLabel, getFileTypeColor, canPreviewInBrowser } from "@/lib/utils";
import { Search, ArrowLeft, Download, Eye, FileText, BookOpen } from "lucide-react";
import StudentLayout from "@/components/StudentLayout";

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const subjectId = parseInt(id);
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: subject, isLoading: subjectLoading } = useGetSubject(subjectId, { query: { enabled: !!subjectId } });
  const { data: notes, isLoading: notesLoading } = useListNotesBySubject(subjectId, { search: search || undefined }, { query: { enabled: !!subjectId && !isNaN(subjectId) } });

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back + Header */}
        <div>
          <Link href="/student/dashboard">
            <button className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to subjects
            </button>
          </Link>
          {subjectLoading ? (
            <div className="animate-pulse">
              <div className="h-7 bg-slate-100 rounded w-48 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-64"></div>
            </div>
          ) : subject ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: subject.color + "20" }}>
                <BookOpen className="w-5 h-5" style={{ color: subject.color }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{subject.name}</h1>
                {subject.description && <p className="text-slate-500 text-sm">{subject.description}</p>}
              </div>
              <span className="ml-2 text-sm text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{subject.noteCount} notes</span>
            </div>
          ) : null}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* File Preview Modal */}
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

        {/* Notes List */}
        {notesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
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
                    <p className="text-xs text-slate-400 mt-1.5">{formatDate(note.createdAt)} · {formatFileSize(note.fileSize)}</p>
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
            <p className="text-slate-500">{search ? "No notes match your search" : "No notes in this subject yet"}</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
