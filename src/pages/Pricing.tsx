import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import FeatureComparisonTable from "@/components/genome/FeatureComparisonTable";
import FAQSection from "@/components/genome/FAQSection";

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
          description="Simple, transparent pricing for Business Genome."
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

  const freeFeatures = [
    { text: "3 growth reports per month", included: true },
    { text: "ICP identification", included: true },
    { text: "Audience channel analysis", included: true },
    { text: "Website optimization tips", included: true },
    { text: "Organic growth strategy", included: true },
    { text: "Paid ad strategy", included: false },
    { text: "Market size & opportunity data", included: false },
    { text: "Traffic data (SimilarWeb)", included: false },
    { text: "PDF export", included: false },
  ];

  const premiumFeatures = [
    { text: "Unlimited growth reports", included: true },
    { text: "ICP identification", included: true },
    { text: "Audience channel analysis", included: true },
    { text: "Website optimization tips", included: true },
    { text: "Organic growth strategy", included: true },
    { text: "Paid ad strategy", included: true },
    { text: "Market size & opportunity data", included: true },
    { text: "Traffic data (SimilarWeb)", included: true },
    { text: "PDF export", included: true },
    { text: "Priority support", included: true },
  ];

  const pricingFAQ = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your Premium subscription at any time. Your access will remain active until the end of the current billing period. No cancellation fees, no questions asked.",
    },
    {
      question: "What happens when I hit the free limit?",
      answer: "When you've used all 3 free growth reports in a month, you'll need to wait until the next month or upgrade to Premium for unlimited access. Your existing reports remain accessible.",
    },
    {
      question: "Do you offer annual billing?",
      answer: "We're working on annual billing with a discounted rate. Currently, Premium is available at $26.99/month. Sign up for our newsletter to be notified when annual plans launch.",
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 14-day money-back guarantee for new Premium subscribers. If you're not satisfied, contact us within 14 days for a full refund.",
    },
  ];

  const trustBadges = [
    { label: "Cancel anytime" },
    { label: "No credit card for free" },
    { label: "SSL encrypted" },
    { label: "GDPR compliant" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Pricing – Business Genome"
        description="Simple, transparent pricing. Start free with 3 growth reports per month. Upgrade for unlimited access."
        canonical="/pricing"
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            {isPremium && isLoggedIn ? (
              <Badge className="mb-4 bg-primary text-primary-foreground">Premium Member</Badge>
            ) : (
              <Badge variant="outline" className="mb-4">
                Simple, Transparent Pricing
              </Badge>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              {isPremium && isLoggedIn ? "You're all set" : "Choose your plan"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isPremium && isLoggedIn
                ? "You have full access to all Premium features."
                : "Start free with 3 growth reports per month. Upgrade when you need more."}
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="border border-border rounded-2xl p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Free</h3>
                <p className="text-muted-foreground mt-1">Get started at no cost</p>
              </div>
              <div className="text-4xl font-extrabold text-foreground">
                $0<span className="text-lg font-normal text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-2 text-foreground">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${feature.included ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <span className={feature.included ? "" : "text-muted-foreground/50"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
              >
                {isLoggedIn ? "Go to Dashboard" : "Get Started"}
              </Button>
            </div>

            {/* Premium */}
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
                {premiumFeatures.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-2 text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {feature.text}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => {
                  if (isPremium && isLoggedIn) {
                    navigate("/profile");
                  } else if (isLoggedIn) {
                    openCheckout(user?.email || undefined);
                  } else {
                    navigate("/auth?intent=premium");
                  }
                }}
              >
                {isPremium && isLoggedIn ? "Manage Subscription" : "Get Premium"}
              </Button>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                Full Feature Comparison
              </h2>
              <p className="text-lg text-muted-foreground">
                See exactly what's included in each plan.
              </p>
            </div>
            <Card className="border-border bg-card overflow-hidden">
              <FeatureComparisonTable />
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <FAQSection title="Pricing FAQ" items={pricingFAQ} />
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isPremium && isLoggedIn ? "You're all set" : "Ready to grow your business?"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isPremium && isLoggedIn
                ? "Head to your dashboard to start a new scan."
                : "Start free with 3 growth reports. No credit card required."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
              >
                {isLoggedIn ? "Go to Dashboard" : "Create Account"}
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
