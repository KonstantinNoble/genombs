import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface PricingProps {
  compact?: boolean;
}

const Pricing = ({ compact = false }: PricingProps) => {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const { openCheckout } = useFreemiusCheckout();
  const isLoggedIn = !!user;
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: freeCardRef, isVisible: freeCardVisible } = useScrollReveal();
  const { ref: premiumCardRef, isVisible: premiumCardVisible } = useScrollReveal();
  const { ref: trustRef, isVisible: trustVisible } = useScrollReveal();

  const handlePlanClick = async (plan: 'free' | 'premium') => {
    if (!user) {
      if (plan === 'premium') {
        navigate('/auth?intent=premium');
      } else {
        navigate('/auth?intent=free');
      }
    } else {
      if (plan === 'premium') {
        openCheckout();
      } else {
        navigate('/business-tools');
      }
    }
  };

  // Premium user view
  if (isLoggedIn && isPremium) {
    return (
      <section className={compact ? "" : "py-20 sm:py-24 md:py-32 bg-card/30 border-y border-border"}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={headerRef}
            className={`max-w-3xl mx-auto text-center space-y-6 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
          >
            <Badge className="bg-primary text-primary-foreground rounded-full px-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium Member
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              You're on the Premium Plan!
            </h2>
            <p className="text-lg text-muted-foreground">
              Enjoy unlimited access to all premium features including Deep Analysis with ROI projections, competitor analysis, and risk mitigation.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/business-tools')}
              className="mt-6"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const freeFeatures = [
    { text: "2 AI Business Analyses per day", included: true },
    { text: "Website Analysis for personalized insights", included: true },
    { text: "4 strategy phases per analysis", included: true },
    { text: "Actionable steps with resource links", included: true },
    { text: "Deep Analysis Mode", included: false },
  ];

  const premiumFeatures = [
    { text: "8 Analyses daily (6 Standard + 2 Deep)", included: true, highlight: true },
    { text: "Website Analysis with detailed content extraction", included: true, highlight: true },
    { text: "6 strategy phases with Deep Analysis", included: true, highlight: true },
    { text: "Competitor Analysis with market insights", included: true },
    { text: "ROI Projections with realistic growth metrics", included: true },
    { text: "Risk mitigation strategies", included: true },
  ];

  return (
    <section className={compact ? "" : "py-20 sm:py-24 md:py-32 bg-card/30 border-y border-border"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div 
            ref={headerRef}
            className={`text-center space-y-4 mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
          >
            <Badge variant="outline" className="mb-2 rounded-full">Simple Pricing</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free with no credit card. Upgrade when you need advanced AI insights for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card 
              ref={freeCardRef}
              className={`relative flex flex-col border border-border shadow-md hover:shadow-lift transition-all duration-300 rounded-2xl scroll-reveal ${freeCardVisible ? 'revealed' : ''}`}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Free Plan</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">No credit card required</p>
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <ul className="space-y-3 text-sm">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground/70"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handlePlanClick('free')}
                >
                  {isLoggedIn ? 'Start Free Analysis' : 'Get Started Free'}
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card 
              ref={premiumCardRef}
              className={`relative flex flex-col border-2 border-primary shadow-xl hover:shadow-lift transition-all duration-300 bg-primary/5 rounded-2xl scroll-reveal ${premiumCardVisible ? 'revealed' : ''}`}
              style={{ transitionDelay: '0.1s' }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg rounded-full">
                  <Zap className="w-3 h-3 mr-1" />
                  Best Value
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Premium Plan</CardTitle>
                <CardDescription>For serious business optimization</CardDescription>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">$14.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-primary font-medium mt-2">
                  Best value for business growth
                </p>
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <ul className="space-y-3 text-sm">
                  {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 shrink-0 mt-0.5 ${feature.highlight ? 'text-primary' : 'text-primary/70'}`} />
                      <span className={feature.highlight ? 'font-medium' : ''}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => handlePlanClick('premium')}
                >
                  {isLoggedIn ? 'Upgrade to Premium' : 'Get Premium Now'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Trust indicators */}
          <div 
            ref={trustRef}
            className={`flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-muted-foreground scroll-reveal ${trustVisible ? 'revealed' : ''}`}
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent-warm" />
              <span>Instant access</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent-cool" />
              <span>Secure payment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
