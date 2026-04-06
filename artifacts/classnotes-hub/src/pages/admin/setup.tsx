import { useState } from "react";
import { useUser } from "@clerk/react";
import { Redirect } from "wouter";
import { useVerifyAdmin, useSetupAdmin } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { Lock, AlertCircle } from "lucide-react";

export default function AdminSetup() {
  const { isLoaded, isSignedIn } = useUser();
  const { data: adminData, isLoading } = useVerifyAdmin({ query: { enabled: isLoaded && !!isSignedIn } });
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const setupAdmin = useSetupAdmin();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (adminData?.isAdmin) return <Redirect to="/admin/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await setupAdmin.mutateAsync({ data: { secretKey } });
      queryClient.invalidateQueries({ queryKey: ["verifyAdmin"] });
      window.location.href = import.meta.env.BASE_URL + "admin/dashboard";
    } catch {
      setError("Invalid secret key. Please check and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Claim Admin Role</h1>
            <p className="text-slate-400 text-sm">Enter the admin secret key</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Admin Secret Key</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter secret key..."
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              required
            />
            <p className="text-slate-500 text-xs mt-1.5">Default key: classnotes-admin-2024</p>
          </div>
          <button
            type="submit"
            disabled={setupAdmin.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {setupAdmin.isPending ? "Verifying..." : "Claim Admin Access"}
          </button>
        </form>
      </div>
    </div>
  );
}
