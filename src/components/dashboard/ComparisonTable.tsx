import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WebsiteProfile } from "@/lib/mock-chat-data";

interface ComparisonTableProps {
  profiles: WebsiteProfile[];
}

const criteria = ["Zielgruppe", "USP", "CTAs", "Stärken", "Schwächen"] as const;

const getCriterionValue = (profile: WebsiteProfile, criterion: typeof criteria[number]): string => {
  const d = profile.profileData;
  switch (criterion) {
    case "Zielgruppe": return d.targetAudience;
    case "USP": return d.usp;
    case "CTAs": return d.ctas.join(", ");
    case "Stärken": return d.strengths.join(" · ");
    case "Schwächen": return d.weaknesses.join(" · ");
  }
};

const ComparisonTable = ({ profiles }: ComparisonTableProps) => {
  if (profiles.length === 0) return null;

  return (
    <Card className="border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground w-28">Kriterium</th>
              {profiles.map((p) => (
                <th key={p.id} className="text-left py-3 px-4 text-xs font-medium min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className={p.isOwnWebsite ? "text-primary" : "text-foreground"}>
                      {p.profileData.name}
                    </span>
                    {p.isOwnWebsite && (
                      <Badge variant="default" className="text-[9px] px-1.5 py-0">Eigene</Badge>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion) => (
              <tr key={criterion} className="border-b border-border/50">
                <td className="py-3 px-4 text-xs font-medium text-muted-foreground align-top">
                  {criterion}
                </td>
                {profiles.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-xs text-foreground align-top leading-relaxed">
                    {getCriterionValue(p, criterion)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ComparisonTable;
