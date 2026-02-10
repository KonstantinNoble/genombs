import { Card, CardContent } from "@/components/ui/card";
import type { WebsiteProfile } from "@/lib/mock-chat-data";

interface ComparisonTableProps {
  profiles: WebsiteProfile[];
}

const categories = [
  { key: "seo" as const, label: "SEO" },
  { key: "ux" as const, label: "UX" },
  { key: "content" as const, label: "Content" },
  { key: "trust" as const, label: "Trust" },
  { key: "speed" as const, label: "Speed" },
];

const ComparisonTable = ({ profiles }: ComparisonTableProps) => {
  if (profiles.length < 2) return null;

  const ownSite = profiles.find((p) => p.isOwnWebsite);
  const competitors = profiles.filter((p) => !p.isOwnWebsite);

  if (!ownSite || competitors.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            {ownSite.profileData.name}
          </span>
          {competitors.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/40" />
              {c.profileData.name}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.key} className="space-y-1.5">
              <span className="text-[11px] text-muted-foreground">{cat.label}</span>
              {/* Own site bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${ownSite.categoryScores[cat.key]}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-7 text-right">
                  {ownSite.categoryScores[cat.key]}
                </span>
              </div>
              {/* Competitor bars */}
              {competitors.map((comp) => (
                <div key={comp.id} className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-muted-foreground/40 transition-all duration-700"
                      style={{ width: `${comp.categoryScores[cat.key]}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-7 text-right">
                    {comp.categoryScores[cat.key]}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;
