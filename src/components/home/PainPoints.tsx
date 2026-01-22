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
    { title: "ChatGPT gave you an answer. But is it right?", detail: "Sounds confident. But how do you know nothing important is missing?" },
    { title: "Asked again. Got something different.", detail: "Same question, new answer. Now you're even less sure." },
    { title: "The advice feels... fine. Just fine.", detail: "Not wrong, exactly. But not really tailored to your situation either." },
    { title: "This decision actually matters.", detail: "Too important to just go with one AI's take and hope for the best." },
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
          Does this sound familiar?
        </h2>
        
        <p 
          className={`text-lg text-muted-foreground mb-12 max-w-2xl mx-auto scroll-reveal ${headerVisible ? 'revealed' : ''}`}
          style={{ transitionDelay: '0.1s' }}
        >
          The problem with asking AI for advice
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
          <div className="feature-badge text-base px-6 py-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold">That's why we built this.</span>
          </div>
          <Link 
            to="/validate" 
            className="link-underline inline-flex items-center gap-2 text-base font-semibold text-primary transition-all duration-300 hover:gap-3"
          >
            Try it yourself 
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;