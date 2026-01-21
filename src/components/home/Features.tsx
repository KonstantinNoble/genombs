import { Card } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "One Click, Three Opinions",
    description:
      "Type your question once. GPT-5, Gemini Pro, and Flash each respond separately. No switching between tabs or tools.",
    details: "Different models think differently. GPT goes deep, Gemini Pro gets creative, Flash stays practical. You see all three side by side.",
    color: "primary",
    link: "/validate",
    linkText: "Try it out",
  },
  {
    title: "Consensus Shows Confidence",
    description:
      "When three independent AIs reach the same conclusion, that's a strong signal. When they don't, you know where to look closer.",
    details: "We break it down: full agreement, partial agreement, and disagreement. So you know which parts of the advice to trust most.",
    color: "accent-cool",
    link: "/validate",
    linkText: "See how it works",
  },
  {
    title: "Premium: The Full Picture",
    description:
      "Go beyond basic consensus. Get competitor insights, a 6-12 month outlook, and alternative strategies if Plan A doesn't work out.",
    details: "Free shows you what the models agree on. Premium shows you context you'd miss otherwise – the kind that can change your decision.",
    color: "accent-info",
    link: "/pricing",
    linkText: "Compare plans",
  },
];

const colorClasses = {
  primary: {
    text: "text-primary",
    border: "group-hover:border-primary/50",
    bg: "group-hover:bg-primary/5",
  },
  "accent-warm": {
    text: "text-accent-warm",
    border: "group-hover:border-accent-warm/50",
    bg: "group-hover:bg-accent-warm/5",
  },
  "accent-cool": {
    text: "text-accent-cool",
    border: "group-hover:border-accent-cool/50",
    bg: "group-hover:bg-accent-cool/5",
  },
  "accent-info": {
    text: "text-accent-info",
    border: "group-hover:border-accent-info/50",
    bg: "group-hover:bg-accent-info/5",
  },
};

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const { ref, isVisible } = useScrollReveal();
  const colors = colorClasses[feature.color as keyof typeof colorClasses];
  
  return (
    <Card
      ref={ref}
      className={`p-6 transition-all duration-500 hover:shadow-lift hover:-translate-y-2 border-border/50 bg-card group relative overflow-hidden scroll-reveal rounded-2xl ${colors.border} ${colors.bg} ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="relative z-10">
        <h3 className="text-xl font-semibold mb-3 text-foreground transition-all duration-500 flex items-center gap-2">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-2">{feature.description}</p>
        <p className="text-muted-foreground/80 text-sm leading-relaxed mb-4">{feature.details}</p>
        <Link 
          to={feature.link} 
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${colors.text} hover:underline transition-all duration-300 group-hover:gap-2`}
        >
          {feature.linkText}
          <ArrowRight className="w-4 h-4" />
        </Link>
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
      <div className="absolute top-0 left-0 right-0 h-24 bg-background/40 pointer-events-none" />
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-muted/30 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-16 space-y-4 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Why this works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One AI gives you one opinion. Three give you perspective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;