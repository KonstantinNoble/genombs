import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import BusinessToolsAdvisor from "./pages/BusinessToolsAdvisor";
import MarketResearch from "./pages/MarketResearch";
import MyStrategies from "./pages/MyStrategies";
import StrategyDetail from "./pages/StrategyDetail";
import Contact from "./pages/Contact";
import PricingPage from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Imprint from "./pages/Imprint";
import TermsOfService from "./pages/TermsOfService";
import HowToWriteBusinessPlan from "./pages/HowToWriteBusinessPlan";
import BusinessStrategiesForSmallBusiness from "./pages/BusinessStrategiesForSmallBusiness";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import heroBackground from "@/assets/hero-background.jpg";

const queryClient = new QueryClient();

const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  return (
    <div className="min-h-screen relative">
      <div 
        className={`hidden sm:block fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none transition-all duration-1000 ease-in-out ${
          isHomePage ? 'blur-[2px] opacity-100' : 'blur-[8px] opacity-90'
        }`}
        style={{ backgroundImage: `url(${heroBackground})` }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <BackgroundWrapper>
            <ErrorBoundary>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/business-tools" element={<BusinessToolsAdvisor />} />
              <Route path="/market-research" element={<MarketResearch />} />
              <Route path="/my-strategies" element={<MyStrategies />} />
              <Route path="/strategy/:id" element={<StrategyDetail />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-to-write-a-business-plan" element={<HowToWriteBusinessPlan />} />
              <Route path="/business-strategies-for-small-business" element={<BusinessStrategiesForSmallBusiness />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/imprint" element={<Imprint />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </BackgroundWrapper>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
