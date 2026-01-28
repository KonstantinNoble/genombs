import { useScrollReveal } from "@/hooks/useScrollReveal";

const WhySynoptas = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal();
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal();

  return (
    <section className="py-24 sm:py-28 md:py-36 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className={`text-center max-w-3xl mx-auto mb-20 scroll-reveal ${headerVisible ? 'revealed' : ''}`}>
          <span className="text-subtitle tracking-widest text-primary/80 mb-4 block">Comparison</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">The Difference Multiple Perspectives Make</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Single-AI guesswork vs. weighted multi-AI analysis</p>
          <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          <div ref={leftRef} className={`relative rounded-2xl p-7 md:p-9 border border-destructive/15 bg-destructive/[0.03] scroll-reveal-scale ${leftVisible ? 'revealed' : ''}`}>
            <div className="absolute -top-3 left-6">
              <span className="inline-block px-4 py-1.5 bg-background border border-destructive/20 rounded-full text-sm font-medium text-destructive/80">
                Without Synoptas
              </span>
            </div>
            <div className="mt-6 space-y-5">
              {["One AI model, one perspective, unknown blind spots", "No way to know if the answer is confident or a guess", "Manual copy-paste between ChatGPT, Claude, Gemini", "Generic advice that ignores your specific priorities"].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div ref={rightRef} className={`premium-card premium-glow relative rounded-2xl p-7 md:p-9 border-2 border-primary/20 scroll-reveal-scale ${rightVisible ? 'revealed' : ''}`} style={{ transitionDelay: '0.15s' }}>
            <div className="absolute -top-3 left-6">
              <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold shadow-sm">
                With Synoptas
              </span>
            </div>
            <div className="mt-6 space-y-5">
              {["6 AI models available (GPT, Gemini, Claude, Perplexity)", "Team workspaces: invite up to 5 members, share decisions, one subscription", "Custom weighting: you control which perspective matters most", "Consensus and dissent clearly identified with confidence scores", "Personal dashboard tracks your decision patterns over time", "Stakeholder-ready PDF exports on demand"].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-foreground leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySynoptas;