import { useEffect, useState } from "react";

const DecisionFlowAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const models = [
    { name: "GPT", delay: "0s", color: "hsl(220, 70%, 50%)" },
    { name: "Claude", delay: "0.1s", color: "hsl(25, 85%, 55%)" },
    { name: "Gemini", delay: "0.2s", color: "hsl(142, 70%, 45%)" },
    { name: "Perplexity", delay: "0.3s", color: "hsl(190, 85%, 45%)" },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto py-12">
      {/* SVG Connection Lines */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 280"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(220, 70%, 50%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 85%, 55%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(142, 70%, 45%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="lineGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(190, 85%, 45%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        {/* Animated connection lines from each model to synthesis center */}
        <path
          d="M 80 60 Q 120 140 200 200"
          fill="none"
          stroke="url(#lineGradient1)"
          strokeWidth="2"
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            strokeDasharray: 200,
            strokeDashoffset: isVisible ? 0 : 200,
            transition: 'stroke-dashoffset 1.2s ease-out 0.5s, opacity 0.5s ease-out 0.5s'
          }}
        />
        <path
          d="M 320 60 Q 280 140 200 200"
          fill="none"
          stroke="url(#lineGradient2)"
          strokeWidth="2"
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            strokeDasharray: 200,
            strokeDashoffset: isVisible ? 0 : 200,
            transition: 'stroke-dashoffset 1.2s ease-out 0.6s, opacity 0.5s ease-out 0.6s'
          }}
        />
        <path
          d="M 80 140 Q 140 180 200 200"
          fill="none"
          stroke="url(#lineGradient4)"
          strokeWidth="2"
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            strokeDasharray: 150,
            strokeDashoffset: isVisible ? 0 : 150,
            transition: 'stroke-dashoffset 1.2s ease-out 0.7s, opacity 0.5s ease-out 0.7s'
          }}
        />
        <path
          d="M 320 140 Q 260 180 200 200"
          fill="none"
          stroke="url(#lineGradient3)"
          strokeWidth="2"
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            strokeDasharray: 150,
            strokeDashoffset: isVisible ? 0 : 150,
            transition: 'stroke-dashoffset 1.2s ease-out 0.8s, opacity 0.5s ease-out 0.8s'
          }}
        />

        {/* Data flow particles */}
        {isVisible && (
          <>
            <circle r="3" fill="hsl(220, 70%, 50%)" opacity="0.8">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0s">
                <mpath href="#path1" />
              </animateMotion>
            </circle>
            <circle r="3" fill="hsl(25, 85%, 55%)" opacity="0.8">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s">
                <mpath href="#path2" />
              </animateMotion>
            </circle>
          </>
        )}
        <path id="path1" d="M 80 60 Q 120 140 200 200" fill="none" stroke="none" />
        <path id="path2" d="M 320 60 Q 280 140 200 200" fill="none" stroke="none" />
      </svg>

      {/* Top row: 2 AI model nodes */}
      <div className="flex justify-between items-start mb-4 px-8 relative z-10">
        {models.slice(0, 2).map((model) => (
          <div
            key={model.name}
            className={`flex flex-col items-center transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{ transitionDelay: model.delay }}
          >
            <div 
              className="decision-node w-16 h-16 rounded-full bg-card border-2 flex items-center justify-center shadow-lg"
              style={{ borderColor: model.color }}
            >
              <span className="text-xs font-semibold text-foreground tracking-tight">
                {model.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Second row: 2 AI model nodes */}
      <div className="flex justify-between items-start mb-8 px-8 relative z-10">
        {models.slice(2, 4).map((model) => (
          <div
            key={model.name}
            className={`flex flex-col items-center transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{ transitionDelay: model.delay }}
          >
            <div 
              className="decision-node w-16 h-16 rounded-full bg-card border-2 flex items-center justify-center shadow-lg"
              style={{ borderColor: model.color }}
            >
              <span className="text-[10px] font-semibold text-foreground tracking-tight">
                {model.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Synthesis point */}
      <div className="flex flex-col items-center relative z-10">
        <div
          className={`synthesis-point w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center transition-all duration-700 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
          style={{ transitionDelay: "0.9s" }}
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xl font-bold">✓</span>
          </div>
        </div>
        
        <span
          className={`mt-4 text-sm font-medium text-muted-foreground tracking-wide transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={{ transitionDelay: "1.1s" }}
        >
          Synthesized Insight
        </span>
      </div>

      {/* Model labels below */}
      <div 
        className={`mt-8 flex justify-center gap-6 flex-wrap transition-all duration-700 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: "1.3s" }}
      >
        {models.map((model) => (
          <div key={model.name} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: model.color }}
            />
            <span className="text-xs text-muted-foreground">{model.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionFlowAnimation;
