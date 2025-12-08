import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PricingProps {
  compact?: boolean;
}

const Pricing = ({ compact = false }: PricingProps) => {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const isLoggedIn = !!user;

  const handlePlanClick = async (plan: 'free' | 'premium') => {
    if (!user) {
      if (plan === 'premium') {
        navigate('/auth?intent=premium');
      } else {
        navigate('/auth?intent=free');
      }
    } else {
      if (plan === 'premium') {
        const checkoutUrl = `https://checkout.freemius.com/product/21730/plan/36437/?user_email=${user.email}&readonly_user=true`;
        window.open(checkoutUrl, '_blank');
      } else {
        navigate('/business-tools');
      }
    }
  };

  // Premium user view
  if (isLoggedIn && isPremium) {
    return (
      <section className={compact ? "" : "py-20 sm:py-24 md:py-32 bg-background/80 sm:bg-background/60 sm:backdrop-blur-sm border-y border-border"}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge className="bg-primary text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium Member
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              You're on the Premium Plan!
            </h2>
            <p className="text-lg text-muted-foreground">
              Enjoy unlimited access to all premium features including Deep Analysis with 6 phases, ROI projections, competitor analysis, and more.
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
    { text: "4 strategy phases per analysis", included: true },
    { text: "Actionable steps with Google search links", included: true },
    { text: "Optional context (budget, industry, timeline)", included: true },
    { text: "Deep Analysis Mode", included: false },
    { text: "Competitor & ROI Analysis", included: false },
  ];

  const premiumFeatures = [
    { text: "8 Analyses daily (6 Standard + 2 Deep)", included: true, highlight: true },
    { text: "6 comprehensive phases in Deep Mode", included: true, highlight: true },
    { text: "Competitor Analysis - Know your competition", included: true },
    { text: "ROI Projections - Expected returns calculated", included: true, highlight: true },
    { text: "A/B Test Suggestions - Data-driven testing ideas", included: true },
    { text: "Risk Mitigation Plans - IF metric drops, THEN do X", included: true },
    { text: "Weekly Breakdown - Step-by-step weekly tasks", included: true },
    { text: "KPI Milestones - Clear success metrics", included: true },
  ];

  return (
    <section className={compact ? "" : "py-20 sm:py-24 md:py-32 bg-background/80 sm:bg-background/60 sm:backdrop-blur-sm border-y border-border"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <Badge variant="outline" className="mb-2">Simple Pricing</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free with no credit card. Upgrade when you need advanced AI insights for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative flex flex-col border border-border shadow-md hover:shadow-lg transition-all duration-300">
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
            <Card className="relative flex flex-col border-2 border-primary shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg">
                  <Zap className="w-3 h-3 mr-1" />
                  Best Value
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Premium Plan</CardTitle>
                <CardDescription>For serious business optimization</CardDescription>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">$9.99</span>
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
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handlePlanClick('premium')}
                >
                  {isLoggedIn ? 'Upgrade to Premium' : 'Get Premium Now'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Instant access</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Secure payment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;