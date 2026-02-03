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
      <section className={compact ? "" : "py-24 sm:py-28 md:py-36"}>
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
              Enjoy full access to all premium features including 10 daily validations and detailed model comparisons.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/validate')}
              className="mt-6 rounded-2xl px-8 py-6"
            >
              Go to Validator
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={compact ? "" : "py-24 sm:py-28 md:py-36"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div 
            ref={headerRef}
            className={`text-center mb-20 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
          >
            <span className="text-subtitle tracking-widest text-primary/80 mb-4 block">Pricing</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free. Upgrade when you need deeper insights and stakeholder-ready exports.
            </p>
            <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>

          <div 
            ref={contentRef}
            className={`grid md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto scroll-reveal ${contentVisible ? 'revealed' : ''}`}
          >
            {/* Free Plan */}
            <div className="rounded-2xl p-7 md:p-9 bg-card/50 border border-border/60 card-hover-subtle">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Free</h3>
                <div className="text-5xl font-bold text-foreground">$0</div>
                <p className="text-sm text-muted-foreground mt-3">No credit card required</p>
              </div>
              
              <div className="divider-gradient mb-8" />
              
              <ul className="space-y-4 mb-10">
                {["2 analyses per day", "Three AI perspectives per analysis", "Consensus and dissent insights", "Core documentation features", "3 priority action items"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 text-muted-foreground/60 mt-0.5">✓</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                variant="outline"
                className="w-full rounded-xl py-6 font-semibold hover:bg-muted transition-all duration-500"
                onClick={() => handlePlanClick('free')}
              >
                {isLoggedIn ? 'Create Decision Record' : 'Start Free'}
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="relative premium-card premium-glow rounded-2xl p-7 md:p-9 border-2 border-primary/25">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-md">
                  Best Value
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Premium</h3>
                <div className="text-5xl font-bold text-primary">$26.99</div>
                <p className="text-sm text-muted-foreground mt-3">per month</p>
              </div>
              
              <div className="divider-gradient mb-8" />
              
              <ul className="space-y-4 mb-10">
                {[
                  { text: "10 analyses per day", highlight: true },
                  { text: "Full perspective documentation", highlight: true },
                  { text: "Business Context + Website Scanning", highlight: true },
                  { text: "Team Workspaces (up to 5 teams)", highlight: true },
                  { text: "Invite up to 5 members per team", highlight: false },
                  { text: "Investor-ready PDF exports", highlight: false }
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 text-primary mt-0.5">✓</span>
                    <span className={feature.highlight ? "text-foreground font-medium" : "text-muted-foreground"}>{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                className="w-full rounded-xl py-6 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500"
                onClick={() => handlePlanClick('premium')}
              >
                {isLoggedIn ? 'Upgrade to Premium' : 'Get Premium Now'}
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-muted-foreground/70">
            <span>Cancel anytime</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>Instant access</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>Secure payment</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;