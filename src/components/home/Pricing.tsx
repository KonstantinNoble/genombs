import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      // Not logged in
      if (plan === 'premium') {
        navigate('/auth?intent=premium');
      } else {
        navigate('/auth?intent=free');
      }
    } else {
      // Logged in
      if (plan === 'premium') {
        const checkoutUrl = `https://checkout.freemius.com/product/21730/plan/36437/?user_email=${user.email}&readonly_user=true`;
        window.open(checkoutUrl, '_blank');
      } else {
        navigate('/business-tools');
      }
    }
  };

  // If user is premium, show different view
  if (isLoggedIn && isPremium) {
    return (
      <section className={compact ? "" : "py-20 sm:py-24 md:py-32 bg-background/80 sm:bg-background/60 sm:backdrop-blur-sm border-y border-border"}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge className="bg-primary text-primary-foreground">Premium Member</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              You're on the Premium Plan!
            </h2>
            <p className="text-lg text-muted-foreground">
              Enjoy unlimited access to all premium features including deep analysis, ROI calculations, and detailed implementation strategies.
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

  return (
      <section className={compact ? "" : "py-20 sm:py-24 md:py-32 bg-background/80 sm:bg-background/60 sm:backdrop-blur-sm border-y border-border"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you need advanced AI analysis. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative flex flex-col border border-border shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Free Plan</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>2 AI Analyses per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Standard Analysis Mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>5-7 recommendations per analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Basic implementation guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">✗</span>
                    <span className="text-muted-foreground">No Deep Analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">✗</span>
                    <span className="text-muted-foreground">No Custom Requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">✗</span>
                    <span className="text-muted-foreground">No ROI calculations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">✗</span>
                    <span className="text-muted-foreground">No PDF export</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handlePlanClick('free')}
                >
                  {isPremium ? 'Start Premium Analysis' : (isLoggedIn ? 'Start Free Analysis' : 'Get Started Free')}
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className="relative flex flex-col border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Premium Plan</CardTitle>
                <CardDescription>For serious website optimization</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-foreground">$17.99</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>6 Standard + 2 Deep Analyses per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>8-10 detailed recommendations in Deep Mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span><strong>Custom Requirements</strong> - Tell AI exactly what you need</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Detailed implementation steps & timelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>ROI calculations & risk assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Prerequisites & success metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>PDF export of all analyses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>All Free Plan features included</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => handlePlanClick('premium')}
                >
                  {isLoggedIn ? 'Upgrade to Premium' : 'Get Premium'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
