import { X, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";

const PainPointItem = ({ point, index }: { point: { title: string; detail: string }; index: number }) => {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left scroll-reveal ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <span className="text-muted-foreground block font-medium">{point.title}</span>
        <span className="text-muted-foreground/70 text-sm">{point.detail}</span>
      </div>
    </div>
  );
};

const PainPoints = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: badgeRef, isVisible: badgeVisible } = useScrollReveal();

  const painPoints = [
    { title: "ChatGPT gave you one opinion – but is it right?", detail: "Single-AI advice sounds confident but you have no way to validate it" },
    { title: "You're not sure if the AI missed important risks", detail: "One model can't catch everything. Critical blind spots go unnoticed." },
    { title: "Different AIs give contradictory advice", detail: "You've tried multiple tools and gotten conflicting recommendations" },
    { title: "You need confidence before making big decisions", detail: "Important business moves deserve more than one perspective" },
  ];

  return (
    <section className="py-16 px-4 bg-muted/30 border-y border-border relative overflow-hidden">
      {/* Top fade transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-muted/40 to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 
          ref={headerRef}
          className={`text-2xl md:text-3xl font-bold text-foreground mb-8 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          Sound familiar?
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {painPoints.map((point, index) => (
            <PainPointItem key={index} point={point} index={index} />
          ))}
        </div>

        <div 
          ref={badgeRef}
          className={`flex flex-col items-center gap-4 scroll-reveal ${badgeVisible ? 'revealed' : ''}`}
          style={{ transitionDelay: "0.5s" }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/30 rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-foreground font-medium">Synoptas fixes this.</span>
          </div>
          <Link 
            to="/validate" 
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-all duration-300 hover:gap-2"
          >
            Get your first validation free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
