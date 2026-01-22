interface DissentIconProps {
  className?: string;
  size?: number;
}

export function DissentIcon({ className = "", size = 24 }: DissentIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Central point */}
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      
      {/* Three diverging arrows */}
      {/* Arrow 1 - top right */}
      <path
        d="M14 10L18 6M18 6L18 9M18 6L15 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Arrow 2 - bottom right */}
      <path
        d="M14 14L18 18M18 18L15 18M18 18L18 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Arrow 3 - left */}
      <path
        d="M9 12L4 12M4 12L7 9M4 12L7 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
