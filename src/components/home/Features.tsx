import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  index: number;
  hasDashboardLink?: boolean;
  showDashboardLink?: boolean;
}

const FeatureCard = ({ title, description, index, hasDashboardLink, showDashboardLink }: FeatureCardProps) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl p-6 md:p-8 bg-card/50 border border-border/60 card-hover-subtle scroll-reveal ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-start gap-4 mb-4">
          <span className="step-number flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="text-xl font-bold text-foreground pt-1.5">{title}</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed ml-14">{description}</p>
        
        {hasDashboardLink && showDashboardLink && (
          <div className="mt-5 ml-14">
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80 hover:bg-primary/5 -ml-2">
              <Link to="/dashboard" className="flex items-center gap-1.5">
                View Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { user } = useAuth();

  const features = [
    { 
      title: "6 AI Models, Your Choice", 
      description: "Choose from GPT-5 Mini, Gemini 3 Pro, Gemini Flash, Claude Sonnet 4, Perplexity Sonar, and Sonar Reasoning Pro. Pick 3 for every analysis." 
    },
    { 
      title: "Custom Model Weighting", 
      description: "Assign 10-80% influence to each model. Prioritize technical depth, market insight, or risk assessment based on your decision context."
    },
    { 
      title: "Consensus & Dissent Analysis", 
      description: "Instantly see where models agree (strong signals) and where they disagree (areas requiring deeper consideration)."
    },
    { 
      title: "Team Workspaces", 
      description: "Create shared workspaces for your team. Collaborate on decision records, share analyses, and maintain a unified audit trail across your organization."
    },
    { 
      title: "Personal Analytics Dashboard", 
      description: "Track your validation history with confidence trends, AI consensus rates, and model usage statistics. Your decision patterns, visualized.",
      hasDashboardLink: true
    },
    { 
      title: "Stakeholder-Ready Audit Reports", 
      description: "Export comprehensive PDF documentation including alternatives considered, risks identified, and your confirmation of decision ownership." 
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-28 md:py-36 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className={`text-center max-w-3xl mx-auto mb-20 scroll-reveal ${headerVisible ? 'revealed' : ''}`}>
          <span className="text-subtitle tracking-widest text-primary/80 mb-4 block">Features</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">What You Get</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Professional decision documentation for high-stakes choices</p>
          <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              title={feature.title} 
              description={feature.description} 
              index={index}
              hasDashboardLink={feature.hasDashboardLink}
              showDashboardLink={!!user}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;