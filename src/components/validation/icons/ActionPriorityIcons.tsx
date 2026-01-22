import { cn } from "@/lib/utils";

interface ActionIconProps {
  priority: number;
  className?: string;
  size?: number;
}

export function ActionPriorityIcon({ priority, className = "", size = 32 }: ActionIconProps) {
  // Top priority (1) gets a target/bullseye icon
  if (priority === 1) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("text-primary", className)}
      >
        {/* Outer ring */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Middle ring */}
        <circle
          cx="12"
          cy="12"
          r="6"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Inner ring */}
        <circle
          cx="12"
          cy="12"
          r="2.5"
          fill="currentColor"
        />
        {/* Arrow hitting target */}
        <path
          d="M20 4L14 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M17 4h3v3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Priority 2-3 gets directional arrows
  if (priority <= 3) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("text-primary/80", className)}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Upward arrow */}
        <path
          d="M12 16V8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 11l4-4 4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Number */}
        <text
          x="12"
          y="20"
          textAnchor="middle"
          fontSize="6"
          fill="currentColor"
          fontWeight="bold"
        >
          {priority}
        </text>
      </svg>
    );
  }

  // Priority 4+ gets simpler numbered circles
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fill="currentColor"
        fontWeight="bold"
      >
        {priority}
      </text>
    </svg>
  );
}
