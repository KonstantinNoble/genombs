import { cn } from "@/lib/utils";

interface TabIconProps {
  className?: string;
  size?: number;
}

// Chess Knight for Strategy tab
export function StrategyIcon({ className = "", size = 20 }: TabIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-colors", className)}
    >
      {/* Knight silhouette - chess piece */}
      <path
        d="M7 22h10v-2H7v2z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M8 20h8v-2H8v2z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Knight head */}
      <path
        d="M8 18V12c0-1.5.5-3 2-4l-1.5-2 2-1 1.5 2c.5-.3 1-.5 1.5-.5 2.5 0 4.5 2 4.5 5v6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mane detail */}
      <path
        d="M10.5 8c1 0 2 1 2 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Eye */}
      <circle
        cx="14"
        cy="9"
        r="1"
        fill="currentColor"
      />
      {/* Nose */}
      <path
        d="M9 6.5l1.5 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Telescope for Long-term Outlook tab
export function OutlookIcon({ className = "", size = 20 }: TabIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-colors", className)}
    >
      {/* Telescope tube */}
      <path
        d="M21 4L10 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Lens housing */}
      <ellipse
        cx="20"
        cy="5"
        rx="2.5"
        ry="3"
        transform="rotate(-35 20 5)"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Eyepiece */}
      <circle
        cx="9"
        cy="13"
        r="2.5"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Tripod legs */}
      <path
        d="M9 15.5L6 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 15.5L12 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 15.5L9 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Stars */}
      <circle cx="16" cy="3" r="0.7" fill="currentColor" />
      <circle cx="18" cy="7" r="0.5" fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}

// Radar for Competition tab
export function CompetitorIcon({ className = "", size = 20 }: TabIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-colors", className)}
    >
      {/* Outer ring */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
      {/* Middle ring */}
      <circle
        cx="12"
        cy="12"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      {/* Inner ring */}
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />
      {/* Center dot */}
      <circle
        cx="12"
        cy="12"
        r="1"
        fill="currentColor"
      />
      {/* Sweep line */}
      <path
        d="M12 12L18 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Detected blips */}
      <circle
        cx="16"
        cy="8"
        r="1.5"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <circle
        cx="8"
        cy="9"
        r="1"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <circle
        cx="14"
        cy="15"
        r="1"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  );
}
