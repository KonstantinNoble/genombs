import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useEffect, useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  visual: React.ReactNode;
  delay: number;
  isPremium?: boolean;
}

const FeatureCard = ({ title, description, visual, delay, isPremium }: FeatureCardProps) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`feature-card relative p-6 rounded-xl bg-card border border-border/60 min-h-[280px] flex flex-col transition-all duration-700 hover:border-primary/20 hover:shadow-lg ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {isPremium && (
        <span className="absolute top-4 right-4 text-[10px] font-semibold tracking-wider uppercase text-primary bg-primary/10 px-2 py-1 rounded">
          Premium
        </span>
      )}
      
      <div className="flex-1 flex items-center justify-center mb-4">
        {visual}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

// Model Weighting Visualization
const WeightingVisualization = () => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const weights = [
    { label: "GPT", value: 45, color: "hsl(220, 70%, 50%)" },
    { label: "Claude", value: 35, color: "hsl(25, 85%, 55%)" },
    { label: "Gemini", value: 20, color: "hsl(142, 70%, 45%)" },
  ];

  return (
    <div className="w-full space-y-3">
      {weights.map((weight, index) => (
        <div key={weight.label} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{weight.label}</span>
            <span className="font-medium" style={{ color: weight.color }}>{weight.value}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: animate ? `${weight.value}%` : '0%',
                backgroundColor: weight.color,
                transitionDelay: `${index * 0.15}s`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Business Context Visualization
const BusinessContextVisualization = () => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const contextItems = [
    { label: "Industry", value: "SaaS" },
    { label: "Stage", value: "Series A" },
    { label: "Team Size", value: "8-15" },
    { label: "Revenue", value: "$500K ARR" },
  ];

  return (
    <div className="w-full space-y-2">
      {contextItems.map((item, index) => (
        <div 
          key={item.label}
          className={`flex justify-between items-center p-2 rounded-lg transition-all duration-300 ${
            index === step ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
          }`}
        >
          <span className="text-xs text-muted-foreground">{item.label}</span>
          <span className={`text-xs font-medium transition-colors duration-300 ${
            index === step ? 'text-primary' : 'text-foreground'
          }`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

// Team Workspaces Visualization
const TeamVisualization = () => {
  const [visibleCount, setVisibleCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => (prev >= 5 ? 0 : prev + 1));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const avatars = ["MR", "SK", "AL", "JD", "TP"];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex -space-x-2">
        {avatars.map((initials, index) => (
          <div
            key={initials}
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background flex items-center justify-center transition-all duration-300 ${
              index < visibleCount ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <span className="text-xs font-semibold text-primary">{initials}</span>
          </div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">5 members</span>
    </div>
  );
};

// Consensus View Visualization
const ConsensusVisualization = () => {
  const [activeRow, setActiveRow] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRow((prev) => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const rows = [
    { checks: 3, label: "All agree", color: "hsl(142, 70%, 45%)" },
    { checks: 2, label: "2/3 agree", color: "hsl(38, 92%, 50%)" },
    { checks: 1, label: "Dissent", color: "hsl(0, 72%, 51%)" },
  ];

  return (
    <div className="w-full space-y-2">
      {rows.map((row, index) => (
        <div 
          key={row.label}
          className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
            index === activeRow ? 'bg-muted border border-border' : ''
          }`}
        >
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`text-sm transition-all duration-300 ${
                  i <= row.checks && index === activeRow ? 'scale-110' : ''
                }`}
                style={{ color: i <= row.checks ? row.color : 'hsl(var(--muted-foreground) / 0.3)' }}
              >
                {i <= row.checks ? '✓' : '○'}
              </span>
            ))}
          </div>
          <span className={`text-xs transition-colors duration-300 ${
            index === activeRow ? 'text-foreground font-medium' : 'text-muted-foreground'
          }`}>{row.label}</span>
        </div>
      ))}
    </div>
  );
};

// Decision History Visualization
const HistoryVisualization = () => {
  const [activeDot, setActiveDot] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="relative w-full h-8 flex items-center justify-between px-2">
        {/* Timeline line */}
        <div className="absolute left-2 right-2 h-px bg-border top-1/2" />
        
        {/* Timeline dots */}
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`relative z-10 w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeDot 
                ? 'bg-primary scale-125 shadow-lg' 
                : index < activeDot 
                  ? 'bg-primary/40' 
                  : 'bg-muted border border-border'
            }`}
            style={{
              boxShadow: index === activeDot ? '0 0 12px hsl(var(--primary) / 0.5)' : 'none'
            }}
          />
        ))}
      </div>
      <div className="flex justify-between w-full text-[10px] text-muted-foreground px-1">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
      </div>
    </div>
  );
};

// PDF Export Visualization
const PDFVisualization = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="doc-float w-16 h-20 bg-card border border-border rounded-lg shadow-md flex flex-col items-center justify-center gap-1">
        <div className="w-10 h-1 bg-foreground/20 rounded" />
        <div className="w-8 h-1 bg-foreground/15 rounded" />
        <div className="w-10 h-1 bg-foreground/10 rounded" />
        <div className="w-6 h-1 bg-primary/30 rounded mt-1" />
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">PDF Report</span>
    </div>
  );
};

const FeatureShowcase = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  const features = [
    {
      title: "Weight Your Perspectives",
      description: "Some voices matter more. Adjust each AI's influence from 10-80% based on your priorities.",
      visual: <WeightingVisualization />,
      isPremium: false,
    },
    {
      title: "Tailored to Your Business",
      description: "Industry, stage, revenue, region. Every analysis knows your context for relevant insights.",
      visual: <BusinessContextVisualization />,
      isPremium: false,
    },
    {
      title: "Collaborate With Your Team",
      description: "5 teams, 5 members each. Build a shared decision history and align on strategy.",
      visual: <TeamVisualization />,
      isPremium: true,
    },
    {
      title: "See Where They Agree",
      description: "Agreement = move fast. Dissent = investigate before committing. Know what needs attention.",
      visual: <ConsensusVisualization />,
      isPremium: false,
    },
    {
      title: "Track Your Decisions",
      description: "Every analysis saved. Notice patterns. Learn from the past to decide better in the future.",
      visual: <HistoryVisualization />,
      isPremium: false,
    },
    {
      title: "Investor-Ready Reports",
      description: "Export PDFs that show what you considered, how you weighed options, and why you decided.",
      visual: <PDFVisualization />,
      isPremium: true,
    },
  ];

  return (
    <section className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <span className="text-subtitle tracking-widest text-primary/80 mb-4 block">Features</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to Decide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From weighting AI perspectives to sharing with your team – every tool designed for strategic clarity.
          </p>
          <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              visual={feature.visual}
              delay={index * 0.1}
              isPremium={feature.isPremium}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
