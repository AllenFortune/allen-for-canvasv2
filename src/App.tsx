import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CanvasSetup from "./pages/CanvasSetup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import GradeAssignment from "./pages/GradeAssignment";
import GradeDiscussion from "./pages/GradeDiscussion";
import GradeQuiz from "./pages/GradeQuiz";
import Assignments from "./pages/Assignments";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import AILiteracy from "./pages/AILiteracy";
import AIPedagogyHub from "./pages/AIPedagogyHub";
import AIAssignmentIntegration from "./pages/AIAssignmentIntegration";
import InstitutionalInquiry from "./pages/InstitutionalInquiry";
import AdminPortal from "./pages/AdminPortal";
import AdminSetup from "./pages/AdminSetup";
import AIRubricBuilder from "@/pages/AIRubricBuilder";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClient client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/canvas-setup" element={<CanvasSetup />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/courses/:courseId/assignments/:assignmentId/grade" element={<GradeAssignment />} />
              <Route path="/courses/:courseId/discussions/:discussionId/grade" element={<GradeDiscussion />} />
              <Route path="/courses/:courseId/quizzes/:quizId/grade" element={<GradeQuiz />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/ai-literacy" element={<AILiteracy />} />
              <Route path="/ai-pedagogy" element={<AIPedagogyHub />} />
              <Route path="/ai-assignment-integration" element={<AIAssignmentIntegration />} />
              <Route path="/institutional-inquiry" element={<InstitutionalInquiry />} />
              <Route path="/admin-portal" element={<AdminPortal />} />
              <Route path="/admin-setup" element={<AdminSetup />} />
              <Route path="/ai-rubric-builder" element={<AIRubricBuilder />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </QueryClient>
  );
}

export default App;
