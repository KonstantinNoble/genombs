import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Step {
  number: string;
  title: string;
  description: string;
}

const ProcessTimeline = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

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
    <section className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
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
          {/* Horizontal line - visible on md+ */}
          <div className="hidden md:block relative h-px w-full mb-12">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              style={{
                animation: "line-flow 4s ease-in-out infinite"
              }}
            />
            {/* Step dots */}
            {steps.map((_, index) => (
              <div 
                key={index}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/30 border-2 border-primary/50"
                style={{ left: `${(index * 33.33) + 0}%` }}
              />
            ))}
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ step, index }: { step: Step; index: number }) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`text-center md:text-left scroll-reveal ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <span className="inline-block text-4xl md:text-5xl font-bold text-primary/20 mb-3">
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
