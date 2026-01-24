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
    { title: "AI-assisted decisions without documentation are indefensible", detail: "You used AI to help decide. But can you prove you considered the risks? No audit trail means no defense." },
    { title: "When stakeholders ask 'why', you have nothing to show", detail: "The chat history is gone. The reasoning is scattered. You're left reconstructing decisions after the fact." },
    { title: "Compliance and due diligence require traceable reasoning", detail: "Regulators and investors want to see your process – not just your conclusion." },
    { title: "High-stakes decisions deserve more than a gut feeling", detail: "The bigger the decision, the more important the documentation. Protect yourself before you commit." },
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
            The Problem with Undocumented Decisions
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
            Create your first decision record
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;