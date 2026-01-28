import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { useNavigate } from "react-router-dom";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";
import { SEOHead } from "@/components/seo/SEOHead";
import { FAQSchema } from "@/components/seo/StructuredData";
import { useAuth } from "@/contexts/AuthContext";

const PricingPage = () => {
  const navigate = useNavigate();
  const { openCheckout } = useFreemiusCheckout();
  const { user, isPremium, isLoading } = useAuth();
  const isLoggedIn = !!user;

  const comparisonFeatures = [
    { name: "Decision Records per Day", free: "2", premium: "10" },
    { name: "Documented Perspectives", free: "3", premium: "3" },
    { name: "Team Workspaces", free: "—", premium: "Up to 5" },
    { name: "Team Members", free: "—", premium: "5 per team" },
    { name: "Strategic Alternatives", free: "—", premium: "✓" },
    { name: "6-12 Month Outlook", free: "—", premium: "✓" },
    { name: "Full Model Reasoning", free: "—", premium: "✓" },
    { name: "PDF Audit Reports", free: "—", premium: "✓" },
  ];

  const faqs = [
    {
      question: "How does decision documentation work?",
      answer: "Describe your decision context. Three AI models – GPT-5, Gemini Pro, and Flash – analyze it independently without seeing each other's responses. We show you consensus, majority, and dissent. Everything is documented with timestamps."
    },
    {
      question: "What does Premium include?",
      answer: "10 decision records per day instead of 2. Full perspective documentation with complete reasoning. Plus strategic alternatives, competitive context analysis, and 6-12 month outlook. Stakeholder-ready PDF exports included."
    },
    {
      question: "How does team collaboration work?",
      answer: "Premium subscribers can create up to 5 team workspaces with 5 members each. Team members can view and create shared decision records without needing their own Premium subscription – only the workspace owner needs Premium. Perfect for small teams, investment committees, or advisory boards."
    },
    {
      question: "When does my daily limit reset?",
      answer: "24 hours after your first record of the day. Free accounts get 2 records per day, Premium gets 10."
    },
    {
      question: "What types of decisions work best?",
      answer: "Decisions you might need to justify later: investment decisions, strategic pivots, major hires, pricing changes, vendor selections. The more consequential, the more valuable the documentation."
    },
    {
      question: "Can I try it before paying?",
      answer: "Yes. 2 free decision records per day, no credit card required. Enough to evaluate whether documented decisions fit your workflow."
    }
  ];

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Pricing – Professional Decision Documentation"
          description="Start free with 2 decision records per day. Premium ($26.99/mo) unlocks 10 daily records, stakeholder-ready PDF exports, competitive context, and 6-12 month outlook."
          keywords="decision documentation pricing, audit trail cost, business decision tool, premium features"
          canonical="/pricing"
          ogImage="https://synoptas.com/synoptas-favicon.png"
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
        title="Pricing – Professional Decision Documentation"
        description="Start free with 2 decision records per day. Premium ($26.99/mo) unlocks 10 daily records, stakeholder-ready PDF exports, competitive context, and 6-12 month outlook."
        keywords="decision documentation pricing, audit trail cost, business decision tool, premium features"
        canonical="/pricing"
        ogImage="https://synoptas.com/synoptas-favicon.png"
      />
      <FAQSchema
        faqs={faqs.map(faq => ({ question: faq.question, answer: faq.answer }))}
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
                : "Professional Decision Documentation"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isPremium && isLoggedIn 
                ? "10 records a day, full audit trails, competitive context, long-term outlook. All yours."
                : "Document decisions with audit-grade precision. Upgrade when you need deeper insights and stakeholder-ready exports."}
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <Pricing compact={false} />

        {/* Comparison Table */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Free vs Premium
              </h2>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium">Feature</th>
                    <th className="text-center p-4 font-medium">Free</th>
                    <th className="text-center p-4 font-medium text-primary">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="p-4">{feature.name}</td>
                      <td className="text-center p-4 text-muted-foreground">{feature.free}</td>
                      <td className="text-center p-4 font-medium">{feature.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-border pb-6 last:border-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isPremium && isLoggedIn 
                ? "Back to documenting" 
                : "Ready to document your decisions?"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isPremium && isLoggedIn 
                ? "Your 10 daily records are ready. Full documentation, full context."
                : "Three perspectives, one documented decision. See how it protects your process."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg"
                onClick={() => navigate(isPremium && isLoggedIn ? '/validate' : (isLoggedIn ? '/validate' : '/auth?intent=free'))}
              >
                {isPremium && isLoggedIn ? "Open Decision Records" : "Create Your First Record"}
              </Button>
              {!isPremium && (
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => isLoggedIn ? openCheckout() : navigate('/auth?intent=premium')}
                >
                  Get Premium – $26.99/mo
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
