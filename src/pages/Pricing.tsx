import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";

const PricingPage = () => {
  const navigate = useNavigate();
  const { openCheckout } = useFreemiusCheckout();
  const { user, isPremium, isLoading } = useAuth();
  const isLoggedIn = !!user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Pricing"
          description="Simple, transparent pricing for Synoptas."
          canonical="/pricing"
        />
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading pricing...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Pricing"
        description="Simple, transparent pricing for Synoptas. Start free, upgrade when you need more."
        canonical="/pricing"
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            {isPremium && isLoggedIn ? (
              <Badge className="mb-4 bg-primary text-primary-foreground">
                Premium Member
              </Badge>
            ) : (
              <Badge variant="outline" className="mb-4">Simple, Transparent Pricing</Badge>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              {isPremium && isLoggedIn 
                ? "You're all set" 
                : "Choose your plan"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isPremium && isLoggedIn 
                ? "You have full access to all Premium features."
                : "Start free. Upgrade when you need more."}
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="border border-border rounded-2xl p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Free</h3>
                <p className="text-muted-foreground mt-1">Get started at no cost</p>
              </div>
              <div className="text-4xl font-extrabold text-foreground">
                $0<span className="text-lg font-normal text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Basic access
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(isLoggedIn ? '/profile' : '/auth')}
              >
                {isLoggedIn ? "Current Plan" : "Get Started"}
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="border-2 border-primary rounded-2xl p-8 space-y-6 relative">
              <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground">
                Recommended
              </Badge>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Premium</h3>
                <p className="text-muted-foreground mt-1">Full access to everything</p>
              </div>
              <div className="text-4xl font-extrabold text-foreground">
                $26.99<span className="text-lg font-normal text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Everything in Free
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Premium features
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Priority support
                </li>
              </ul>
              <Button
                className="w-full"
                onClick={() => {
                  if (isPremium && isLoggedIn) {
                    navigate('/profile');
                  } else if (isLoggedIn) {
                    openCheckout(user?.email || undefined);
                  } else {
                    navigate('/auth?intent=premium');
                  }
                }}
              >
                {isPremium && isLoggedIn ? "Manage Subscription" : "Get Premium"}
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isPremium && isLoggedIn 
                ? "You're all set" 
                : "Ready to get started?"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isPremium && isLoggedIn 
                ? "Head back to your profile to manage your account."
                : "Join Synoptas today and see the difference."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg"
                onClick={() => navigate(isLoggedIn ? '/profile' : '/auth')}
              >
                {isLoggedIn ? "Go to Profile" : "Create Account"}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
