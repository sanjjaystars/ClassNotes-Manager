import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useGetNote, useUpdateNote, useDeleteNote, useListSubjects, getListNotesQueryKey, getGetDashboardStatsQueryKey, getGetRecentNotesQueryKey, getGetNoteQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { Trash2, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function EditNote() {
  const { id } = useParams<{ id: string }>();
  const noteId = parseInt(id);
  const [, navigate] = useLocation();
  const { data: note, isLoading } = useGetNote(noteId, { query: { enabled: !!noteId } });
  const { data: subjects } = useListSubjects();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setDescription(note.description);
      setSubjectId(String(note.subjectId));
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateNote.mutateAsync({ id: noteId, data: { title: title.trim(), description: description.trim(), subjectId: parseInt(subjectId) } });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(noteId) });
      navigate("/admin/dashboard");
    } catch {
      setError("Failed to update note.");
    }
  };

  const handleDelete = async () => {
    await deleteNote.mutateAsync({ id: noteId });
    queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentNotesQueryKey() });
    navigate("/admin/dashboard");
  };

  if (isLoading) return <AdminLayout><div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div></AdminLayout>;

  if (!note) return <AdminLayout><div className="text-center py-20 text-slate-500">Note not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Edit Note</h1>
          <p className="text-slate-500 text-sm mt-0.5">Update note details</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5">
          <p className="text-sm text-slate-500 mb-1">Current file</p>
          <p className="font-medium text-slate-900">{note.fileName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
              required
            >
              <option value="">Select a subject...</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={updateNote.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {updateNote.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => navigate("/admin/dashboard")} className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          {deleteConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-slate-600 text-sm flex-1">Are you sure you want to delete this note?</p>
              <button onClick={handleDelete} disabled={deleteNote.isPending} className="text-sm text-red-600 border border-red-300 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
                {deleteNote.isPending ? "Deleting..." : "Yes, Delete"}
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="text-sm border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete this note
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
