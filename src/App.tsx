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

import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PricingPage from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Imprint from "./pages/Imprint";
import TermsOfService from "./pages/TermsOfService";
import heroBackground from "@/assets/hero-background.jpg";

const queryClient = new QueryClient();

const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  return (
    <div className="min-h-screen relative">
      <div 
        className={`hidden sm:block fixed inset-0 bg-cover bg-center bg-no-repeat z-0 transition-all duration-500 pointer-events-none ${
          isHomePage ? 'blur-[2px]' : 'blur-[8px]'
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
              
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/imprint" element={<Imprint />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
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
