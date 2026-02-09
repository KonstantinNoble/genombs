import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OrganicStrategy, PaidStrategy } from "@/lib/demo-data";

interface GrowthStrategySectionProps {
  type: "organic" | "paid";
  organicStrategy?: OrganicStrategy;
  paidStrategy?: PaidStrategy;
}

const budgetColors = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  high: "bg-primary/15 text-primary border-primary/30",
};

const difficultyColors = {
  low: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

const opportunityColors = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  high: "bg-primary/15 text-primary border-primary/30",
};

const GrowthStrategySection = ({ type, organicStrategy, paidStrategy }: GrowthStrategySectionProps) => {
  if (type === "organic" && organicStrategy) {
    // Build compact channel strategy rows from content, social, community
    const channelRows = [
      ...organicStrategy.content.formats.slice(0, 2).map((f) => ({
        channel: "Content",
        format: f,
        frequency: organicStrategy.content.frequency.split(". ").pop() || organicStrategy.content.frequency,
        focus: organicStrategy.content.topics[0] || "",
      })),
      ...organicStrategy.social.platforms.map((p, i) => ({
        channel: p,
        format: organicStrategy.social.contentTypes[i] || organicStrategy.social.contentTypes[0],
        frequency: organicStrategy.social.cadence,
        focus: organicStrategy.social.contentTypes.slice(0, 2).join(", "),
      })),
      {
        channel: "Community",
        format: organicStrategy.community.channels.join(", "),
        frequency: "Ongoing",
        focus: organicStrategy.community.approach.split(". ")[0],
      },
    ];

    return (
      <div className="space-y-5">
        {/* SEO with Keyword Table */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">SEO</h4>
              <span className="text-sm font-mono text-primary">{organicStrategy.seo.score}/100</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {organicStrategy.seo.recommendation}
            </p>

            {/* Keyword Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground">Keyword</th>
                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground">Volume</th>
                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground">Difficulty</th>
                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground">Opportunity</th>
                  </tr>
                </thead>
                <tbody>
                  {organicStrategy.seo.keywords.map((kw) => (
                    <tr key={kw.keyword} className="border-b border-border/50">
                      <td className="py-2 px-3 text-sm font-mono text-foreground">{kw.keyword}</td>
                      <td className="py-2 px-3 text-sm font-mono text-muted-foreground">{kw.volume}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className={`text-[10px] ${difficultyColors[kw.difficulty]}`}>
                          {kw.difficulty}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className={`text-[10px] ${opportunityColors[kw.opportunity]}`}>
                          {kw.opportunity}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Content, Social & Community — Compact Table */}
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="px-5 py-3 border-b border-border">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Content, Social & Community
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Channel</th>
                    <th className="text-left py-2 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Format</th>
                    <th className="text-left py-2 px-4 text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Frequency</th>
                    <th className="text-left py-2 px-4 text-[10px] uppercase tracking-wider text-muted-foreground hidden md:table-cell">Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {channelRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 px-4 text-sm font-medium text-foreground whitespace-nowrap">{row.channel}</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">{row.format}</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground hidden sm:table-cell">{row.frequency}</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground hidden md:table-cell">{row.focus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (type === "paid" && paidStrategy) {
    return (
      <div className="space-y-5">
        {/* Summary */}
        <div className="flex items-center gap-4 mb-2">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Competition Level</p>
            <Badge variant="outline" className={`mt-1 ${budgetColors[paidStrategy.competitionLevel]}`}>
              {paidStrategy.competitionLevel}
            </Badge>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Estimated CPC</p>
            <p className="text-sm font-mono text-foreground mt-1">{paidStrategy.estimatedCPC}</p>
          </div>
        </div>

        {/* Channels Table */}
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Channel</th>
                    <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Budget</th>
                    <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Format</th>
                    <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Targeting</th>
                  </tr>
                </thead>
                <tbody>
                  {paidStrategy.recommendedChannels.map((ch) => (
                    <tr key={ch.channel} className="border-b border-border/50">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{ch.channel}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-[10px] ${budgetColors[ch.budgetLevel]}`}>
                          {ch.budgetLevel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{ch.format}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{ch.targetingTip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default GrowthStrategySection;
