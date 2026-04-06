import { useUser } from "@clerk/react";
import { Redirect, Link } from "wouter";
import { useVerifyAdmin } from "@workspace/api-client-react";
import { BookOpen, FileText, Shield, Users, Search, Download, Upload } from "lucide-react";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const { data: adminData } = useVerifyAdmin({ query: { enabled: isLoaded && !!isSignedIn } });

  if (!isLoaded) return null;

  if (isSignedIn && adminData?.isAdmin) {
    return <Redirect to="/admin/dashboard" />;
  }
  if (isSignedIn && adminData !== undefined && !adminData.isAdmin) {
    return <Redirect to="/student/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ClassNotes Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <button className="text-sm text-indigo-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10">
                Student Login
              </button>
            </Link>
            <Link href="/admin/login">
              <button className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                Admin Portal
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
          <span className="text-indigo-300 text-sm font-medium">Your academic knowledge hub</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          All your course notes,<br />
          <span className="text-indigo-400">organized perfectly</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          A clean, searchable repository of lecture notes, slides, and study materials — organized by subject and always accessible.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-900/50 hover:shadow-indigo-800/50">
              Get Started as Student
            </button>
          </Link>
          <Link href="/admin/login">
            <button className="border border-white/20 hover:border-white/40 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-all hover:bg-white/5">
              Admin Portal
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Search, title: "Smart Search", desc: "Find any note instantly across all subjects with full-text search." },
            { icon: Download, title: "Easy Downloads", desc: "Download PDFs, slides, and documents directly to your device." },
            { icon: Upload, title: "Admin Uploads", desc: "Admins can upload and organize course materials by subject." },
            { icon: Shield, title: "Role-Based Access", desc: "Secure authentication with separate admin and student portals." },
            { icon: Users, title: "All Students", desc: "One place for all enrolled students to access course materials." },
            { icon: FileText, title: "Multiple Formats", desc: "Supports PDF, PowerPoint, Word documents, and images." },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-slate-500 text-sm">
          ClassNotes Hub — Organized knowledge for every student
        </div>
      </footer>
    </div>
  );
}
