import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const StepCard = ({ number, title, description, details, index, link, linkText }: { number: string; title: string; description: string; details: string; index: number; link: string; linkText: string }) => {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <div 
      ref={ref}
      className={`relative p-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm scroll-reveal-left ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.15}s` }}
    >
      <span className="absolute -top-5 left-8 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
        {number}
      </span>
      <h3 className="text-xl font-semibold mt-2 mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed mb-3">{description}</p>
      <p className="text-muted-foreground/80 text-sm leading-relaxed mb-4">{details}</p>
      <Link 
        to={link} 
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-all duration-300 hover:gap-2"
      >
        {linkText}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

const HowItWorks = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  const steps = [
    {
      number: "1",
      title: "Ask your question",
      description: "Pricing decision? New hire? Market expansion? Just type it like you'd ask a colleague.",
      details: "The more specific, the better. 'Should I raise prices 20%?' beats 'How do I grow?' But even broad questions get useful responses.",
      link: "/validate",
      linkText: "Try it now"
    },
    {
      number: "2",
      title: "Three models work on it",
      description: "GPT-5, Gemini Pro, and Flash each analyze your question. Independently. You watch in real-time.",
      details: "They don't see each other's answers. That's the whole point – three separate perspectives, not one model talking to itself.",
      link: "/validate",
      linkText: "See it in action"
    },
    {
      number: "3",
      title: "See where they land",
      description: "Full agreement? Strong signal. Two out of three? Worth considering. Disagreement? That's where things get interesting.",
      details: "With Premium, you also get competitor insights and a 6-12 month outlook. The kind of context that changes how you see the decision.",
      link: "/pricing",
      linkText: "Compare plans"
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden" id="how-it-works">
      {/* Top fade transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-muted/50 to-transparent pointer-events-none" />
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={headerRef}
          className={`text-center mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Question in, three perspectives out. About 20 seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;