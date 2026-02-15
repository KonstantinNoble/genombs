import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type { WebsiteProfile } from "@/types/chat";

interface WebsiteProfileCardProps {
  profile: WebsiteProfile;
  compact?: boolean;
}

const getScoreColor = (score: number) =>
  score >= 80 ? "hsl(var(--chart-6))" : score >= 60 ? "hsl(var(--primary))" : "hsl(var(--destructive))";

const getScoreGlow = (score: number) =>
  score >= 80
    ? "0 0 16px hsl(var(--chart-6) / 0.4)"
    : score >= 60
      ? "0 0 16px hsl(var(--primary) / 0.4)"
      : "0 0 16px hsl(var(--destructive) / 0.4)";

const ScoreRing = ({ score, size = 64 }: { score: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size, filter: `drop-shadow(${getScoreGlow(score)})` }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={4} />
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
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-foreground">
        {score}
      </span>
    </div>
  );
};

const CategoryBar = ({ label, value }: { label: string; value: number }) => {
  const color = value >= 80 ? "bg-chart-6" : value >= 60 ? "bg-primary" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-bold text-foreground w-7 text-right">{value}</span>
    </div>
  );
};

const WebsiteProfileCard = ({ profile, compact }: WebsiteProfileCardProps) => {
  const { profile_data, url, is_own_website, overall_score, category_scores } = profile;

  if (!profile_data || !category_scores || overall_score == null) return null;

  if (compact) {
    return (
      <Card className="border-border bg-card card-hover-subtle">
        <CardContent className="p-3 flex items-center gap-3">
          <ScoreRing score={overall_score} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-foreground truncate">{profile_data.name}</p>
            <p className="text-sm text-muted-foreground truncate">{url}</p>
          </div>
          <Badge variant={is_own_website ? "default" : "outline"} className="text-[10px] shrink-0">
            {is_own_website ? "Your Site" : "Competitor"}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-border bg-gradient-to-br from-card to-card/80 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_8px_24px_-8px_rgb(0_0_0/0.4)] ${is_own_website ? "ring-1 ring-primary/30" : ""}`}
    >
      <CardContent className="p-5 space-y-5">
        <div className="flex items-start gap-4">
          <ScoreRing score={overall_score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-foreground">{profile_data.name}</h3>
              <Badge variant={is_own_website ? "default" : "outline"} className="text-[10px] shrink-0">
                {is_own_website ? "Your Site" : "Competitor"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono mt-0.5">{url}</p>
          </div>
        </div>

        <div className="space-y-2">
          <CategoryBar label="Findability" value={category_scores.findability} />
          <CategoryBar label="Mobile" value={category_scores.mobileUsability} />
          <CategoryBar label="Offer" value={category_scores.offerClarity} />
          <CategoryBar label="Trust" value={category_scores.trustProof} />
          <CategoryBar label="Conversion" value={category_scores.conversionReadiness} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-chart-6" />
              Strengths
            </p>
            <div className="space-y-1.5">
              {(profile_data.strengths || []).slice(0, 3).map((s) => (
                <div key={s} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-chart-6 shrink-0" />
                  <span className="text-sm text-foreground leading-tight">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-destructive" />
              Weaknesses
            </p>
            <div className="space-y-1.5">
              {(profile_data.weaknesses || []).slice(0, 3).map((w) => (
                <div key={w} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-destructive shrink-0" />
                  <span className="text-sm text-foreground leading-tight">{w}</span>
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
