import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    { text: "Business Snapshot (basics)", included: true },
    { text: "Performance Radar Chart", included: true },
    { text: "ICP Profiles (basics)", included: true },
    { text: "Channel Overview (basics)", included: true },
    { text: "Optimization Recommendations", included: true },
    { text: "Competitor Analysis", included: false },
    { text: "Score Insights + Next Steps", included: false },
    { text: "Industry Benchmarks", included: false },
    { text: "ICP Buying Triggers & Objections", included: false },
    { text: "SEO Keywords + Paid Channel Data", included: false },
    { text: "PDF export", included: false },
  ];

  const premiumFeatures = [
    { text: "Unlimited growth reports", included: true },
    { text: "Competitor Analysis", included: true },
    { text: "Detailed Score Insights + Next Steps", included: true },
    { text: "Industry Benchmarks", included: true },
    { text: "ICP Buying Triggers & Objections", included: true },
    { text: "SEO Keywords + Paid Channel Data", included: true },
    { text: "Channel Links, Formats & Frequency", included: true },
    { text: "Optimization Effort & Outcomes", included: true },
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
    "Cancel anytime",
    "No credit card for free",
    "SSL encrypted",
    "GDPR compliant",
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
          <div className="max-w-2xl mx-auto text-center">
            {isPremium && isLoggedIn ? (
              <p className="text-sm uppercase tracking-widest text-primary font-medium mb-5">Premium Member</p>
            ) : (
              <p className="text-sm uppercase tracking-widest text-primary font-medium mb-5">
                Simple, Transparent Pricing
              </p>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.08] mb-5">
              {isPremium && isLoggedIn ? "You're all set" : "Choose your plan"}
            </h1>
            <p className="text-lg text-muted-foreground">
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
            <div className="border border-border rounded-xl p-8 sm:p-10 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Free</h3>
                <p className="text-muted-foreground mt-1">Get started at no cost</p>
              </div>
              <div>
                <span className="text-5xl font-extrabold text-foreground">$0</span>
                <span className="text-lg text-muted-foreground ml-1">/mo</span>
              </div>
              <ul className="space-y-3.5">
                {freeFeatures.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${feature.included ? "bg-primary" : "bg-muted-foreground/20"}`} />
                    <span className={feature.included ? "text-foreground" : "text-muted-foreground/40 line-through"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => navigate(isLoggedIn ? "/chat" : "/auth")}
              >
                {isLoggedIn ? "Go to Dashboard" : "Get Started"}
              </Button>
            </div>

            {/* Premium */}
            <div className="border-2 border-primary rounded-xl p-8 sm:p-10 space-y-8 relative bg-primary/5">
              <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground">
                Recommended
              </Badge>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Premium</h3>
                <p className="text-muted-foreground mt-1">Full access to everything</p>
              </div>
              <div>
                <span className="text-5xl font-extrabold text-foreground">$26.99</span>
                <span className="text-lg text-muted-foreground ml-1">/mo</span>
              </div>
              <ul className="space-y-3.5">
                {premiumFeatures.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    {feature.text}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full h-12"
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
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-0">
              {trustBadges.map((badge, i) => (
                <div key={badge} className="flex items-center">
                  <span className="text-sm text-muted-foreground px-4 py-2">{badge}</span>
                  {i < trustBadges.length - 1 && (
                    <span className="hidden sm:block w-px h-4 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                Full Feature Comparison
              </h2>
              <p className="text-lg text-muted-foreground">
                See exactly what's included in each plan.
              </p>
            </div>
            <div className="border border-border rounded-xl overflow-hidden">
              <FeatureComparisonTable />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <FAQSection title="Pricing FAQ" items={pricingFAQ} />
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <div className="border border-border rounded-xl p-10 sm:p-14 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                {isPremium && isLoggedIn ? "You're all set" : "Ready to grow your business?"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {isPremium && isLoggedIn
                  ? "Head to your dashboard to start a new scan."
                  : "Start free with 3 growth reports. No credit card required."}
              </p>
              <div className="pt-2">
                <Button
                  size="lg"
                  className="px-10 h-13"
                  onClick={() => navigate(isLoggedIn ? "/chat" : "/auth")}
                >
                  {isLoggedIn ? "Go to Dashboard" : "Create Account"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
