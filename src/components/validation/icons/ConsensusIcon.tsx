interface ConsensusIconProps {
  className?: string;
  size?: number;
}

export function ConsensusIcon({ className = "", size = 24 }: ConsensusIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Three overlapping circles forming a unified center - Venn diagram style */}
      <circle
        cx="12"
        cy="9"
        r="5"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="9"
        cy="14"
        r="5"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="15"
        cy="14"
        r="5"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Center intersection point - solid */}
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
