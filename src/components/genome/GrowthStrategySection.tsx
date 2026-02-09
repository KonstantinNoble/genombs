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

        {/* Content */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Content Strategy</h4>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Formats</p>
                <div className="flex flex-wrap gap-1.5">
                  {organicStrategy.content.formats.map((f) => (
                    <Badge key={f} variant="outline" className="text-xs font-normal">{f}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Topics</p>
                <ul className="space-y-1">
                  {organicStrategy.content.topics.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground italic">{organicStrategy.content.frequency}</p>
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Social Media</h4>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {organicStrategy.social.platforms.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs font-normal">{p}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {organicStrategy.social.contentTypes.map((ct) => (
                  <Badge key={ct} variant="outline" className="text-xs font-normal">{ct}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">{organicStrategy.social.cadence}</p>
            </div>
          </CardContent>
        </Card>

        {/* Community */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Community</h4>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {organicStrategy.community.channels.map((ch) => (
                <Badge key={ch} variant="secondary" className="text-xs font-normal">{ch}</Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{organicStrategy.community.approach}</p>
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
