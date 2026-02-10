import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { WebsiteProfile } from "@/lib/mock-chat-data";

interface WebsiteProfileCardProps {
  profile: WebsiteProfile;
  compact?: boolean;
}

const WebsiteProfileCard = ({ profile, compact }: WebsiteProfileCardProps) => {
  const { profileData, url, isOwnWebsite } = profile;

  if (compact) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full shrink-0 bg-primary" style={{ opacity: isOwnWebsite ? 1 : 0.4 }} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{profileData.name}</p>
            <p className="text-xs text-muted-foreground truncate">{url}</p>
          </div>
          <Badge variant={isOwnWebsite ? "default" : "outline"} className="text-[10px] shrink-0">
            {isOwnWebsite ? "Eigene" : "Konkurrenz"}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border bg-card ${isOwnWebsite ? "ring-1 ring-primary/30" : ""}`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground">{profileData.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{url}</p>
          </div>
          <Badge variant={isOwnWebsite ? "default" : "outline"} className="text-xs shrink-0">
            {isOwnWebsite ? "Eigene" : "Konkurrenz"}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Zielgruppe</p>
            <p className="text-foreground">{profileData.targetAudience}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">USP</p>
            <p className="text-foreground">{profileData.usp}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {profileData.ctas.map((cta) => (
            <Badge key={cta} variant="secondary" className="text-[10px]">
              {cta}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Stärken</p>
            <ul className="space-y-0.5">
              {profileData.strengths.slice(0, 3).map((s) => (
                <li key={s} className="text-xs text-foreground flex items-start gap-1">
                  <span className="text-primary mt-0.5">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Schwächen</p>
            <ul className="space-y-0.5">
              {profileData.weaknesses.slice(0, 3).map((w) => (
                <li key={w} className="text-xs text-foreground flex items-start gap-1">
                  <span className="text-destructive mt-0.5">−</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebsiteProfileCard;
