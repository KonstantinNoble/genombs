import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { WebsiteProfile } from "@/lib/mock-chat-data";

interface WebsiteProfileCardProps {
  profile: WebsiteProfile;
  compact?: boolean;
}

const ScoreRing = ({ score, size = 56 }: { score: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? "hsl(142 71% 45%)"
      : score >= 60
        ? "hsl(var(--primary))"
        : "hsl(var(--destructive))";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground"
      >
        {score}
      </span>
    </div>
  );
};

const CategoryBar = ({ label, value }: { label: string; value: number }) => {
  const color =
    value >= 80
      ? "bg-chart-6"
      : value >= 60
        ? "bg-primary"
        : "bg-destructive";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground w-6 text-right">{value}</span>
    </div>
  );
};

const WebsiteProfileCard = ({ profile, compact }: WebsiteProfileCardProps) => {
  const { profileData, url, isOwnWebsite, overallScore, categoryScores } = profile;

  if (compact) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-3 flex items-center gap-3">
          <ScoreRing score={overallScore} size={36} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{profileData.name}</p>
            <p className="text-xs text-muted-foreground truncate">{url}</p>
          </div>
          <Badge variant={isOwnWebsite ? "default" : "outline"} className="text-[10px] shrink-0">
            {isOwnWebsite ? "Your Site" : "Competitor"}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border bg-card ${isOwnWebsite ? "ring-1 ring-primary/30" : ""}`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <ScoreRing score={overallScore} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-foreground">{profileData.name}</h3>
              <Badge variant={isOwnWebsite ? "default" : "outline"} className="text-[10px] shrink-0">
                {isOwnWebsite ? "Your Site" : "Competitor"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{url}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <CategoryBar label="SEO" value={categoryScores.seo} />
          <CategoryBar label="UX" value={categoryScores.ux} />
          <CategoryBar label="Content" value={categoryScores.content} />
          <CategoryBar label="Trust" value={categoryScores.trust} />
          <CategoryBar label="Speed" value={categoryScores.speed} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5">Strengths</p>
            <div className="space-y-1">
              {profileData.strengths.slice(0, 3).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-6 shrink-0" />
                  <span className="text-[11px] text-foreground leading-tight">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5">Weaknesses</p>
            <div className="space-y-1">
              {profileData.weaknesses.slice(0, 3).map((w) => (
                <div key={w} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  <span className="text-[11px] text-foreground leading-tight">{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebsiteProfileCard;
