import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  value: number;
  size?: number;
  className?: string;
}

export function ConfidenceGauge({ value, size = 140, className = "" }: ConfidenceGaugeProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Calculate the angle for the needle (-135 to 135 degrees, 270 total arc)
  const needleAngle = -135 + (clampedValue / 100) * 270;
  
  // Color based on value
  const getColor = (val: number) => {
    if (val >= 80) return "#16a34a"; // green-600
    if (val >= 60) return "#ca8a04"; // yellow-600
    if (val >= 40) return "#ea580c"; // orange-600
    return "#dc2626"; // red-600
  };

  const color = getColor(clampedValue);

  const getLabel = (val: number) => {
    if (val >= 80) return "Thorough";
    if (val >= 60) return "Good";
    if (val >= 40) return "Partial";
    return "Incomplete";
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)} style={{ width: size }}>
      <svg
        viewBox="0 0 100 65"
        width={size}
        height={size * 0.65}
        className="overflow-visible shrink-0"
      >
        {/* Arc gradient definition */}
        <defs>
          <linearGradient id="gaugeGradientClean" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="25%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#ca8a04" />
            <stop offset="75%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d="M 8 55 A 42 42 0 0 1 92 55"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="10"
          strokeLinecap="round"
        />
        
        {/* Color gradient arc */}
        <path
          d="M 8 55 A 42 42 0 0 1 92 55"
          fill="none"
          stroke="url(#gaugeGradientClean)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Needle */}
        <g 
          transform={`rotate(${needleAngle} 50 55)`}
          className="transition-transform duration-1000 ease-out"
        >
          {/* Needle body - simple triangle */}
          <polygon
            points="50,18 47,55 53,55"
            fill="#374151"
            className="dark:fill-gray-300"
          />
          {/* Needle center circle */}
          <circle
            cx="50"
            cy="55"
            r="5"
            fill="#374151"
            className="dark:fill-gray-300"
          />
          <circle
            cx="50"
            cy="55"
            r="2.5"
            fill="#f3f4f6"
            className="dark:fill-gray-700"
          />
        </g>
      </svg>
      
      {/* Value display - positioned below the gauge */}
      <div className="text-center mt-2 shrink-0">
        <span className="block text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
          Coverage
        </span>
        <span 
          className="text-xl sm:text-2xl font-bold tabular-nums leading-none"
          style={{ color }}
        >
          {clampedValue}%
        </span>
        <span 
          className="block text-xs sm:text-sm font-medium mt-0.5"
          style={{ color }}
        >
          {getLabel(clampedValue)}
        </span>
      </div>
    </div>
  );
}
