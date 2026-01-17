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
      title: "Ask Your Business Question",
      description: "Enter any strategic business question – from pricing strategies to market expansion decisions. Adjust your risk tolerance and analysis style preferences to tune how the AI models approach your problem.",
      details: "Be specific: 'Should I expand to enterprise clients or focus on SMB?' works better than 'How do I grow?' The more context you provide, the more accurate the multi-model analysis becomes.",
      link: "/validate",
      linkText: "Start Your Validation"
    },
    {
      number: "2",
      title: "3 AI Models Analyze in Parallel",
      description: "GPT-5 Mini, Gemini 3 Pro, and Gemini 3 Flash each analyze your question independently. Each model brings unique strengths – reasoning, creativity, and pragmatic execution.",
      details: "Unlike single-AI tools, Synoptas queries multiple models simultaneously and streams results as they complete. You see each perspective before the final synthesis.",
      link: "/validate",
      linkText: "Try It Free"
    },
    {
      number: "3",
      title: "Get Validated Recommendations",
      description: "Our meta-evaluation identifies where all 3 models agree (high confidence), where 2/3 agree (majority), and where they disagree (worth deeper consideration).",
      details: "The final recommendation synthesizes all perspectives with a confidence score. Dissent points highlight risks you might have missed with single-AI advice.",
      link: "/pricing",
      linkText: "See Premium Features"
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
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From question to validated recommendation in 20 seconds
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