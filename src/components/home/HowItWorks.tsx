import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  { number: "01", title: "Describe your challenge", description: "Should I hire this senior dev? Enter a new market? Raise now or bootstrap longer? Any strategic question you're wrestling with." },
  { number: "02", title: "Set your priorities", description: "Pick 3 AI perspectives and weight what matters: risk tolerance, growth speed, cash preservation. Your context, your weights." },
  { number: "03", title: "See where they agree – and where they don't", description: "Consensus = strong signal. Dissent = areas to dig deeper. In 60 seconds, not 60 meetings." },
  { number: "04", title: "Keep the receipt", description: "Save your decision record. Share with co-founders or advisors. Export for investor updates. Your future self will thank you." },
];

const StepCard = ({ step, index }: { step: typeof steps[0]; index: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div 
      ref={ref} 
      className={`group flex gap-5 sm:gap-6 items-start p-6 sm:p-7 rounded-2xl bg-card/60 border border-border/50 hover:border-primary/15 hover:bg-card transition-all duration-500 scroll-reveal-left ${isVisible ? 'revealed' : ''}`} 
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="flex-shrink-0 relative">
        <span className="step-number relative z-10 bg-background group-hover:bg-primary/10 transition-colors duration-300">
          {step.number}
        </span>
        {index < steps.length - 1 && (
          <div className="absolute top-10 left-1/2 w-px h-12 bg-gradient-to-b from-primary/20 to-transparent -translate-x-1/2 hidden sm:block" />
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{step.title}</h3>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  return (
    <section id="how-it-works" className="py-24 sm:py-28 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className={`text-center max-w-3xl mx-auto mb-20 scroll-reveal ${headerVisible ? 'revealed' : ''}`}>
          <span className="text-subtitle tracking-widest text-primary/80 mb-4 block">Process</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">From challenge to clarity in under 60 seconds</p>
          <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {steps.map((step, index) => <StepCard key={index} step={step} index={index} />)}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;