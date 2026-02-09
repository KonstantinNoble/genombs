interface GenomeScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const GenomeScore = ({ score, size = "md", label = "Growth Readiness" }: GenomeScoreProps) => {
  const dimensions = {
    sm: { width: 80, stroke: 6, fontSize: "text-lg", labelSize: "text-xs" },
    md: { width: 120, stroke: 8, fontSize: "text-3xl", labelSize: "text-sm" },
    lg: { width: 160, stroke: 10, fontSize: "text-4xl", labelSize: "text-base" },
  };

  const d = dimensions[size];
  const radius = (d.width - d.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: d.width, height: d.width }}>
        <svg
          width={d.width}
          height={d.width}
          viewBox={`0 0 ${d.width} ${d.width}`}
          className="transform -rotate-90"
        >
          <circle
            cx={d.width / 2}
            cy={d.width / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={d.stroke}
          />
          <circle
            cx={d.width / 2}
            cy={d.width / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={d.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${d.fontSize} font-bold text-foreground`}>{score}</span>
          <span className={`${d.labelSize} text-muted-foreground`}>/100</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

export default GenomeScore;
