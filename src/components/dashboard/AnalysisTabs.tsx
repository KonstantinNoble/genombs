import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import type { WebsiteProfile } from "@/types/chat";

interface AnalysisTabsContentProps {
  tab: string;
  profiles: WebsiteProfile[];
}

const getScoreColor = (score: number) =>
  score >= 80
    ? "hsl(var(--chart-6))"
    : score >= 60
      ? "hsl(var(--primary))"
      : "hsl(var(--destructive))";

const ScoreRing = ({ score, size = 52 }: { score: number; size?: number }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
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
  );
};

const AnalysisTabsContent = ({ tab, profiles }: AnalysisTabsContentProps) => {
  const ownSite = profiles.find((p) => p.is_own_website);
  const competitors = profiles.filter((p) => !p.is_own_website);

  if (!ownSite || !ownSite.profile_data) return null;

  if (tab === "positioning") {
    return (
      <div className="space-y-3">
        {[ownSite, ...competitors].map((profile) => {
          if (!profile.profile_data) return null;
          return (
            <Card key={profile.id} className="border-border bg-card transition-all duration-200 hover:border-primary/20">
              <CardContent className="p-4 space-y-3">
                 <div className="flex items-center justify-between">
                   <h4 className="text-base font-bold text-foreground">{profile.profile_data.name}</h4>
                   <Badge variant={profile.is_own_website ? "default" : "outline"} className="text-xs">
                    {profile.is_own_website ? "Your Site" : "Competitor"}
                  </Badge>
                </div>
                <div className="space-y-3">
                   <div className="border-l-2 border-primary/30 pl-3">
                     <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-0.5">Target Audience</p>
                     <p className="text-sm text-foreground">{profile.profile_data.targetAudience}</p>
                   </div>
                   <div className="border-l-2 border-primary/30 pl-3">
                     <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-0.5">Unique Selling Proposition</p>
                     <p className="text-sm text-foreground">{profile.profile_data.usp}</p>
                   </div>
                   <div>
                     <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5">Site Structure</p>
                    <div className="flex flex-wrap gap-1">
                       {profile.profile_data.siteStructure.map((s) => (
                         <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                       ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  if (tab === "offers") {
    return (
      <div className="space-y-3">
        {[ownSite, ...competitors].map((profile) => {
          if (!profile.profile_data) return null;
          return (
            <Card key={profile.id} className="border-border bg-card transition-all duration-200 hover:border-primary/20">
              <CardContent className="p-4 space-y-3">
                 <div className="flex items-center justify-between">
                   <h4 className="text-base font-bold text-foreground">{profile.profile_data.name}</h4>
                   <Badge variant={profile.is_own_website ? "default" : "outline"} className="text-xs">
                     {profile.is_own_website ? "Your Site" : "Competitor"}
                   </Badge>
                 </div>
                 <div>
                   <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5">Call-to-Actions</p>
                  <div className="flex flex-wrap gap-1.5">
                     {profile.profile_data.ctas.map((cta) => (
                       <Badge key={cta} variant="outline" className="text-xs border-primary/30 text-primary">
                         {cta}
                       </Badge>
                     ))}
                  </div>
                </div>
                 <div className="border-l-2 border-primary/30 pl-3">
                   <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-0.5">Value Proposition</p>
                   <p className="text-sm text-foreground">{profile.profile_data.usp}</p>
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  if (tab === "trust") {
    return (
      <div className="space-y-3">
        {[ownSite, ...competitors].map((profile) => {
          if (!profile.profile_data) return null;
          const trustScore = profile.category_scores?.trustProof ?? 0;
          return (
            <Card key={profile.id} className="border-border bg-card transition-all duration-200 hover:border-primary/20">
              <CardContent className="p-4 space-y-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <ScoreRing score={trustScore} />
                     <div>
                       <h4 className="text-base font-bold text-foreground">{profile.profile_data.name}</h4>
                       <p className="text-xs text-muted-foreground mt-0.5">Trust & Proof Score</p>
                     </div>
                   </div>
                   <Badge variant={profile.is_own_website ? "default" : "outline"} className="text-xs">
                    {profile.is_own_website ? "Your Site" : "Competitor"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                       <CheckCircle2 className="w-4 h-4 text-chart-6" />
                       Strengths
                     </p>
                    <div className="space-y-1.5">
                      {profile.profile_data.strengths.slice(0, 5).map((s) => (
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
                      {profile.profile_data.weaknesses.slice(0, 5).map((w) => (
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
        })}
      </div>
    );
  }

  return null;
};

export default AnalysisTabsContent;
