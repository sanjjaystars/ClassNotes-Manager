import { useState } from "react";
import { useListSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject, getListSubjectsQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { BookOpen, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const SUBJECT_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

export default function AdminSubjects() {
  const { data: subjects, isLoading } = useListSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(SUBJECT_COLORS[0]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const refreshSubjects = () => queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createSubject.mutateAsync({ data: { name: newName.trim(), description: newDesc.trim(), color: newColor } });
    setNewName(""); setNewDesc(""); setNewColor(SUBJECT_COLORS[0]); setShowAdd(false);
    refreshSubjects();
  };

  const startEdit = (s: { id: number; name: string; description: string; color: string }) => {
    setEditId(s.id);
    setEditName(s.name);
    setEditDesc(s.description);
    setEditColor(s.color);
  };

  const handleUpdate = async (id: number) => {
    await updateSubject.mutateAsync({ id, data: { name: editName.trim(), description: editDesc.trim(), color: editColor } });
    setEditId(null);
    refreshSubjects();
  };

  const handleDelete = async (id: number) => {
    await deleteSubject.mutateAsync({ id });
    setDeleteConfirmId(null);
    refreshSubjects();
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Subjects</h1>
            <p className="text-slate-500 text-sm mt-0.5">{subjects?.length ?? 0} subjects total</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-900 mb-4">New Subject</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {SUBJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${newColor === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createSubject.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                  {createSubject.isPending ? "Creating..." : "Create Subject"}
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subject List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-16"></div>
            ))}
          </div>
        ) : subjects && subjects.length > 0 ? (
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {editId === subject.id ? (
                  <div className="p-4 space-y-3">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {SUBJECT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={`w-6 h-6 rounded-full ${editColor === c ? "ring-2 ring-offset-1 ring-slate-400" : ""}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(subject.id)} className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg">
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button onClick={() => setEditId(null)} className="flex items-center gap-1 text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg">
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-3 h-10 rounded-full shrink-0" style={{ backgroundColor: subject.color }}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{subject.name}</p>
                        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{subject.noteCount} notes</span>
                      </div>
                      {subject.description && <p className="text-slate-500 text-sm truncate">{subject.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      {deleteConfirmId === subject.id ? (
                        <>
                          <button onClick={() => handleDelete(subject.id)} className="text-xs text-red-600 border border-red-300 px-2.5 py-1.5 rounded-lg hover:bg-red-50">
                            Confirm
                          </button>
                          <button onClick={() => setDeleteConfirmId(null)} className="text-xs text-slate-500 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(subject)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(subject.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No subjects yet. Create your first one.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
