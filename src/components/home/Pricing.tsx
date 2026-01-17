import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { ref: contentRef, isVisible: contentVisible } = useScrollReveal();

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
        navigate('/validate');
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
              Premium Member
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              You're on the Premium Plan!
            </h2>
            <p className="text-lg text-muted-foreground">
              Enjoy full access to all premium features including 20 daily validations and detailed model comparisons.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/validate')}
              className="mt-6"
            >
              Go to Validator
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={compact ? "" : "py-20 sm:py-24 md:py-32 bg-card/30 border-y border-border"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div 
            ref={headerRef}
            className={`text-center space-y-4 mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
          >
            <Badge variant="outline" className="mb-2 rounded-full">Simple Pricing</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free with no credit card. Upgrade when you need more validations and deeper insights.
            </p>
          </div>

          <div 
            ref={contentRef}
            className={`grid md:grid-cols-2 gap-12 max-w-3xl mx-auto scroll-reveal ${contentVisible ? 'revealed' : ''}`}
          >
            {/* Free Plan */}
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Free</h3>
                <div className="text-5xl font-bold text-foreground">$0</div>
                <p className="text-muted-foreground mt-1">No credit card required</p>
              </div>
              
              <ul className="space-y-3 text-left text-muted-foreground">
                <li>• 2 validations per day</li>
                <li>• 3 AI models (GPT-5.2, Gemini Pro, Flash)</li>
                <li>• Consensus & dissent analysis</li>
                <li>• 2-3 recommendations per model</li>
                <li>• 3 action items</li>
              </ul>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full"
                onClick={() => handlePlanClick('free')}
              >
                {isLoggedIn ? 'Start Free Validation' : 'Get Started Free'}
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="text-center space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 rounded-full text-xs">
                  Best Value
                </Badge>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Premium</h3>
                <div className="text-5xl font-bold text-primary">$14.99</div>
                <p className="text-muted-foreground mt-1">per month</p>
              </div>
              
              <ul className="space-y-3 text-left text-muted-foreground">
                <li className="text-foreground font-medium">• 20 validations per day</li>
                <li className="text-foreground font-medium">• 4-5 recommendations per model</li>
                <li className="text-foreground font-medium">• 5-7 action items</li>
                <li>• Strategic alternatives section</li>
                <li>• Competitor insights</li>
                <li>• Long-term outlook (6-12 months)</li>
                <li>• Full model responses</li>
              </ul>
              
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => handlePlanClick('premium')}
              >
                {isLoggedIn ? 'Upgrade to Premium' : 'Get Premium Now'}
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-muted-foreground">
            <span>Cancel anytime</span>
            <span>•</span>
            <span>Instant access</span>
            <span>•</span>
            <span>Secure payment</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
