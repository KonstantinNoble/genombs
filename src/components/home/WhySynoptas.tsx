import { X, Check, MessageSquare, Zap, Search, ListChecks, Target, TrendingUp } from "lucide-react";

const WhySynoptas = () => {
  const chatGptPoints = [
    { text: "Generic advice without market context", icon: MessageSquare },
    { text: "Outdated information (training cutoff)", icon: X },
    { text: "No structure – just walls of text", icon: X },
    { text: "You figure out what to do next", icon: X },
    { text: "No tracking or follow-up", icon: X },
  ];

  const synoptasPoints = [
    { text: "Real-time research from 10-20+ live sources", icon: Search },
    { text: "Current data from today's web", icon: Zap },
    { text: "Structured, phased action plans", icon: ListChecks },
    { text: "Daily focus tasks with AI Autopilot", icon: Target },
    { text: "Progress tracking & strategy comparison", icon: TrendingUp },
  ];

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Not Just Ask ChatGPT?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Great question. Here's the difference.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* ChatGPT Card */}
          <div className="bg-card/50 border border-border rounded-xl p-6 md:p-8 relative overflow-hidden">
            {/* Red tint overlay */}
            <div className="absolute inset-0 bg-destructive/5 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Asking ChatGPT</h3>
              </div>
              
              <ul className="space-y-4">
                {chatGptPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <span className="text-muted-foreground">{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Synoptas Card */}
          <div className="bg-card/50 border border-primary/30 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]">
            {/* Green tint overlay */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            
            {/* Live badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live Research
              </span>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Using Synoptas</h3>
              </div>
              
              <ul className="space-y-4">
                {synoptasPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA hint */}
        <p className="text-center text-muted-foreground mt-10 text-sm">
          Stop getting generic advice. Get actionable strategies based on real market data.
        </p>
      </div>
    </section>
  );
};

export default WhySynoptas;
