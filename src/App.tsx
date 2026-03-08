import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import UploadReports from "./pages/UploadReports";
import AIAssistant from "./pages/AIAssistant";
import FindDoctors from "./pages/FindDoctors";
import NearbyCare from "./pages/NearbyCare";
import Medicines from "./pages/Medicines";
import HistoryPage from "./pages/HistoryPage";
import SymptomChecker from "./pages/SymptomChecker";
import MedicineSafety from "./pages/MedicineSafety";
import HelpSafety from "./pages/HelpSafety";
import DiseaseStage from "./pages/DiseaseStage";
import CarePlan from "./pages/CarePlan";
import Precautions from "./pages/Precautions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadReports />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/find-doctors" element={<FindDoctors />} />
            <Route path="/nearby" element={<NearbyCare />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/symptoms" element={<SymptomChecker />} />
            <Route path="/medicine-safety" element={<MedicineSafety />} />
            <Route path="/help" element={<HelpSafety />} />
            <Route path="/disease-stage" element={<DiseaseStage />} />
            <Route path="/care-plan" element={<CarePlan />} />
            <Route path="/precautions" element={<Precautions />} />
            <Route path="/settings" element={<div className="text-2xl font-bold">Settings</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
