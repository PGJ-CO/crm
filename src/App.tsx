import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CRMProvider } from "@/contexts/CRMContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import LeadsInbox from "./pages/LeadsInbox";
import Leads from "./pages/Leads";
import Properties from "./pages/Properties";
import Campaigns from "./pages/Campaigns";
import Automations from "./pages/Automations";
import Tasks from "./pages/Tasks";
import Documents from "./pages/Documents";
import VendorsContractors from "./pages/VendorsContractors";
import Buyers from "./pages/Buyers";
import CompanyInfo from "./pages/CompanyInfo";
import PropertyDetail from "./pages/PropertyDetail";
import Contracts from "./pages/Contracts";
import SettingsPage from "./pages/Settings";
import LeadFinder from "./pages/LeadFinder";
import PropertySnapshot from "./pages/PropertySnapshot";
import SkipTrace from "./pages/SkipTrace";
import HeatMap from "./pages/HeatMap";
import DealScore from "./pages/DealScore";
import Foreclosures from "./pages/Foreclosures";
import MarketTrends from "./pages/MarketTrends";
import NeighborhoodAnalysis from "./pages/NeighborhoodAnalysis";
import PublicRecords from "./pages/PublicRecords";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CRMProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inbox" element={<LeadsInbox />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/automations" element={<Automations />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/vendors" element={<VendorsContractors />} />
              <Route path="/buyers" element={<Buyers />} />
              <Route path="/company" element={<CompanyInfo />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/lead-finder" element={<LeadFinder />} />
              <Route path="/property-snapshot/:id" element={<PropertySnapshot />} />
              <Route path="/skip-trace" element={<SkipTrace />} />
              <Route path="/heat-map" element={<HeatMap />} />
              <Route path="/deal-score" element={<DealScore />} />
              <Route path="/foreclosures" element={<Foreclosures />} />
              <Route path="/market-trends" element={<MarketTrends />} />
              <Route path="/neighborhood" element={<NeighborhoodAnalysis />} />
              <Route path="/public-records" element={<PublicRecords />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CRMProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
