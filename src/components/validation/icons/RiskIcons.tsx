import { cn } from "@/lib/utils";

interface RiskIconProps {
  className?: string;
  size?: number;
  active?: boolean;
}

// Shield icon for Conservative risk preference
export function RiskShieldIcon({ className = "", size = 24, active = false }: RiskIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "transition-all duration-300",
        active ? "text-primary scale-110" : "text-muted-foreground",
        className
      )}
    >
      {/* Shield body */}
      <path
        d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.2 : 0}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Inner shield layer */}
      <path
        d="M12 5L6 8v4c0 3.7 2.56 7.16 6 8 3.44-.84 6-4.3 6-8V8l-6-3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeLinejoin="round"
      />
      {/* Checkmark in center */}
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Balance/Scale icon for Balanced risk preference
export function RiskBalanceIcon({ className = "", size = 24, active = false }: RiskIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "transition-all duration-300",
        active ? "text-primary scale-110" : "text-muted-foreground",
        className
      )}
    >
      {/* Central pillar */}
      <line
        x1="12"
        y1="4"
        x2="12"
        y2="20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Base */}
      <path
        d="M8 20h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Balance beam */}
      <line
        x1="4"
        y1="8"
        x2="20"
        y2="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Left pan */}
      <path
        d="M4 8l2 6h-4l2-6z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.2 : 0}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Right pan */}
      <path
        d="M20 8l2 6h-4l2-6z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.2 : 0}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Fulcrum */}
      <circle
        cx="12"
        cy="4"
        r="1.5"
        fill="currentColor"
      />
    </svg>
  );
}

// Rocket icon for Aggressive risk preference
export function RiskRocketIcon({ className = "", size = 24, active = false }: RiskIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "transition-all duration-300",
        active ? "text-primary scale-110" : "text-muted-foreground",
        className
      )}
    >
      {/* Rocket body */}
      <path
        d="M12 2c-2 2-4 6-4 10 0 2 .5 3.5 1 4.5l3 3.5 3-3.5c.5-1 1-2.5 1-4.5 0-4-2-8-4-10z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.2 : 0}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Window */}
      <circle
        cx="12"
        cy="10"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Left fin */}
      <path
        d="M8 12l-3 4 3 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right fin */}
      <path
        d="M16 12l3 4-3 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Flame trails */}
      {active && (
        <>
          <path
            d="M10 20l-1 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M12 20v3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M14 20l1 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </>
      )}
    </svg>
  );
}
