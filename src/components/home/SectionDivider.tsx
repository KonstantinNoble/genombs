interface SectionDividerProps {
  variant?: 'wave' | 'curve' | 'angle';
  position?: 'top' | 'bottom';
  flip?: boolean;
  className?: string;
}

const SectionDivider = ({ 
  variant = 'wave', 
  position = 'bottom', 
  flip = false,
  className = '' 
}: SectionDividerProps) => {
  const getPath = () => {
    switch (variant) {
      case 'wave':
        return "M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z";
      case 'curve':
        return "M0,64L1440,32L1440,100L0,100Z";
      case 'angle':
        return "M0,96L1440,32L1440,100L0,100Z";
      default:
        return "M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z";
    }
  };

  return (
    <div 
      className={`wave-divider ${position === 'top' ? 'top-0' : 'bottom-0'} ${className}`}
      style={{ 
        transform: flip ? 'rotate(180deg)' : undefined,
        zIndex: 1
      }}
    >
      <svg 
        viewBox="0 0 1440 100" 
        preserveAspectRatio="none"
        className="w-full h-12 md:h-16"
      >
        <path 
          d={getPath()} 
          className="shape-fill"
          style={{ fill: 'hsl(var(--muted))' }}
        />
      </svg>
    </div>
  );
};

export default SectionDivider;