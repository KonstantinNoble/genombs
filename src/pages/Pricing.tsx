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
    { name: "Daily Validations", free: "2", premium: "20" },
    { name: "Recommendations per Model", free: "2-3", premium: "4-5" },
    { name: "Action Items", free: "3", premium: "5-7" },
    { name: "Strategic Alternatives", free: "—", premium: "✓" },
    { name: "Competitor Insights", free: "—", premium: "✓" },
    { name: "Long-term Outlook", free: "—", premium: "✓" },
    { name: "Full Model Responses", free: "—", premium: "✓" },
  ];

  const faqs = [
    {
      question: "How does multi-AI validation work?",
      answer: "Synoptas queries 3 AI models (GPT-5.2, Gemini 3 Pro, Gemini 2.5 Flash) in parallel. Each model analyzes your question independently, then our meta-evaluation identifies consensus (all agree), majority (2/3 agree), and dissent (disagreement) points – giving you validated recommendations with confidence scores."
    },
    {
      question: "What's the difference between Free and Premium?",
      answer: "Free users get 2 validations per day with 2-3 recommendations per model and 3 action items. Premium users get 20 daily validations, 4-5 recommendations per model, 5-7 action items, plus exclusive sections: Strategic Alternatives, Competitor Insights, and Long-term Outlook."
    },
    {
      question: "How do the daily validation limits work?",
      answer: "Your limit resets 24 hours after your first validation of the day. Free users get 2 validations, Premium users get 20. You can see your remaining count and reset time on the validation page."
    },
    {
      question: "What types of questions work best?",
      answer: "Strategic business questions work best: pricing decisions, market expansion, product launches, competitive positioning, hiring decisions, etc. Be specific for better results – 'Should I expand to enterprise clients or focus on SMB?' works better than 'How do I grow?'"
    },
    {
      question: "Can I try before subscribing?",
      answer: "Yes! Free users get 2 validations per day with no credit card required. You can experience the multi-AI consensus analysis before deciding to upgrade for more validations and deeper insights."
    }
  ];

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Pricing - Multi-AI Business Validator Plans"
          description="Get validated AI recommendations from $0. Premium $14.99/mo with 20 daily validations, detailed model analysis, and strategic insights. 3 AI models, one decision."
          keywords="multi-AI validation pricing, AI business validator, GPT-5 Gemini consensus, business decision tool, strategic validation, AI comparison tool"
          canonical="/pricing"
          ogImage="https://synoptas.com/favicon.png"
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
        title="Pricing - Multi-AI Business Validator Plans"
        description="Get validated AI recommendations from $0. Premium $14.99/mo with 20 daily validations, detailed model analysis, and strategic insights. 3 AI models, one decision."
        keywords="multi-AI validation pricing, AI business validator, GPT-5 Gemini consensus, business decision tool, strategic validation, AI comparison tool"
        canonical="/pricing"
        ogImage="https://synoptas.com/favicon.png"
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
                ? "You're on the Premium Plan!" 
                : "Multi-AI Validation for $14.99/mo"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isPremium && isLoggedIn 
                ? "Enjoy full access to all premium features including 20 daily validations and detailed model responses."
                : "Start free with no credit card. Get validated recommendations from 3 AI models analyzing your business questions in parallel."}
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
                ? "Continue Your Validation" 
                : "Ready to Start?"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isPremium && isLoggedIn 
                ? "Access your premium features and continue validating decisions with multi-AI analysis."
                : "Get validated recommendations from 3 AI models. No credit card required."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg"
                onClick={() => navigate(isPremium && isLoggedIn ? '/validate' : (isLoggedIn ? '/validate' : '/auth?intent=free'))}
              >
                {isPremium && isLoggedIn ? "Go to Validator" : "Start Free Validation"}
              </Button>
              {!isPremium && (
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => isLoggedIn ? openCheckout() : navigate('/auth?intent=premium')}
                >
                  Get Premium – $14.99/mo
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
