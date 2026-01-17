import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, TrendingUp, BarChart3, Target, Sparkles, Brain, Shield, Globe, Link, Loader2 } from "lucide-react";
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

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "3 AI Models in Parallel",
      description: "GPT-5.2, Gemini 3 Pro, and Gemini 2.5 Flash analyze your question simultaneously. Get validated insights from multiple perspectives in ~20 seconds."
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Consensus & Dissent Analysis",
      description: "See where all models agree (high confidence) and where they disagree (worth deeper consideration). Uncover hidden risks and nuances."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "4-5 Recommendations per Model",
      description: "Premium users get more detailed analysis with 4-5 recommendations per model instead of 2-3 for free users."
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "5-7 Action Items",
      description: "Concrete, prioritized action items you can execute immediately. Free users get 3 action items, Premium gets 5-7."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Strategic Alternatives",
      description: "Exclusive Premium section with alternative approaches when your primary strategy faces obstacles."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Competitor Insights",
      description: "Premium-only analysis of how competitors might respond to your strategic moves and positioning."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Long-term Outlook",
      description: "Premium section with 6-12 month projections and milestones to track your strategic progress."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "20 Daily Validations",
      description: "Premium users get 20 validations per day compared to 2 for free users. Validate more decisions, faster."
    }
  ];

  const comparisonFeatures = [
    { name: "Daily Validations", free: "2", premium: "20" },
    { name: "AI Models", free: "3 (GPT-5.2, Gemini 3 Pro, Flash)", premium: "3 (GPT-5.2, Gemini 3 Pro, Flash)" },
    { name: "Consensus Analysis", free: true, premium: true },
    { name: "Dissent Analysis", free: true, premium: true },
    { name: "Risk/Creativity Sliders", free: true, premium: true },
    { name: "Recommendations per Model", free: "2-3", premium: "4-5" },
    { name: "Action Items", free: "3", premium: "5-7" },
    { name: "Strategic Alternatives", free: false, premium: true },
    { name: "Competitor Insights", free: false, premium: true },
    { name: "Long-term Outlook", free: false, premium: true },
    { name: "Full Model Responses", free: false, premium: true },
    { name: "Experiment Workflow", free: true, premium: true }
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
      <div className="min-h-screen bg-background/80 backdrop-blur-[8px] flex flex-col">
        <SEOHead
          title="Pricing - AI Business Plan Generator Plans"
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
    <div className="min-h-screen bg-background/80 backdrop-blur-[8px] flex flex-col">
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
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            {isPremium && isLoggedIn ? (
              <Badge className="mb-4 bg-primary text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium Member
              </Badge>
            ) : (
              <Badge variant="outline" className="mb-4">Simple, Transparent Pricing</Badge>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              {isPremium && isLoggedIn 
                ? "You're on the Premium Plan!" 
                : "Powerful AI Analysis for Just $14.99/mo"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isPremium && isLoggedIn 
                ? "Enjoy full access to all premium features including 20 daily validations, detailed model responses, and exclusive strategic insights."
                : "Start free with no credit card. Get validated recommendations from 3 AI models analyzing your business questions in parallel."}
            </p>
            {!isPremium && !isLoggedIn && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Cancel anytime • Secure payment • Instant access</span>
              </div>
            )}
          </div>
        </section>

        {/* Pricing Cards */}
        <Pricing compact={false} />

        {/* Value Proposition */}
        {!isPremium && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-8">
                <div className="grid md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-4xl font-bold text-primary">3</div>
                      <div className="text-sm text-muted-foreground mt-1">AI Models</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary">20</div>
                      <div className="text-sm text-muted-foreground mt-1">Daily Validations</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary">~20s</div>
                      <div className="text-sm text-muted-foreground mt-1">Results Time</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary">5-7</div>
                      <div className="text-sm text-muted-foreground mt-1">Action Items</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Features Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="outline">Premium Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Everything You Get with Premium
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Unlock the full potential of AI-powered business analysis
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-background/60">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Free vs Premium Comparison
              </h2>
              <p className="text-lg text-muted-foreground">
                See exactly what you get with each plan
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">
                        <div>Free</div>
                        <div className="text-sm font-normal text-muted-foreground">$0/mo</div>
                      </th>
                      <th className="text-center p-4 font-semibold bg-primary/5">
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="h-4 w-4 text-primary" />
                          Premium
                        </div>
                        <div className="text-sm font-normal text-primary">$14.99/mo</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="text-center p-4">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.free}</span>
                          )}
                        </td>
                        <td className="text-center p-4 bg-primary/5">
                          {typeof feature.premium === 'boolean' ? (
                            feature.premium ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-primary">{feature.premium}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about our pricing and features
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-border hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="text-center space-y-6 py-16 px-6">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {isPremium && isLoggedIn ? "Premium Access" : "Limited Time Offer"}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                {isPremium && isLoggedIn 
                  ? "Continue Your Analysis" 
                  : "Start Optimizing Your Business Today"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isPremium && isLoggedIn 
                  ? "Access your premium features and continue validating decisions with multi-AI analysis."
                  : "Join thousands of businesses using multi-AI validation to make smarter decisions. Start free, upgrade anytime."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate(isPremium && isLoggedIn ? '/validate' : (isLoggedIn ? '/validate' : '/auth?intent=free'))}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-6 text-lg hover:scale-105 transition-all duration-300"
                >
                  {isPremium && isLoggedIn ? "Go to Validator" : "Start Free Validation"}
                </Button>
                {!isPremium && (
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => isLoggedIn ? openCheckout() : navigate('/auth?intent=premium')}
                    className="px-8 py-6 text-lg hover:scale-105 transition-all duration-300"
                  >
                    Get Premium - $14.99/mo
                  </Button>
                )}
              </div>
              {!isPremium && (
                <p className="text-sm text-muted-foreground pt-4">
                  No credit card required for free plan • Cancel premium anytime
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;