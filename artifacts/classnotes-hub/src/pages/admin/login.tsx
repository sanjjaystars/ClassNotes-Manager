import { useUser, SignIn } from "@clerk/react";
import { Redirect } from "wouter";
import { useVerifyAdmin } from "@workspace/api-client-react";
import { BookOpen } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AdminLogin() {
  const { isLoaded, isSignedIn } = useUser();
  const { data: adminData, isLoading } = useVerifyAdmin({ query: { enabled: isLoaded && !!isSignedIn } });

  if (!isLoaded) return null;

  if (isSignedIn) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    if (adminData?.isAdmin) return <Redirect to="/admin/dashboard" />;
    return <Redirect to="/admin/setup" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
        <p className="text-slate-400 text-sm mt-1">Sign in with your admin account</p>
      </div>
      <SignIn routing="path" path={`${basePath}/admin/login`} signUpUrl={`${basePath}/sign-up`} afterSignInUrl={`${basePath}/admin/dashboard`} />
    </div>
  );
}
