import { Card, CardContent } from "@/components/ui/card";
import type { PageSpeedData } from "@/types/chat";

interface PageSpeedCardProps {
  data: PageSpeedData;
  siteName: string;
}

const getColor = (score: number) =>
  score >= 90
    ? "hsl(var(--chart-6))"
    : score >= 50
      ? "hsl(var(--primary))"
      : "hsl(var(--destructive))";

const ScoreCircle = ({ score, label }: { score: number; label: string }) => {
  const size = 64;
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={3} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
          {score}
        </span>
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
};

const formatMs = (ms: number | null) => {
  if (ms === null) return "N/A";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
};

const PageSpeedCard = ({ data, siteName }: PageSpeedCardProps) => {
  const cwv = data.coreWebVitals ?? { lcp: null, cls: null, fcp: null, tbt: null, speedIndex: null };

  const vitals = [
    { label: "LCP", value: formatMs(cwv.lcp), good: cwv.lcp !== null && cwv.lcp < 2500 },
    { label: "CLS", value: cwv.cls !== null ? cwv.cls.toFixed(3) : "N/A", good: cwv.cls !== null && cwv.cls < 0.1 },
    { label: "FCP", value: formatMs(cwv.fcp), good: cwv.fcp !== null && cwv.fcp < 1800 },
    { label: "TBT", value: formatMs(cwv.tbt), good: cwv.tbt !== null && cwv.tbt < 200 },
  ];

  return (
    <Card className="border-border bg-card transition-all duration-200 hover:border-primary/20">
      <CardContent className="p-4 space-y-4">
        <h4 className="text-base font-bold text-foreground">{siteName}</h4>

        <div className="grid grid-cols-4 gap-3">
          <ScoreCircle score={data.performance} label="Performance" />
          <ScoreCircle score={data.accessibility} label="Accessibility" />
          <ScoreCircle score={data.bestPractices} label="Best Practices" />
          <ScoreCircle score={data.seo} label="SEO" />
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">Core Web Vitals</p>
          <div className="grid grid-cols-4 gap-2">
            {vitals.map((v) => (
              <div key={v.label} className="text-center">
                <p className="text-sm font-semibold text-foreground">{v.value}</p>
                <p className="text-xs text-muted-foreground">{v.label}</p>
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mt-1"
                  style={{ backgroundColor: v.value === "N/A" ? "hsl(var(--muted-foreground))" : v.good ? "hsl(var(--chart-6))" : "hsl(var(--destructive))" }}
                />
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/50 text-right">Source: Google PageSpeed Insights</p>
      </CardContent>
    </Card>
  );
};

export default PageSpeedCard;
