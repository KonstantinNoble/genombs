import { useScrollReveal } from "@/hooks/useScrollReveal";

const WhySynoptas = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal();
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal();

  return (
    <section className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/3 -left-20 w-60 h-60 bg-destructive/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className={`text-center max-w-3xl mx-auto mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Why Document Your Decision Process?</h2>
          <p className="text-lg text-muted-foreground">See the difference between undocumented and documented decisions</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div ref={leftRef} className={`relative rounded-2xl p-6 md:p-8 border-2 border-destructive/20 bg-destructive/5 scroll-reveal-scale ${leftVisible ? 'revealed' : ''}`}>
            <div className="absolute -top-3 left-6"><span className="px-4 py-1.5 bg-destructive/10 border border-destructive/20 rounded-full text-sm font-semibold text-destructive">Without Synoptas</span></div>
            <div className="mt-4 space-y-4">
              {["No audit trail for AI-assisted decisions", "No proof of due diligence", "Undocumented decision rationale", "No record of considered alternatives"].map((item, i) => (
                <div key={i} className="flex items-center gap-3"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-destructive" /></span><span className="text-muted-foreground">{item}</span></div>
              ))}
            </div>
          </div>
          <div ref={rightRef} className={`premium-card relative rounded-2xl p-6 md:p-8 border-2 border-primary/30 scroll-reveal-scale ${rightVisible ? 'revealed' : ''}`} style={{ transitionDelay: '0.15s' }}>
            <div className="absolute -top-3 left-6"><span className="px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-sm font-semibold text-primary">With Synoptas</span></div>
            <div className="mt-4 space-y-4">
              {["Full audit trail with timestamps", "Documented perspectives and dissent", "Exportable decision records", "Compliance-ready documentation"].map((item, i) => (
                <div key={i} className="flex items-center gap-3"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-primary" /></span><span className="text-foreground font-medium">{item}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySynoptas;