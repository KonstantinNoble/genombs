import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, TrendingUp, FileText, BarChart3, Target, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const PricingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Get personalized recommendations using advanced AI models trained for website optimization and business strategy."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "ROI Focused",
      description: "Every recommendation includes expected ROI calculations and risk assessments to help you make informed decisions."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Detailed Reports",
      description: "Premium users get comprehensive PDF reports with step-by-step implementation guides and timelines."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Deep Analysis Mode",
      description: "Premium exclusive: Get 8-10 detailed recommendations with prerequisites, metrics, and risk levels."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Tailored Recommendations",
      description: "Analysis based on your specific website type, status, budget, and business goals - no generic advice."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Daily Analysis Credits",
      description: "Free users get 2 analyses per day. Premium users get 6 standard + 2 deep analyses daily."
    }
  ];

  const comparisonFeatures = [
    { name: "Standard Analyses per day", free: "2", premium: "6" },
    { name: "Deep Analyses per day", free: "0", premium: "2" },
    { name: "Website Tool Recommendations", free: true, premium: true },
    { name: "Business Improvement Ideas", free: true, premium: true },
    { name: "Budget-Based Suggestions", free: true, premium: true },
    { name: "Detailed Implementation Steps", free: false, premium: true },
    { name: "ROI Calculations", free: false, premium: true },
    { name: "Risk Assessment", free: false, premium: true },
    { name: "Implementation Timeline", free: false, premium: true },
    { name: "Success Metrics", free: false, premium: true },
    { name: "PDF Export", free: false, premium: true },
    { name: "Priority Support", free: false, premium: true }
  ];

  const faqs = [
    {
      question: "What's the difference between Standard and Deep Analysis?",
      answer: "Standard Analysis provides 5-7 quick recommendations perfect for getting started. Deep Analysis (Premium only) delivers 8-10 comprehensive recommendations with detailed step-by-step implementation guides, ROI calculations, risk assessments, and timelines."
    },
    {
      question: "How do daily analysis limits work?",
      answer: "Free users get 2 standard analyses per day. Premium users get 6 standard analyses and 2 deep analyses per day. Limits reset every 24 hours from your first analysis."
    },
    {
      question: "Can I cancel my Premium subscription anytime?",
      answer: "Yes, you can cancel your Premium subscription at any time. You'll continue to have Premium access until the end of your current billing period."
    },
    {
      question: "What types of websites can I analyze?",
      answer: "Our AI supports all website types including E-commerce, SaaS, Blogs, Portfolios, Service websites, Non-profits, and more. Recommendations are tailored to your specific website type and business model."
    },
    {
      question: "Do I need a credit card for the Free Plan?",
      answer: "No credit card required for the Free Plan. Simply sign up with your email and start getting AI recommendations immediately."
    },
    {
      question: "What AI model powers the analysis?",
      answer: "We use Google's Gemini 2.5 Flash model, optimized for business analysis, strategic recommendations, and website optimization insights."
    }
  ];

  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-[8px] flex flex-col">
      <Helmet>
        <title>Pricing - AI Website Analysis Plans | Synoptas</title>
        <meta 
          name="description" 
          content="Choose the perfect AI website analysis plan. Start free with 2 daily analyses or upgrade to Premium for deep analysis, ROI calculations, and PDF reports. No hidden fees." 
        />
        <meta name="keywords" content="pricing, AI website analysis, website optimization pricing, business analysis plans, premium features" />
        <link rel="canonical" href="https://synoptas.com/pricing" />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge className="mb-4">Simple, Transparent Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              Choose the Plan That Fits Your Needs
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with our Free Plan and upgrade when you need advanced AI analysis. No hidden fees, no commitments.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <Pricing compact={false} />

        {/* Features Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Why Choose Our AI Analysis?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional website optimization insights powered by advanced AI technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
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
                Feature Comparison
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
                      <th className="text-center p-4 font-semibold">Free Plan</th>
                      <th className="text-center p-4 font-semibold bg-primary/5">Premium Plan</th>
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
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="font-semibold">{feature.free}</span>
                          )}
                        </td>
                        <td className="text-center p-4 bg-primary/5">
                          {typeof feature.premium === 'boolean' ? (
                            feature.premium ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="font-semibold text-primary">{feature.premium}</span>
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

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-border hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Ready to Optimize Your Website?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start with our Free Plan today. No credit card required, get instant AI-powered recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate(isLoggedIn ? '/business-tools' : '/auth?intent=free')}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-6 text-lg hover:scale-105 transition-all duration-300"
                >
                  Start Free Analysis
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate(isLoggedIn ? '/business-tools' : '/auth?intent=premium')}
                  className="px-8 py-6 text-lg hover:scale-105 transition-all duration-300"
                >
                  View Premium Benefits
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-4">
                Join users who trust AI to make better website decisions
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
