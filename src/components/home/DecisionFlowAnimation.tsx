import { useEffect, useState, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const DecisionFlowAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const models = [
    { name: 'GPT', x: 80, y: 60, color: 'hsl(220, 70%, 50%)', delay: '0s' },
    { name: 'Claude', x: 320, y: 60, color: 'hsl(25, 85%, 55%)', delay: '0.1s' },
    { name: 'Gemini', x: 80, y: 150, color: 'hsl(142, 70%, 45%)', delay: '0.2s' },
    { name: 'Perplexity', x: 320, y: 150, color: 'hsl(190, 85%, 45%)', delay: '0.3s' },
  ];

  const synthesisY = 260;
  const synthesisX = 200;

  // Helper function for SVG-native scale transform around a point
  const getScaleTransform = (x: number, y: number, scale: number) => {
    return `translate(${x}, ${y}) scale(${scale}) translate(${-x}, ${-y})`;
  };

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-md mx-auto"
    >
      <svg 
        className="w-full h-auto"
        viewBox="0 0 400 340"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Defs for gradients and filters */}
        <defs>
          <linearGradient id="grad-gpt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(220, 70%, 50%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(220, 70%, 50%)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="grad-claude" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 85%, 55%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(25, 85%, 55%)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="grad-gemini" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(142, 70%, 45%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(142, 70%, 45%)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="grad-perplexity" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(190, 85%, 45%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(190, 85%, 45%)" stopOpacity="0.2" />
          </linearGradient>
          
          <filter id="glow-synthesis" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hidden paths for particle animation */}
        <path id="path1" d={`M 80 60 Q 100 ${synthesisY - 60} ${synthesisX} ${synthesisY}`} fill="none" stroke="none" />
        <path id="path2" d={`M 320 60 Q 300 ${synthesisY - 60} ${synthesisX} ${synthesisY}`} fill="none" stroke="none" />
        <path id="path3" d={`M 80 150 Q 120 ${synthesisY - 30} ${synthesisX} ${synthesisY}`} fill="none" stroke="none" />
        <path id="path4" d={`M 320 150 Q 280 ${synthesisY - 30} ${synthesisX} ${synthesisY}`} fill="none" stroke="none" />

        {/* Visible connection lines - curved lines from each model to synthesis point */}
        <path 
          d={`M 80 60 Q 100 ${synthesisY - 60} ${synthesisX} ${synthesisY}`}
          fill="none"
          stroke="url(#grad-gpt)"
          strokeWidth="2"
          strokeDasharray="8 4"
          className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        />
        <path 
          d={`M 320 60 Q 300 ${synthesisY - 60} ${synthesisX} ${synthesisY}`}
          fill="none"
          stroke="url(#grad-claude)"
          strokeWidth="2"
          strokeDasharray="8 4"
          className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        />
        <path 
          d={`M 80 150 Q 120 ${synthesisY - 30} ${synthesisX} ${synthesisY}`}
          fill="none"
          stroke="url(#grad-gemini)"
          strokeWidth="2"
          strokeDasharray="8 4"
          className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        />
        <path 
          d={`M 320 150 Q 280 ${synthesisY - 30} ${synthesisX} ${synthesisY}`}
          fill="none"
          stroke="url(#grad-perplexity)"
          strokeWidth="2"
          strokeDasharray="8 4"
          className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Animated particles - Desktop only (animateMotion has issues on mobile browsers) */}
        {!isMobile && isVisible && (
          <>
            {/* GPT Particle */}
            <circle r="4" fill="hsl(220, 70%, 50%)" opacity="0.9">
              <animateMotion 
                dur="2.5s" 
                repeatCount="indefinite" 
                begin="0s"
                rotate="0"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
                keyTimes="0;1"
              >
                <mpath href="#path1" />
              </animateMotion>
            </circle>
            
            {/* Claude Particle */}
            <circle r="4" fill="hsl(25, 85%, 55%)" opacity="0.9">
              <animateMotion 
                dur="2.5s" 
                repeatCount="indefinite" 
                begin="0.6s"
                rotate="0"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
                keyTimes="0;1"
              >
                <mpath href="#path2" />
              </animateMotion>
            </circle>
            
            {/* Gemini Particle */}
            <circle r="4" fill="hsl(142, 70%, 45%)" opacity="0.9">
              <animateMotion 
                dur="2.5s" 
                repeatCount="indefinite" 
                begin="1.2s"
                rotate="0"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
                keyTimes="0;1"
              >
                <mpath href="#path3" />
              </animateMotion>
            </circle>
            
            {/* Perplexity Particle */}
            <circle r="4" fill="hsl(190, 85%, 45%)" opacity="0.9">
              <animateMotion 
                dur="2.5s" 
                repeatCount="indefinite" 
                begin="1.8s"
                rotate="0"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
                keyTimes="0;1"
              >
                <mpath href="#path4" />
              </animateMotion>
            </circle>
          </>
        )}

        {/* Mobile: Pulsing indicators at each model node + animated rings at synthesis */}
        {isMobile && isVisible && (
          <>
            {/* Pulsing dots at each model position - staggered timing */}
            {models.map((model, index) => (
              <circle 
                key={`mobile-pulse-${model.name}`}
                cx={model.x} 
                cy={model.y + 38}
                r="3"
                fill={model.color}
                opacity="0.8"
              >
                <animate 
                  attributeName="r" 
                  values="3;6;3" 
                  dur="1.5s" 
                  begin={`${index * 0.4}s`}
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="opacity" 
                  values="0.8;0.3;0.8" 
                  dur="1.5s" 
                  begin={`${index * 0.4}s`}
                  repeatCount="indefinite" 
                />
              </circle>
            ))}
            
            {/* Animated expanding rings at synthesis point */}
            <circle 
              cx={synthesisX} 
              cy={synthesisY} 
              r="50"
              fill="none"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth="1"
              opacity="0"
            >
              <animate 
                attributeName="r" 
                values="35;55" 
                dur="2s" 
                repeatCount="indefinite" 
              />
              <animate 
                attributeName="opacity" 
                values="0.5;0" 
                dur="2s" 
                repeatCount="indefinite" 
              />
            </circle>
            <circle 
              cx={synthesisX} 
              cy={synthesisY} 
              r="50"
              fill="none"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth="1"
              opacity="0"
            >
              <animate 
                attributeName="r" 
                values="35;55" 
                dur="2s" 
                begin="1s"
                repeatCount="indefinite" 
              />
              <animate 
                attributeName="opacity" 
                values="0.5;0" 
                dur="2s" 
                begin="1s"
                repeatCount="indefinite" 
              />
            </circle>
          </>
        )}

        {/* Model nodes - using SVG transform attribute instead of CSS transform-origin */}
        {models.map((model) => (
          <g 
            key={model.name}
            transform={getScaleTransform(model.x, model.y, isVisible ? 1 : 0.8)}
            style={{
              opacity: isVisible ? 1 : 0,
              transition: `opacity 0.6s ease-out, transform 0.6s ease-out`,
              transitionDelay: model.delay,
            }}
          >
            {/* Outer glow */}
            <circle 
              cx={model.x} 
              cy={model.y} 
              r="36"
              fill="none"
              stroke={model.color}
              strokeWidth="1"
              opacity="0.3"
            />
            {/* Main circle */}
            <circle 
              cx={model.x} 
              cy={model.y} 
              r="30"
              fill="white"
              stroke={model.color}
              strokeWidth="2.5"
            />
            {/* Model label */}
            <text 
              x={model.x} 
              y={model.y}
              textAnchor="middle" 
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill="hsl(222.2, 47.4%, 11.2%)"
            >
              {model.name}
            </text>
          </g>
        ))}

        {/* Synthesis point - central result - using SVG transform attribute */}
        <g
          transform={getScaleTransform(synthesisX, synthesisY, isVisible ? 1 : 0.5)}
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            transitionDelay: '0.5s',
          }}
        >
          {/* Outer pulsing ring */}
          <circle 
            cx={synthesisX} 
            cy={synthesisY} 
            r="38"
            fill="none"
            stroke="hsl(142, 76%, 36%)"
            strokeWidth="1.5"
            opacity="0.4"
            filter="url(#glow-synthesis)"
          >
            <animate 
              attributeName="r" 
              values="38;44;38" 
              dur="2s" 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="opacity" 
              values="0.4;0.1;0.4" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </circle>
          
          {/* Middle ring */}
          <circle 
            cx={synthesisX} 
            cy={synthesisY} 
            r="32"
            fill="hsl(142, 76%, 36%, 0.1)"
            stroke="hsl(142, 76%, 36%)"
            strokeWidth="2"
          />
          
          {/* Inner circle */}
          <circle 
            cx={synthesisX} 
            cy={synthesisY} 
            r="22"
            fill="hsl(142, 76%, 36%, 0.2)"
          />
          
          {/* Checkmark */}
          <text 
            x={synthesisX} 
            y={synthesisY + 2}
            textAnchor="middle" 
            dominantBaseline="middle"
            fontSize="20"
            fontWeight="bold"
            fill="hsl(142, 76%, 36%)"
          >
            ✓
          </text>
        </g>

        {/* Label below synthesis point */}
        <text 
          x={synthesisX} 
          y={synthesisY + 55}
          textAnchor="middle"
          fontSize="12"
          fontWeight="500"
          fill="hsl(215.4, 16.3%, 46.9%)"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.8s ease-out',
            transitionDelay: '0.8s',
          }}
        >
          Synthesized Insight
        </text>
      </svg>
    </div>
  );
};

export default DecisionFlowAnimation;
