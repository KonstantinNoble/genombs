interface SynthesisIconProps {
  className?: string;
  size?: number;
}

export function SynthesisIcon({ className = "", size = 24 }: SynthesisIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Three incoming streams converging to center */}
      {/* Top-left stream */}
      <path
        d="M4 4 L10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-60"
      />
      <circle
        cx="3"
        cy="3"
        r="2"
        fill="currentColor"
        className="opacity-40"
      />
      
      {/* Top-right stream */}
      <path
        d="M20 4 L14 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-60"
      />
      <circle
        cx="21"
        cy="3"
        r="2"
        fill="currentColor"
        className="opacity-40"
      />
      
      {/* Bottom stream */}
      <path
        d="M12 20 L12 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-60"
      />
      <circle
        cx="12"
        cy="21"
        r="2"
        fill="currentColor"
        className="opacity-40"
      />
      
      {/* Central synthesis point - main focal element */}
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Inner core - represents unified output */}
      <circle
        cx="12"
        cy="12"
        r="1.5"
        fill="currentColor"
      />
    </svg>
  );
}
