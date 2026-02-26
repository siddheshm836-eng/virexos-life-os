import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute";
import AppSidebar from "@/components/app/AppSidebar";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/app/DashboardPage";
import ProjectsPage from "@/pages/app/ProjectsPage";
import WorkflowPage from "@/pages/app/WorkflowPage";
import DocumentsPage from "@/pages/app/DocumentsPage";
import GoalsPage from "@/pages/app/GoalsPage";
import ProductivityPage from "@/pages/app/ProductivityPage";
import WellnessPage from "@/pages/app/WellnessPage";
import AIPage from "@/pages/app/AIPage";
import SettingsPage from "@/pages/app/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppSidebar>{children}</AppSidebar>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<LandingPage />} />
              <Route path="/pricing" element={<LandingPage />} />
              <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
              {/* Protected App */}
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
              <Route path="/app/projects" element={<AppLayout><ProjectsPage /></AppLayout>} />
              <Route path="/app/workflow" element={<AppLayout><WorkflowPage /></AppLayout>} />
              <Route path="/app/documents" element={<AppLayout><DocumentsPage /></AppLayout>} />
              <Route path="/app/goals" element={<AppLayout><GoalsPage /></AppLayout>} />
              <Route path="/app/productivity" element={<AppLayout><ProductivityPage /></AppLayout>} />
              <Route path="/app/wellness" element={<AppLayout><WellnessPage /></AppLayout>} />
              <Route path="/app/ai" element={<AppLayout><AIPage /></AppLayout>} />
              <Route path="/app/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
