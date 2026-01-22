import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  { number: "01", title: "Enter your business question", description: "Type any decision you're wrestling with – from product launches to hiring to pricing strategy." },
  { number: "02", title: "Get multi-AI analysis", description: "GPT, Gemini Pro, and Gemini Flash each analyze your question independently." },
  { number: "03", title: "Compare perspectives", description: "See where they agree (consensus), where most agree (majority), and unique insights (dissent)." },
  { number: "04", title: "Make your decision", description: "Armed with weighted confidence scores and multiple viewpoints, decide with clarity." },
];

const StepCard = ({ step, index }: { step: typeof steps[0]; index: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div ref={ref} className={`scroll-reveal-left flex items-start gap-6 ${isVisible ? 'revealed' : ''}`} style={{ transitionDelay: `${index * 0.15}s` }}>
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg glow-hover transition-all duration-300">{step.number}</div>
        {index < steps.length - 1 && <div className="absolute top-14 left-1/2 w-px h-16 md:h-20 bg-gradient-to-b from-primary/30 to-transparent -translate-x-1/2" />}
      </div>
      <div className="glass-card flex-1 rounded-xl p-5">
        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{step.title}</h3>
        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  return (
    <section id="how-it-works" className="py-20 sm:py-24 md:py-32 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-20 right-[10%] w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-[10%] w-60 h-60 bg-accent-cool/5 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className={`text-center max-w-3xl mx-auto mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}>
          <span className="feature-badge mb-6 inline-flex"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" />Simple Process</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Four Steps to Clarity</h2>
          <p className="text-lg text-muted-foreground">From question to confident decision in under a minute</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-8">{steps.map((step, index) => <StepCard key={index} step={step} index={index} />)}</div>
      </div>
    </section>
  );
};

export default HowItWorks;