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
    { title: "You're making six-figure decisions alone", detail: "Hiring, pivoting, expanding – these decisions shape your company. But without a co-founder or board, you're the only one pressure-testing your logic." },
    { title: "Mentors give opinions, not structured analysis", detail: "Even great advisors have blind spots. And they're not always available when you need to decide this week." },
    { title: "Gut feeling doesn't scale", detail: "Your instincts got you here. But as stakes get higher, 'I felt it was right' won't satisfy investors, partners, or yourself." },
    { title: "You've googled yourself in circles", detail: "Articles, podcasts, Twitter threads – information overload, but no structured way to weigh the options against your specific situation." },
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
          <span className="text-subtitle tracking-widest text-destructive/70 mb-4 block">The Challenge</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Sound Familiar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every founder knows this feeling. You're not alone.
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
            Get your first second opinion
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;