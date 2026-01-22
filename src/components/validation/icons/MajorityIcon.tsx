interface MajorityIconProps {
  className?: string;
  size?: number;
}

export function MajorityIcon({ className = "", size = 24 }: MajorityIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Two connected circles (majority) */}
      <circle
        cx="8"
        cy="12"
        r="4"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="14"
        cy="12"
        r="4"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Connection line between the two */}
      <line
        x1="12"
        y1="12"
        x2="10"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Third circle (separate/minority) - outlined only */}
      <circle
        cx="20"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        fill="none"
      />
    </svg>
  );
}
