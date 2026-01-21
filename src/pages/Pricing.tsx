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
      question: "How does this work?",
      answer: "You type a question. Three AI models – GPT-5, Gemini Pro, and Flash – each analyze it independently. They don't see each other's answers. Then we show you where they agree (strong signal), where most agree (worth considering), and where they disagree (dig deeper here)."
    },
    {
      question: "What do I actually get with Premium?",
      answer: "20 checks per day instead of 2. Detailed responses instead of summaries. Plus three sections free users don't see: backup strategies if Plan A fails, what competitors are doing, and where this decision might lead in 6-12 months."
    },
    {
      question: "When does my limit reset?",
      answer: "24 hours after your first check of the day. Free gets 2 per day, Premium gets 20. You'll see your remaining count and reset time on the validation page."
    },
    {
      question: "What kind of questions work best?",
      answer: "Specific business decisions you're actually facing. 'Should I raise prices 20%?' beats 'How do I make more money?' 'Should I focus on enterprise or SMB?' beats 'How do I grow?' The more concrete, the more useful the answer."
    },
    {
      question: "Can I try it before paying?",
      answer: "Yes. 2 free checks per day, no credit card needed. Enough to see if the multi-model approach is useful for how you make decisions."
    }
  ];

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Pricing - Start Free, Upgrade When You Need More"
          description="Try the multi-AI validator with 2 free checks per day. Need more? Premium gives you 20 daily validations for $14.99/month."
          keywords="AI tool pricing, business validation cost, GPT Gemini price"
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
        title="Pricing - Start Free, Upgrade When You Need More"
        description="Try the multi-AI validator with 2 free checks per day. Need more? Premium gives you 20 daily validations for $14.99/month."
        keywords="AI tool pricing, business validation cost, GPT Gemini price"
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
                : "Three opinions for $14.99/mo"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isPremium && isLoggedIn 
                ? "20 checks a day, full insights, competitor context, long-term outlook. All yours."
                : "Try it free first. When you need more depth – competitor insights, 6-month outlook, backup strategies – that's what Premium is for."}
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
                ? "Back to work" 
                : "Ready to try it?"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isPremium && isLoggedIn 
                ? "Your 20 daily checks are waiting. Full depth, full context."
                : "Three models, one question. See if it helps you think through decisions."}
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
