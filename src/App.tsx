import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Donors from "./pages/Donors";
import Inventory from "./pages/Inventory";
import Donations from "./pages/Donations";
import Eligibility from "./pages/Eligibility";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import RequestBlood from "./pages/RequestBlood";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminRoute } from "./components/layout/AdminRoute";
import { PageTransition } from "./components/layout/PageTransition";
import { useAutoLogout } from "./hooks/useAutoLogout";

import { useSecurity } from "./hooks/useSecurity";
import { DemoBanner } from "@/components/layout/DemoBanner";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  useAutoLogout(); // Activate auto-logout
  useSecurity(); // Activate security listeners
  return (
    <>
      <DemoBanner />
      <AnimatedRoutes />
    </>
  );
};

const AnimatedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PageTransition><Index /></PageTransition>} />
      <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
      <Route path="/request-blood" element={<PageTransition><RequestBlood /></PageTransition>} />

      {/* Protected User Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <PageTransition><Dashboard /></PageTransition>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/donors" element={
        <AdminRoute>
          <PageTransition><Donors /></PageTransition>
        </AdminRoute>
      } />
      <Route path="/inventory" element={
        <AdminRoute>
          <PageTransition><Inventory /></PageTransition>
        </AdminRoute>
      } />

      {/* Protected Feature Routes */}
      <Route path="/donations" element={
        <ProtectedRoute>
          <PageTransition><Donations /></PageTransition>
        </ProtectedRoute>
      } />
      <Route path="/eligibility" element={
        <ProtectedRoute>
          <PageTransition><Eligibility /></PageTransition>
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          <PageTransition><CalendarPage /></PageTransition>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <PageTransition><Profile /></PageTransition>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <PageTransition><Settings /></PageTransition>
        </ProtectedRoute>
      } />
      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AuthProvider>
            <AuthenticatedApp />
          </AuthProvider>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
