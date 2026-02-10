import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WebsiteProfile } from "@/lib/mock-chat-data";

interface AnalysisTabsContentProps {
  tab: string;
  profiles: WebsiteProfile[];
}

const AnalysisTabsContent = ({ tab, profiles }: AnalysisTabsContentProps) => {
  const ownSite = profiles.find((p) => p.isOwnWebsite);
  const competitors = profiles.filter((p) => !p.isOwnWebsite);

  if (!ownSite) return null;

  if (tab === "positioning") {
    return (
      <div className="space-y-3">
        {[ownSite, ...competitors].map((profile) => (
          <Card key={profile.id} className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{profile.profileData.name}</h4>
                <Badge variant={profile.isOwnWebsite ? "default" : "outline"} className="text-[10px]">
                  {profile.isOwnWebsite ? "Your Site" : "Competitor"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Target Audience</p>
                  <p className="text-xs text-foreground">{profile.profileData.targetAudience}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Unique Selling Proposition</p>
                  <p className="text-xs text-foreground">{profile.profileData.usp}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Site Structure</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.profileData.siteStructure.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tab === "offers") {
    return (
      <div className="space-y-3">
        {[ownSite, ...competitors].map((profile) => (
          <Card key={profile.id} className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{profile.profileData.name}</h4>
                <Badge variant={profile.isOwnWebsite ? "default" : "outline"} className="text-[10px]">
                  {profile.isOwnWebsite ? "Your Site" : "Competitor"}
                </Badge>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Call-to-Actions</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.profileData.ctas.map((cta) => (
                    <Badge key={cta} variant="outline" className="text-[10px] border-primary/30 text-primary">
                      {cta}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-0.5">Value Proposition</p>
                <p className="text-xs text-foreground">{profile.profileData.usp}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tab === "trust") {
    return (
      <div className="space-y-3">
        {[ownSite, ...competitors].map((profile) => (
          <Card key={profile.id} className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{profile.profileData.name}</h4>
                <Badge variant={profile.isOwnWebsite ? "default" : "outline"} className="text-[10px]">
                  {profile.isOwnWebsite ? "Your Site" : "Competitor"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Trust Signals</p>
                  <div className="space-y-1">
                    {profile.profileData.strengths
                      .filter((s) => /trust|review|certif|proof|guarantee/i.test(s))
                      .map((s) => (
                        <div key={s} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-chart-6 shrink-0" />
                          <span className="text-[11px] text-foreground">{s}</span>
                        </div>
                      ))}
                    {profile.profileData.strengths.filter((s) => /trust|review|certif|proof|guarantee/i.test(s)).length === 0 && (
                      <span className="text-[11px] text-muted-foreground">No specific trust signals found</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Trust Gaps</p>
                  <div className="space-y-1">
                    {profile.profileData.weaknesses
                      .filter((w) => /trust|review|certif|proof|unprofessional/i.test(w))
                      .map((w) => (
                        <div key={w} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                          <span className="text-[11px] text-foreground">{w}</span>
                        </div>
                      ))}
                    {profile.profileData.weaknesses.filter((w) => /trust|review|certif|proof|unprofessional/i.test(w)).length === 0 && (
                      <span className="text-[11px] text-muted-foreground">No trust gaps identified</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return null;
};

export default AnalysisTabsContent;
