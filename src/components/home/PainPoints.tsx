import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PainPoints = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: contentRef, isVisible: contentVisible } = useScrollReveal();

  const problems = [
    { text: "Your team debates, but nobody has the full picture" },
    { text: "Advisors are expensive – $300+/hour for good ones" },
    { text: "Gut feeling doesn't survive team disagreements" },
    { text: "Information overload from contradicting advice" },
  ];

  const solutions = [
    { text: "Three structured perspectives in 60 seconds" },
    { text: "$0-27/month for unlimited guidance" },
    { text: "Common ground for team alignment" },
    { text: "Synthesized insights tailored to your situation" },
  ];

  return (
    <section className="py-24 sm:py-28 md:py-36 px-4 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-muted/30 to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <span className="text-subtitle tracking-widest text-primary/80 mb-4 block">The Challenge</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Sound Familiar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every founder knows this feeling. You're not alone.
          </p>
          <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        {/* Before/After Grid */}
        <div 
          ref={contentRef}
          className={`grid md:grid-cols-2 gap-6 lg:gap-8 mb-16 scroll-reveal ${contentVisible ? 'revealed' : ''}`}
        >
          {/* Problems Column */}
          <div className="comparison-card-problem rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <span className="text-destructive/70">Without Synoptas</span>
            </h3>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3 text-muted-foreground"
                  style={{ transitionDelay: `${index * 0.05}s` }}
                >
                  <span className="flex-shrink-0 text-destructive/60 font-medium mt-0.5">×</span>
                  <span className="text-sm leading-relaxed">{problem.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="comparison-card-solution rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <span className="text-primary">With Synoptas</span>
            </h3>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3 text-foreground"
                  style={{ transitionDelay: `${index * 0.05}s` }}
                >
                  <span className="flex-shrink-0 text-primary font-medium mt-0.5">✓</span>
                  <span className="text-sm leading-relaxed">{solution.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-xl font-semibold text-foreground mb-6">That's why we built Synoptas.</p>
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