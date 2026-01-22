import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  value: number;
  size?: number;
  className?: string;
}

export function ConfidenceGauge({ value, size = 120, className = "" }: ConfidenceGaugeProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Calculate the angle for the needle (-135 to 135 degrees, 270 total arc)
  const needleAngle = -135 + (clampedValue / 100) * 270;
  
  // Calculate stroke dasharray for the arc progress
  const circumference = Math.PI * 80; // Half of full circle for 180 degree arc
  const arcLength = (clampedValue / 100) * circumference * 0.75; // 0.75 for 270 degree arc
  
  // Color based on value
  const getColor = (val: number) => {
    if (val >= 80) return { main: "#22c55e", glow: "#4ade80" }; // green
    if (val >= 60) return { main: "#eab308", glow: "#facc15" }; // yellow
    if (val >= 40) return { main: "#f97316", glow: "#fb923c" }; // orange
    return { main: "#ef4444", glow: "#f87171" }; // red
  };

  const colors = getColor(clampedValue);

  const getLabel = (val: number) => {
    if (val >= 80) return "High";
    if (val >= 60) return "Good";
    if (val >= 40) return "Moderate";
    return "Low";
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)} style={{ width: size, height: size * 0.7 }}>
      <svg
        viewBox="0 0 100 70"
        width={size}
        height={size * 0.7}
        className="overflow-visible"
      >
        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="33%" stopColor="#f97316" />
            <stop offset="66%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d="M 10 60 A 40 40 0 0 1 90 60"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Gradient progress arc */}
        <path
          d="M 10 60 A 40 40 0 0 1 90 60"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          className="transition-all duration-1000 ease-out"
          filter="url(#glow)"
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick, i) => {
          const angle = (-135 + (tick / 100) * 270) * (Math.PI / 180);
          const innerR = 32;
          const outerR = 36;
          const x1 = 50 + innerR * Math.cos(angle);
          const y1 = 60 + innerR * Math.sin(angle);
          const x2 = 50 + outerR * Math.cos(angle);
          const y2 = 60 + outerR * Math.sin(angle);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Needle */}
        <g 
          transform={`rotate(${needleAngle} 50 60)`}
          className="transition-transform duration-1000 ease-out"
        >
          {/* Needle shadow */}
          <line
            x1="50"
            y1="60"
            x2="50"
            y2="28"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Needle body */}
          <line
            x1="50"
            y1="60"
            x2="50"
            y2="30"
            stroke={colors.main}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          {/* Needle center dot */}
          <circle
            cx="50"
            cy="60"
            r="4"
            fill={colors.main}
            filter="url(#glow)"
          />
        </g>
      </svg>
      
      {/* Value display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span 
          className="text-2xl sm:text-3xl font-bold tabular-nums"
          style={{ color: colors.main }}
        >
          {clampedValue}%
        </span>
        <span className="block text-xs text-muted-foreground">
          {getLabel(clampedValue)}
        </span>
      </div>
    </div>
  );
}
