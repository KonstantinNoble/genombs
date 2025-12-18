const WhySynoptas = () => {
  const chatGptPoints = [
    "Generic advice without market context",
    "Outdated information (training cutoff)",
    "No structure – just walls of text",
    "You figure out what to do next",
    "No tracking or follow-up",
  ];

  const synoptasPoints = [
    "Real-time research from 10-20+ live sources",
    "Current data from today's web",
    "Structured, phased action plans",
    "Daily focus tasks with AI Autopilot",
    "Progress tracking & strategy comparison",
  ];

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Not Just Ask ChatGPT?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Great question. Here's the difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* ChatGPT Card */}
          <div className="bg-card/50 border border-border rounded-xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-destructive/5 pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-foreground mb-6">Asking ChatGPT</h3>
              
              <ul className="space-y-3">
                {chatGptPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-destructive font-bold mt-0.5">•</span>
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Synoptas Card */}
          <div className="bg-card/50 border border-primary/30 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live Research
              </span>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-foreground mb-6">Using Synoptas</h3>
              
              <ul className="space-y-3">
                {synoptasPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-10 text-sm">
          Stop getting generic advice. Get actionable strategies based on real market data.
        </p>
      </div>
    </section>
  );
};

export default WhySynoptas;
