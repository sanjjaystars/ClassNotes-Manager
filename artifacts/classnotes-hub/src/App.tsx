import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp } from "@clerk/react";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import AdminLogin from "@/pages/admin/login";
import AdminSetup from "@/pages/admin/setup";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminSubjects from "@/pages/admin/subjects";
import UploadNote from "@/pages/admin/upload-note";
import EditNote from "@/pages/admin/edit-note";
import StudentDashboard from "@/pages/student/dashboard";
import SubjectDetail from "@/pages/student/subject-detail";
import AllNotes from "@/pages/student/all-notes";
import NotFound from "@/pages/not-found";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Auth */}
      <Route path="/sign-in">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
          <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} afterSignInUrl={`${basePath}/student/dashboard`} />
        </div>
      </Route>
      <Route path="/sign-up">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
          <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} afterSignUpUrl={`${basePath}/student/dashboard`} />
        </div>
      </Route>

      {/* Admin */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/subjects" component={AdminSubjects} />
      <Route path="/admin/notes/upload" component={UploadNote} />
      <Route path="/admin/notes/:id/edit" component={EditNote} />

      {/* Student */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/subjects/:id" component={SubjectDetail} />
      <Route path="/student/notes" component={AllNotes} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
