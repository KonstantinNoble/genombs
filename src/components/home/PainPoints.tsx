import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PainPointItem = ({ point, index }: { point: { title: string; detail: string }; index: number }) => {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <div
      ref={ref}
      className={`group flex items-start gap-4 rounded-2xl p-6 text-left border border-destructive/10 bg-destructive/[0.02] hover:bg-destructive/[0.04] transition-all duration-400 scroll-reveal ${isVisible ? 'revealed' : ''}`}
      style={{ 
        transitionDelay: `${index * 0.08}s`
      }}
    >
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
      </span>
      <div>
        <span className="text-foreground block font-semibold mb-2 leading-snug">{point.title}</span>
        <span className="text-muted-foreground text-sm leading-relaxed">{point.detail}</span>
      </div>
    </div>
  );
};

const PainPoints = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: badgeRef, isVisible: badgeVisible } = useScrollReveal();

  const painPoints = [
    { title: "One AI model = one perspective", detail: "ChatGPT has blind spots. So does Claude. So does Gemini. You just don't know which ones until it's too late." },
    { title: "You can't tell if the answer is reliable", detail: "Was that a confident recommendation or a guess? Without a second opinion, you're flying blind." },
    { title: "Comparing AI outputs manually is tedious", detail: "Copy-paste between three chat windows. Read walls of text. Try to remember what each one said. There's a better way." },
    { title: "Your priorities aren't factored in", detail: "Generic AI doesn't know if you care more about risk, growth, or speed. It just gives you a one-size-fits-all answer." },
  ];

  return (
    <section className="py-24 sm:py-28 md:py-36 px-4 relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-muted/30 to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div 
          ref={headerRef}
          className={`mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <span className="text-subtitle tracking-widest text-destructive/70 mb-4 block">The Problem</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            The Problem with Single-AI Answers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sound familiar? You're not alone.
          </p>
          <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-destructive/30 to-transparent" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 lg:gap-5 mb-16">
          {painPoints.map((point, index) => (
            <PainPointItem key={index} point={point} index={index} />
          ))}
        </div>

        <div 
          ref={badgeRef}
          className={`flex flex-col items-center gap-6 scroll-reveal ${badgeVisible ? 'revealed' : ''}`}
          style={{ transitionDelay: "0.4s" }}
        >
          <p className="text-xl font-semibold text-foreground">That's why we built Synoptas.</p>
          <Link 
            to="/validate" 
            className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:gap-3 transition-all duration-300"
          >
            Get your first multi-AI analysis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;