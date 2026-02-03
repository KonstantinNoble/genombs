import { useEffect, useState } from "react";

const DecisionFlowAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const models = [
    { name: "GPT", delay: "0s" },
    { name: "Claude", delay: "0.15s" },
    { name: "Gemini", delay: "0.3s" },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto py-12">
      {/* Top row: 3 AI model nodes */}
      <div className="flex justify-between items-center mb-8 px-4">
        {models.map((model, index) => (
          <div
            key={model.name}
            className={`flex flex-col items-center transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: model.delay }}
          >
            <div className="decision-node w-14 h-14 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-md">
              <span className="text-xs font-semibold text-foreground tracking-tight">
                {model.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Connecting lines */}
      <div className="relative h-16 mb-6">
        {/* Left diagonal line */}
        <div
          className={`absolute left-[15%] top-0 w-px h-16 origin-top transition-all duration-700 ${
            isVisible ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
          }`}
          style={{
            background: "linear-gradient(180deg, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.15))",
            transform: "rotate(25deg)",
            transitionDelay: "0.4s",
          }}
        />
        
        {/* Center vertical line */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 top-0 w-px h-16 transition-all duration-700 ${
            isVisible ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
          }`}
          style={{
            background: "linear-gradient(180deg, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.2))",
            transitionDelay: "0.5s",
          }}
        />
        
        {/* Right diagonal line */}
        <div
          className={`absolute right-[15%] top-0 w-px h-16 origin-top transition-all duration-700 ${
            isVisible ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
          }`}
          style={{
            background: "linear-gradient(180deg, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.15))",
            transform: "rotate(-25deg)",
            transitionDelay: "0.45s",
          }}
        />
      </div>

      {/* Synthesis point */}
      <div className="flex flex-col items-center">
        <div
          className={`synthesis-point w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center transition-all duration-700 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
          style={{ transitionDelay: "0.6s" }}
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xl font-bold">✓</span>
          </div>
        </div>
        
        <span
          className={`mt-4 text-sm font-medium text-muted-foreground tracking-wide transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={{ transitionDelay: "0.75s" }}
        >
          Synthesized Insight
        </span>
      </div>
    </div>
  );
};

export default DecisionFlowAnimation;
