import { useUser, useClerk } from "@clerk/react";
import { Redirect, Link, useLocation } from "wouter";
import { useVerifyAdmin } from "@workspace/api-client-react";
import { BookOpen, LayoutDashboard, FolderOpen, Upload, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { data: adminData, isLoading } = useVerifyAdmin({ query: { enabled: isLoaded && !!isSignedIn } });
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (!adminData?.isAdmin) return <Redirect to="/admin/setup" />;

  const nav = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/subjects", label: "Subjects", icon: FolderOpen },
    { href: "/admin/notes/upload", label: "Upload Note", icon: Upload },
  ];

  const SidebarContent = () => (
    <>
      <div className="px-6 py-5 flex items-center gap-2.5 border-b border-white/10">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">ClassNotes Hub</p>
          <p className="text-indigo-300 text-xs">Admin Panel</p>
        </div>
      </div>
      <nav className="px-3 py-4 flex-1">
        {nav.map((item) => {
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-colors ${
                  active ? "bg-indigo-500/30 text-white" : "text-indigo-200 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-slate-900 shrink-0 fixed inset-y-0 left-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-56 bg-slate-900 h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-900 text-sm">ClassNotes Hub</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
