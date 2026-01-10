import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const WhySynoptas = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: chatGptRef, isVisible: chatGptVisible } = useScrollReveal();
  const { ref: synoptasRef, isVisible: synoptasVisible } = useScrollReveal();
  const { ref: footerRef, isVisible: footerVisible } = useScrollReveal();

  const chatGptPoints = [
    { title: "Generic advice without market context", detail: "No real data about your specific industry or competitors" },
    { title: "Outdated information (training cutoff)", detail: "Can't access current market trends or recent developments" },
    { title: "No structure – just walls of text", detail: "You get paragraphs, not actionable step-by-step plans" },
    { title: "You figure out what to do next", detail: "No prioritization, no timeline, no accountability" },
    { title: "No tracking or follow-up", detail: "Every conversation starts from zero – no memory of your progress" },
  ];

  const synoptasPoints = [
    { title: "Live data from Bloomberg, Statista & industry reports", detail: "Real-time market intelligence from 20+ premium sources" },
    { title: "Market size, CAGR & competitor analysis in seconds", detail: "The same research Fortune 500 companies pay thousands for" },
    { title: "Structured visualizations with citations", detail: "Every data point is verifiable with source links included" },
    { title: "AI-generated daily focus tasks based on your strategy", detail: "Wake up knowing exactly what to work on today" },
    { title: "Track progress & compare multiple strategies", detail: "Visual dashboards, streak tracking, and milestone celebrations" },
  ];

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-12 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            This Is Why You're Still Stuck
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Generic AI advice doesn't work. Here's the difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* ChatGPT Card */}
          <div 
            ref={chatGptRef}
            className={`bg-card/50 border border-border rounded-xl p-6 md:p-8 relative overflow-hidden scroll-reveal-scale ${chatGptVisible ? 'revealed' : ''}`}
          >
            <div className="absolute inset-0 bg-destructive/5 pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-foreground mb-6">Asking ChatGPT</h3>
              
              <ul className="space-y-4">
                {chatGptPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-destructive font-bold mt-0.5">•</span>
                    <div>
                      <span className="text-muted-foreground block">{point.title}</span>
                      <span className="text-muted-foreground/70 text-sm">{point.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Synoptas Card */}
          <div 
            ref={synoptasRef}
            className={`bg-card/50 border border-primary/30 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)] scroll-reveal-scale ${synoptasVisible ? 'revealed' : ''}`}
            style={{ transitionDelay: '0.15s' }}
          >
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live Research
              </span>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-foreground mb-6">Using Synoptas</h3>
              
              <ul className="space-y-4">
                {synoptasPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <div>
                      <span className="text-foreground block">{point.title}</span>
                      <span className="text-muted-foreground text-sm">{point.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
              
              <Link 
                to="/market-research" 
                className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-primary hover:underline transition-all duration-300 hover:gap-2"
              >
                See live market data
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <p 
          ref={footerRef}
          className={`text-center text-muted-foreground mt-10 text-sm scroll-reveal ${footerVisible ? 'revealed' : ''}`}
          style={{ transitionDelay: '0.3s' }}
        >
          Stop getting generic advice. Get actionable strategies based on real market data.
        </p>
      </div>
    </section>
  );
};

export default WhySynoptas;
