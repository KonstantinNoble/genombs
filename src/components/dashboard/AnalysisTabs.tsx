import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WebsiteProfile } from "@/types/chat";

interface AnalysisTabsContentProps {
  tab: string;
  profiles: WebsiteProfile[];
}

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
            <Card key={profile.id} className="border-border bg-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">{profile.profile_data.name}</h4>
                  <Badge variant={profile.is_own_website ? "default" : "outline"} className="text-[10px]">
                    {profile.is_own_website ? "Your Site" : "Competitor"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Target Audience</p>
                    <p className="text-xs text-foreground">{profile.profile_data.targetAudience}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Unique Selling Proposition</p>
                    <p className="text-xs text-foreground">{profile.profile_data.usp}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Site Structure</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.profile_data.siteStructure.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
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
            <Card key={profile.id} className="border-border bg-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">{profile.profile_data.name}</h4>
                  <Badge variant={profile.is_own_website ? "default" : "outline"} className="text-[10px]">
                    {profile.is_own_website ? "Your Site" : "Competitor"}
                  </Badge>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Call-to-Actions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.profile_data.ctas.map((cta) => (
                      <Badge key={cta} variant="outline" className="text-[10px] border-primary/30 text-primary">
                        {cta}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Value Proposition</p>
                  <p className="text-xs text-foreground">{profile.profile_data.usp}</p>
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
            <Card key={profile.id} className="border-border bg-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">{profile.profile_data.name}</h4>
                  <Badge variant={profile.is_own_website ? "default" : "outline"} className="text-[10px]">
                    {profile.is_own_website ? "Your Site" : "Competitor"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Trust & Proof Score</span>
                    <span className="text-sm font-bold text-foreground">{trustScore}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${trustScore >= 80 ? "bg-chart-6" : trustScore >= 60 ? "bg-primary" : "bg-destructive"}`}
                      style={{ width: `${trustScore}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Strengths</p>
                    <div className="space-y-1">
                      {profile.profile_data.strengths.slice(0, 5).map((s) => (
                        <div key={s} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-chart-6 shrink-0" />
                          <span className="text-[11px] text-foreground">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Weaknesses</p>
                    <div className="space-y-1">
                      {profile.profile_data.weaknesses.slice(0, 5).map((w) => (
                        <div key={w} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                          <span className="text-[11px] text-foreground">{w}</span>
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
