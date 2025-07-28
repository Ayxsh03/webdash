import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Footfall from "./pages/Footfall";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          <Route path="/footfall" element={
            <DashboardLayout>
              <Footfall />
            </DashboardLayout>
          } />
          <Route path="/ai-intelligence" element={
            <DashboardLayout>
              <div className="text-center text-muted-foreground">AI Intelligence page coming soon...</div>
            </DashboardLayout>
          } />
          <Route path="/ai-attendance" element={
            <DashboardLayout>
              <div className="text-center text-muted-foreground">AI Attendance page coming soon...</div>
            </DashboardLayout>
          } />
          <Route path="/vehicle-detection" element={
            <DashboardLayout>
              <div className="text-center text-muted-foreground">Vehicle Detection page coming soon...</div>
            </DashboardLayout>
          } />
          <Route path="/people-count" element={
            <DashboardLayout>
              <div className="text-center text-muted-foreground">People Count page coming soon...</div>
            </DashboardLayout>
          } />
          <Route path="/parking" element={
            <DashboardLayout>
              <div className="text-center text-muted-foreground">Parking Management page coming soon...</div>
            </DashboardLayout>
          } />
          <Route path="/assets" element={
            <DashboardLayout>
              <div className="text-center text-muted-foreground">Assets page coming soon...</div>
            </DashboardLayout>
          } />
          <Route path="/settings" element={
            <DashboardLayout>
              <div className="text-center text-muted-foreground">Settings page coming soon...</div>
            </DashboardLayout>
          } />
          <Route path="/activity-log" element={
            <DashboardLayout>
              <div className="text-center text-muted-foreground">Activity Log page coming soon...</div>
            </DashboardLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
