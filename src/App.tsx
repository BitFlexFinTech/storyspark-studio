import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import YouTubeAnalysis from "./pages/YouTubeAnalysis";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import Characters from "./pages/Characters";
import CharacterEditor from "./pages/CharacterEditor";
import Visuals from "./pages/Visuals";
import Videos from "./pages/Videos";
import VideoTimelineEditor from "./pages/VideoTimelineEditor";
import Thumbnails from "./pages/Thumbnails";
import Playlists from "./pages/Playlists";
import Merch from "./pages/Merch";
import Drafts from "./pages/Drafts";
import Publishing from "./pages/Publishing";
import Integrations from "./pages/Integrations";
import AdminReview from "./pages/AdminReview";
import Analytics from "./pages/Analytics";
import StyleBlueprintDetail from "./pages/StyleBlueprintDetail";
import YouTubeChannels from "./pages/YouTubeChannels";
import KeywordResearch from "./pages/KeywordResearch";
import CompetitorTracking from "./pages/CompetitorTracking";
import CompetitorInsights from "./pages/CompetitorInsights";
import PerformanceComparison from "./pages/PerformanceComparison";
import ThumbnailAnalysis from "./pages/ThumbnailAnalysis";
import Notifications from "./pages/Notifications";
import ContentCalendar from "./pages/ContentCalendar";
import Settings from "./pages/Settings";
import CompetitorVideoAnalysis from "./pages/CompetitorVideoAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/youtube-analysis"
        element={
          <ProtectedRoute>
            <YouTubeAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/style-blueprint/:id"
        element={
          <ProtectedRoute>
            <StyleBlueprintDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stories"
        element={
          <ProtectedRoute>
            <Stories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stories/:id"
        element={
          <ProtectedRoute>
            <StoryDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/characters"
        element={
          <ProtectedRoute>
            <Characters />
          </ProtectedRoute>
        }
      />
      <Route
        path="/characters/:id/edit"
        element={
          <ProtectedRoute>
            <CharacterEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visuals"
        element={
          <ProtectedRoute>
            <Visuals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos"
        element={
          <ProtectedRoute>
            <Videos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos/:id/edit"
        element={
          <ProtectedRoute>
            <VideoTimelineEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/thumbnails"
        element={
          <ProtectedRoute>
            <Thumbnails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <Playlists />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merch"
        element={
          <ProtectedRoute>
            <Merch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drafts"
        element={
          <ProtectedRoute>
            <Drafts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/publishing"
        element={
          <ProtectedRoute>
            <Publishing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <Integrations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/youtube-channels"
        element={
          <ProtectedRoute>
            <YouTubeChannels />
          </ProtectedRoute>
        }
      />
      <Route
        path="/keyword-research"
        element={
          <ProtectedRoute>
            <KeywordResearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/competitors"
        element={
          <ProtectedRoute>
            <CompetitorTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/competitor-insights"
        element={
          <ProtectedRoute>
            <CompetitorInsights />
          </ProtectedRoute>
        }
      />
      <Route
        path="/performance-comparison"
        element={
          <ProtectedRoute>
            <PerformanceComparison />
          </ProtectedRoute>
        }
      />
      <Route
        path="/thumbnail-analysis"
        element={
          <ProtectedRoute>
            <ThumbnailAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content-calendar"
        element={
          <ProtectedRoute>
            <ContentCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/competitor-videos"
        element={
          <ProtectedRoute>
            <CompetitorVideoAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-review"
        element={
          <AdminRoute>
            <AdminReview />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
        element={
          <AdminRoute>
            <AdminReview />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
