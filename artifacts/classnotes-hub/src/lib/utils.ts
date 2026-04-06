import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getFileTypeLabel(fileType: string): string {
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "PPT";
  if (fileType.includes("pptx")) return "PPTX";
  if (fileType.includes("word") || fileType.includes("msword")) return "DOC";
  if (fileType.includes("document") || fileType.includes("docx")) return "DOCX";
  if (fileType.startsWith("image/")) return "Image";
  const ext = fileType.split("/").pop()?.toUpperCase();
  return ext || "File";
}

export function getFileTypeColor(fileType: string): string {
  if (fileType.includes("pdf")) return "bg-red-100 text-red-700";
  if (fileType.includes("presentation") || fileType.includes("powerpoint") || fileType.includes("ppt")) return "bg-orange-100 text-orange-700";
  if (fileType.includes("word") || fileType.includes("doc")) return "bg-blue-100 text-blue-700";
  if (fileType.startsWith("image/")) return "bg-green-100 text-green-700";
  return "bg-slate-100 text-slate-700";
}

export function canPreviewInBrowser(fileType: string): boolean {
  return fileType.includes("pdf") || fileType.startsWith("image/");
}
