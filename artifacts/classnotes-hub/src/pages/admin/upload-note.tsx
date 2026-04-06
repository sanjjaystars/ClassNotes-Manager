import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useListSubjects, useCreateNote, useRequestUploadUrl, getListNotesQueryKey, getGetDashboardStatsQueryKey, getGetRecentNotesQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { formatFileSize } from "@/lib/utils";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg", "image/png", "image/gif", "image/webp",
];

export default function UploadNote() {
  const [, navigate] = useLocation();
  const { data: subjects } = useListSubjects();
  const createNote = useCreateNote();
  const requestUploadUrl = useRequestUploadUrl();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<"idle" | "uploading" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("File type not supported. Please use PDF, PPT, PPTX, DOC, DOCX, or image files.");
      return;
    }
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !subjectId || !title.trim()) return;

    setUploading(true);
    setError("");

    try {
      setProgress("uploading");
      // Step 1: Get presigned URL
      const urlRes = await requestUploadUrl.mutateAsync({
        data: { name: selectedFile.name, size: selectedFile.size, contentType: selectedFile.type }
      });

      // Step 2: Upload directly to GCS
      const uploadRes = await fetch(urlRes.uploadURL, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      setProgress("saving");
      // Step 3: Create note record
      await createNote.mutateAsync({
        data: {
          subjectId: parseInt(subjectId),
          title: title.trim(),
          description: description.trim(),
          fileUrl: urlRes.objectPath,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        }
      });

      setProgress("done");
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRecentNotesQueryKey() });

      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      setProgress("error");
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Upload Note</h1>
          <p className="text-slate-500 text-sm mt-0.5">Add a new note to a subject</p>
        </div>

        {progress === "done" && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-green-800 font-medium">Note uploaded successfully! Redirecting...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
              dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <File className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-slate-500 text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  className="ml-2 p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-700 font-medium">Drop file here or click to browse</p>
                <p className="text-slate-400 text-sm mt-1">PDF, PPT, PPTX, DOC, DOCX, images</p>
              </>
            )}
          </div>

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
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this note..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!selectedFile || !subjectId || !title.trim() || uploading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {progress === "uploading" ? "Uploading file..." : progress === "saving" ? "Saving note..." : "Upload Note"}
            </button>
            <button type="button" onClick={() => navigate("/admin/dashboard")} className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
