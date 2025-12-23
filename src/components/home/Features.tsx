import { Card } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Globe, Scan, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    title: "Real-Time Market Research",
    description:
      "Every strategy is backed by live web research. Our AI analyzes 10-20+ current sources including market trends, competitor data, and industry insights.",
    icon: Globe,
    color: "primary",
  },
  {
    title: "Website Analysis",
    description:
      "Enter your website URL and get personalized strategies based on your actual website content, branding, and business model.",
    icon: Scan,
    color: "accent-warm",
  },
  {
    title: "AI Autopilot",
    description:
      "Get 3 AI-generated daily focus tasks tailored to your active strategy. Stay on track with personalized action items and streak tracking.",
    icon: Zap,
    color: "accent-cool",
  },
  {
    title: "Deep Analysis Mode",
    description:
      "Premium users get comprehensive phases with competitor analysis, ROI projections, and weekly action plans.",
    icon: BarChart3,
    color: "accent-info",
  },
];

const colorClasses = {
  primary: {
    icon: "text-primary",
    border: "group-hover:border-primary/50",
    bg: "group-hover:bg-primary/5",
  },
  "accent-warm": {
    icon: "text-accent-warm",
    border: "group-hover:border-accent-warm/50",
    bg: "group-hover:bg-accent-warm/5",
  },
  "accent-cool": {
    icon: "text-accent-cool",
    border: "group-hover:border-accent-cool/50",
    bg: "group-hover:bg-accent-cool/5",
  },
  "accent-info": {
    icon: "text-accent-info",
    border: "group-hover:border-accent-info/50",
    bg: "group-hover:bg-accent-info/5",
  },
};

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const { ref, isVisible } = useScrollReveal();
  const colors = colorClasses[feature.color as keyof typeof colorClasses];
  const Icon = feature.icon;
  
  return (
    <Card
      ref={ref}
      className={`p-6 transition-all duration-500 hover:shadow-lift hover:-translate-y-2 border-border/50 bg-card group relative overflow-hidden scroll-reveal rounded-2xl ${colors.border} ${colors.bg} ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-muted/50 ${colors.icon} transition-all duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground transition-all duration-500 flex items-center gap-2">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
      </div>
    </Card>
  );
};

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  return (
    <section
      className="py-20 sm:py-24 md:py-32 relative overflow-hidden"
      aria-label="Features section"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-muted/30" />
      {/* Top fade transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/60 to-transparent pointer-events-none" />
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-muted/40 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-16 space-y-4 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            AI-Powered Business Strategy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Turn your business goals into actionable, phased strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
