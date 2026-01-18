import { Card } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Three Models, Not One",
    description:
      "You type in a question. GPT-5, Gemini Pro, and Gemini Flash each give you their take. Independently. No copy-pasting between tools.",
    details: "Each model thinks differently. GPT tends to be thorough, Gemini Pro gets creative, Flash is more practical. You see all three perspectives side by side before we synthesize them.",
    color: "primary",
    link: "/validate",
    linkText: "Try it out",
  },
  {
    title: "See Where They Agree (and Don't)",
    description:
      "When all three models say the same thing? That's probably solid advice. When they disagree? That's where you should dig deeper.",
    details: "We don't just show you three answers. We analyze them and tell you: here's what they all agree on, here's where two out of three agree, and here's where they see things differently.",
    color: "accent-cool",
    link: "/validate",
    linkText: "See how it works",
  },
  {
    title: "Adjust to Your Style",
    description:
      "Playing it safe or willing to take risks? Want creative ideas or practical ones? Move the sliders and the recommendations adjust.",
    details: "Your business, your call. The sliders change how we weight the responses. Conservative mode prioritizes the safer bets. Aggressive mode surfaces the bolder moves.",
    color: "accent-info",
    link: "/pricing",
    linkText: "See all features",
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
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/60 to-transparent pointer-events-none" />
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-muted/40 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-16 space-y-4 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            What makes this different
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One AI gives you one opinion. We give you three, then tell you what they mean.
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