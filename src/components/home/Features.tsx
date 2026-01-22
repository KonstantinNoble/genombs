import { useScrollReveal } from "@/hooks/useScrollReveal";

interface FeatureCardProps {
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ title, description, index }: FeatureCardProps) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`glass-card group relative rounded-2xl p-6 md:p-8 scroll-reveal tilt-card ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent-cool/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
        {index + 1}
      </div>
      <div className="relative z-10">
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  const features = [
    { title: "Three AIs, One Question", description: "Same question goes to GPT, Gemini Pro, and Gemini Flash. Each thinks differently – you see where they converge and where they diverge." },
    { title: "Consensus & Dissent", description: "Quickly scan what all models agree on (consensus) vs. unique perspectives only one model raised (dissent)." },
    { title: "Weighted Confidence", description: "Combine all responses into a single confidence score. Adjust how much each model's opinion matters." },
    { title: "Premium Deep Insights", description: "Competitor context, long-term outlook, and strategic alternatives. Plus PDF export and experiment tracking." }
  ];

  return (
    <section id="features" className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-cool/5 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className={`text-center max-w-3xl mx-auto mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">How Synoptas Works</h2>
          <p className="text-lg text-muted-foreground">Get multiple perspectives on every business decision</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (<FeatureCard key={index} title={feature.title} description={feature.description} index={index} />))}
        </div>
      </div>
    </section>
  );
};

export default Features;