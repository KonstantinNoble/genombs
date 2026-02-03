import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useEffect, useState, useRef } from "react";

interface Step {
  number: string;
  title: string;
  description: string;
}

const ProcessTimeline = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;
      
      // Calculate progress based on how much of the element is visible
      const visibleStart = Math.max(0, windowHeight - rect.top);
      const visibleEnd = Math.min(elementHeight + windowHeight, windowHeight - rect.top + elementHeight);
      const visibleProgress = Math.min(100, Math.max(0, (visibleStart / (elementHeight + windowHeight * 0.5)) * 100));
      
      setProgress(visibleProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps: Step[] = [
    {
      number: "01",
      title: "Set Your Context",
      description: "Industry, stage, goals. Every analysis is tailored to your specific situation."
    },
    {
      number: "02",
      title: "Ask Your Question",
      description: "Hiring, pivoting, expanding – type the decision your team is wrestling with."
    },
    {
      number: "03",
      title: "Weight Your Perspectives",
      description: "Pick 3 AI models. Adjust their influence. Some voices matter more."
    },
    {
      number: "04",
      title: "See the Full Picture",
      description: "Consensus shows confidence. Dissent reveals blind spots. Decide with clarity."
    }
  ];

  return (
    <section className="py-20 sm:py-24 md:py-32 relative overflow-hidden" ref={timelineRef}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <span className="text-subtitle tracking-widest text-primary/80 mb-4 block">How It Works</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            From Question to Clarity
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four steps. Sixty seconds. Structured perspectives your team can act on.
          </p>
          <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto">
          {/* Horizontal line with animated progress - visible on md+ */}
          <div className="hidden md:block relative h-1 w-full mb-12 rounded-full bg-muted overflow-hidden">
            {/* Progress fill */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/50 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
            
            {/* Glowing tip */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg transition-all duration-300 ease-out"
              style={{ 
                left: `${Math.min(progress, 97)}%`,
                boxShadow: '0 0 20px hsl(var(--primary) / 0.6), 0 0 40px hsl(var(--primary) / 0.3)'
              }}
            />
            
            {/* Step dots */}
            {steps.map((_, index) => {
              const dotPosition = (index / (steps.length - 1)) * 100;
              const isActive = progress >= dotPosition;
              
              return (
                <div 
                  key={index}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                    isActive 
                      ? 'bg-primary border-primary scale-110' 
                      : 'bg-background border-muted-foreground/30'
                  }`}
                  style={{ 
                    left: `${dotPosition}%`,
                    boxShadow: isActive ? '0 0 12px hsl(var(--primary) / 0.5)' : 'none'
                  }}
                />
              );
            })}
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <StepCard 
                key={step.number} 
                step={step} 
                index={index} 
                isActive={progress >= (index / (steps.length - 1)) * 100}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ step, index, isActive }: { step: Step; index: number; isActive: boolean }) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`text-center md:text-left scroll-reveal ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <span 
        className={`inline-block text-4xl md:text-5xl font-bold mb-3 transition-colors duration-500 ${
          isActive ? 'text-primary' : 'text-primary/20'
        }`}
      >
        {step.number}
      </span>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {step.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </p>
    </div>
  );
};

export default ProcessTimeline;
