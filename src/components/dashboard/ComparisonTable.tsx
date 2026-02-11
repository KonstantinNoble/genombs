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
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            {ownSite.profile_data.name}
          </span>
          {competitors.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/40" />
              {c.profile_data?.name ?? c.url}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.key} className="space-y-1.5">
              <span className="text-[11px] text-muted-foreground">{cat.label}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${ownSite.category_scores![cat.key]}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-7 text-right">
                  {ownSite.category_scores![cat.key]}
                </span>
              </div>
              {competitors.map((comp) => (
                <div key={comp.id} className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-muted-foreground/40 transition-all duration-700"
                      style={{ width: `${comp.category_scores?.[cat.key] ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-7 text-right">
                    {comp.category_scores?.[cat.key] ?? 0}
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
