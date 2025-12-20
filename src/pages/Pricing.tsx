import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, TrendingUp, BarChart3, Target, Sparkles, Brain, Shield, Globe, Link } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";
import { SEOHead } from "@/components/seo/SEOHead";
import { FAQSchema } from "@/components/seo/StructuredData";

const PricingPage = () => {
  const navigate = useNavigate();
  const { openCheckout } = useFreemiusCheckout();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session) {
        const { data } = await supabase
          .from('user_credits')
          .select('is_premium')
          .eq('user_id', session.user.id)
          .single();
        
        setIsPremium(data?.is_premium ?? false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        setTimeout(async () => {
          const { data } = await supabase
            .from('user_credits')
            .select('is_premium')
            .eq('user_id', session.user.id)
            .single();
          
          setIsPremium(data?.is_premium ?? false);
        }, 0);
      } else {
        setIsPremium(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Live Market Intelligence",
      description: "Every analysis is powered by real-time web research, analyzing 20+ sources to deliver current market trends and competitor insights."
    },
    {
      icon: <Link className="h-6 w-6" />,
      title: "Website Analysis",
      description: "Enter your website URL to receive strategies tailored to your actual website content, branding, and business offerings."
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Deep Analysis Mode",
      description: "Advanced analysis with competitor insights, ROI projections, and risk mitigation strategies."
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Autopilot",
      description: "Get 3 AI-generated daily focus tasks tailored to your strategy. Stay on track with personalized action items and streak tracking."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "ROI Projections",
      description: "Every Deep Analysis includes expected return on investment with realistic assumptions to prioritize high-impact strategies."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Strategy Tracking",
      description: "Activate strategies and track your progress. Monitor completed phases and actions with visual progress indicators."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Competitor Analysis",
      description: "Know your competition's strengths and weaknesses to position yourself better in the market."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk Mitigation",
      description: "Backup strategies with specific triggers - IF metric drops below target, THEN execute this backup plan."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "8x Daily Analyses",
      description: "6 Standard + 2 Deep analyses per day compared to 2 for free users. More strategies, more insights."
    }
  ];

  const comparisonFeatures = [
    { name: "Daily Analyses", free: "2 Standard", premium: "6 Standard + 2 Deep" },
    { name: "Market Research Sources", free: "10+ sources", premium: "20+ sources" },
    { name: "Phases per Analysis", free: "4", premium: "4" },
    { name: "Actionable Steps", free: true, premium: true },
    { name: "Google Search Links", free: true, premium: true },
    { name: "Website Analysis", free: true, premium: true },
    { name: "Optional Context Input", free: true, premium: true },
    { name: "Deep Analysis Mode", free: false, premium: true },
    { name: "AI Autopilot (3 daily tasks)", free: false, premium: true },
    { name: "Strategy Tracking", free: false, premium: true },
    { name: "Competitor Analysis", free: false, premium: true },
    { name: "ROI Projections", free: false, premium: true },
    { name: "Risk Mitigation Plans", free: false, premium: true }
  ];

  const faqs = [
    {
      question: "How does the real-time market research work?",
      answer: "Our AI actively researches the web during each analysis, gathering current market data, competitor information, and industry trends from 10-20+ sources. This means your strategies are always based on up-to-date information, not outdated datasets."
    },
    {
      question: "How does the Website Analysis feature work?",
      answer: "When you enter your website URL, our AI scrapes and analyzes your website content, branding, and offerings. This information is then used to create highly personalized strategies that match your actual business, rather than generic recommendations."
    },
    {
      question: "What's the difference between Standard and Deep Analysis?",
      answer: "Standard Analysis creates a 4-phase business strategy with actionable steps and Google search links, backed by 10+ research sources. Deep Analysis (Premium only) adds competitor analysis, ROI projections, risk mitigation plans, and uses 20+ sources for more comprehensive insights."
    },
    {
      question: "How do the daily analysis limits work?",
      answer: "Free users get 2 Standard analyses per day. Premium users get 6 Standard + 2 Deep analyses daily - that's 8 total analyses! Limits reset every 24 hours from your first daily analysis."
    },
    {
      question: "What optional context can I provide?",
      answer: "You can add budget range, industry, current marketing channels, timeline, and geographic target. The AI uses this context to create more relevant and specific strategies tailored to your situation."
    }
  ];

  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-[8px] flex flex-col">
      <SEOHead
        title="Pricing - AI Business Strategy Plans"
        description="Get AI-powered business strategies starting at $0. Premium plan $9.99/mo with deep analysis, ROI projections, and AI Autopilot. No credit card required."
        keywords="pricing, AI business strategy, business analysis plans, premium features, deep analysis, ROI projections"
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
                : "Powerful AI Analysis for Just $9.99/mo"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isPremium && isLoggedIn 
                ? "Enjoy unlimited access to all premium features including Deep Analysis with ROI projections, competitor analysis, and risk mitigation."
                : "Start free with no credit card. Get AI-powered business strategies with actionable steps and Google search links."}
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
                      <div className="text-4xl font-bold text-primary">20+</div>
                      <div className="text-sm text-muted-foreground mt-1">Sources Analyzed</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary">8</div>
                      <div className="text-sm text-muted-foreground mt-1">Daily Analyses</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary">4</div>
                      <div className="text-sm text-muted-foreground mt-1">Phases per Analysis</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary">ROI</div>
                      <div className="text-sm text-muted-foreground mt-1">Projections Included</div>
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
                        <div className="text-sm font-normal text-primary">$9.99/mo</div>
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
                  ? "Access your premium features and continue optimizing with advanced AI analysis."
                  : "Join thousands of businesses using AI to make smarter decisions. Start free, upgrade anytime."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate(isPremium && isLoggedIn ? '/business-tools' : (isLoggedIn ? '/business-tools' : '/auth?intent=free'))}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-6 text-lg hover:scale-105 transition-all duration-300"
                >
                  {isPremium && isLoggedIn ? "Go to Dashboard" : "Start Free Analysis"}
                </Button>
                {!isPremium && (
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => isLoggedIn ? openCheckout() : navigate('/auth?intent=premium')}
                    className="px-8 py-6 text-lg hover:scale-105 transition-all duration-300"
                  >
                    Get Premium - $9.99/mo
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