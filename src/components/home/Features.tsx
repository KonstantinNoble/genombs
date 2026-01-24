import { useScrollReveal } from "@/hooks/useScrollReveal";

interface FeatureCardProps {
  title: string;
  description: string;
  index: number;
  icon?: React.ReactNode;
  accentColor?: string;
}

const FeatureCard = ({ title, description, index, icon, accentColor }: FeatureCardProps) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`glass-card group relative rounded-2xl p-6 md:p-8 scroll-reveal tilt-card ${isVisible ? 'revealed' : ''} ${accentColor ? `border-l-4 ${accentColor}` : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent-cool/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
        {index + 1}
      </div>
      <div className="relative z-10">
        {icon && (
          <div className="mb-4">
            {icon}
          </div>
        )}
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
    { 
      title: "Multi-Perspective Documentation", 
      description: "Three AI models analyze your decision independently. Every perspective is documented with timestamps and traceable reasoning." 
    },
    { 
      title: "Consensus & Dissent Analysis", 
      description: "Instantly see where all models agree (strong signals) and where they disagree (areas requiring deeper consideration)."
    },
    { 
      title: "Personal Analytics Dashboard", 
      description: "Track your validation history with confidence trends, AI consensus rates, and model usage statistics. Your decision patterns, visualized." 
    },
    { 
      title: "Stakeholder-Ready Audit Reports", 
      description: "Export comprehensive PDF documentation including alternatives considered, risks identified, and your confirmation of decision ownership." 
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-cool/5 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className={`text-center max-w-3xl mx-auto mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">What You Get</h2>
          <p className="text-lg text-muted-foreground">Professional decision documentation for high-stakes choices</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              title={feature.title} 
              description={feature.description} 
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
