import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";

const PainPointItem = ({ point, index }: { point: { title: string; detail: string }; index: number }) => {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <div
      ref={ref}
      className={`glass-card flex items-start gap-4 rounded-xl p-5 text-left scroll-reveal ${isVisible ? 'revealed' : ''}`}
      style={{ 
        transitionDelay: `${index * 0.1}s`,
        background: 'hsl(var(--destructive) / 0.05)',
        borderColor: 'hsl(var(--destructive) / 0.15)'
      }}
    >
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-destructive" />
      </span>
      <div>
        <span className="text-foreground block font-semibold mb-1">{point.title}</span>
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
    <section className="py-20 sm:py-24 md:py-32 px-4 bg-muted/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-destructive/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-destructive/3 rounded-full blur-3xl" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 
          ref={headerRef}
          className={`text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          The Problem with Undocumented Decisions
        </h2>
        
        <p 
          className={`text-lg text-muted-foreground mb-12 max-w-2xl mx-auto scroll-reveal ${headerVisible ? 'revealed' : ''}`}
          style={{ transitionDelay: '0.1s' }}
        >
          Sound familiar? You're not alone.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {painPoints.map((point, index) => (
            <PainPointItem key={index} point={point} index={index} />
          ))}
        </div>

        <div 
          ref={badgeRef}
          className={`flex flex-col items-center gap-5 scroll-reveal ${badgeVisible ? 'revealed' : ''}`}
          style={{ transitionDelay: "0.5s" }}
        >
          <p className="text-lg font-semibold text-foreground">That's why we built Synoptas.</p>
          <Link 
            to="/validate" 
            className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline transition-all duration-300 hover:gap-3"
          >
            Create your first decision record →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;