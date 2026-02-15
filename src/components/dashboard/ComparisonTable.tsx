import { Card, CardContent } from "@/components/ui/card";
import type { WebsiteProfile } from "@/types/chat";

interface ComparisonTableProps {
  profiles: WebsiteProfile[];
}

const categories = [
  { key: "findability" as const, label: "Findability" },
  { key: "mobileUsability" as const, label: "Mobile Usability" },
  { key: "offerClarity" as const, label: "Offer Clarity" },
  { key: "trustProof" as const, label: "Trust & Proof" },
  { key: "conversionReadiness" as const, label: "Conversion Readiness" },
];

const ComparisonTable = ({ profiles }: ComparisonTableProps) => {
  if (profiles.length < 2) return null;

  const ownSite = profiles.find((p) => p.is_own_website);
  const competitors = profiles.filter((p) => !p.is_own_website);

  if (!ownSite || competitors.length === 0 || !ownSite.category_scores || !ownSite.profile_data) return null;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            {ownSite.profile_data.name}
          </span>
          {competitors.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-chart-4" />
              {c.profile_data?.name ?? c.url}
            </span>
          ))}
        </div>

        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto] gap-2 text-xs uppercase tracking-wider text-muted-foreground/60 px-1">
          <span>Category</span>
          <span className="w-7 text-right">Score</span>
        </div>

        <div className="space-y-4">
          {categories.map((cat, i) => {
            const ownScore = ownSite.category_scores?.[cat.key] ?? 0;
            return (
              <div
                key={cat.key}
                className={`space-y-1.5 rounded-lg p-2 -mx-2 ${i % 2 === 0 ? "bg-secondary/30" : ""}`}
              >
                <span className="text-sm font-semibold text-muted-foreground">{cat.label}</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                      style={{ width: `${ownScore}%` }}
                    />
                  </div>
                   <span className="text-sm font-bold text-foreground w-8 text-right">
                     {ownScore}
                   </span>
                </div>
                {competitors.map((comp) => {
                  const compScore = comp.category_scores?.[cat.key] ?? 0;
                  return (
                    <div key={comp.id} className="flex items-center gap-2">
                      <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-chart-4 transition-all duration-1000 ease-out"
                          style={{ width: `${compScore}%` }}
                        />
                      </div>
                       <span className="text-sm text-muted-foreground w-8 text-right">
                         {compScore}
                       </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;
