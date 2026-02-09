import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import PremiumLock from "@/components/genome/PremiumLock";
import type { AudienceChannel, SEOKeyword } from "@/lib/demo-data";

interface AudienceChannelCardProps {
  channels: AudienceChannel[];
  seoKeywords?: SEOKeyword[];
  seoScore?: number;
  seoRecommendation?: string;
  paidCompetitionLevel?: "low" | "medium" | "high";
  estimatedCPC?: string;
  isPremium?: boolean;
}

const categoryLabels: Record<string, string> = {
  social: "Social",
  community: "Community",
  search: "Search",
  content: "Content",
  paid: "Paid",
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

const budgetColors = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  high: "bg-primary/15 text-primary border-primary/30",
};

const toLinkUrl = (link: string): string | null => {
  if (link.startsWith("http://") || link.startsWith("https://")) return link;
  const subredditMatch = link.match(/^r\/(\w+)/);
  if (subredditMatch) return `https://reddit.com/r/${subredditMatch[1]}`;
  if (/^[\w-]+\.\w{2,}/.test(link.split(" ")[0])) return `https://${link.split(" ")[0]}`;
  if (link.startsWith("@") && !link.includes(" ")) return `https://x.com/${link.slice(1)}`;
  return null;
};

const LinkOrBadge = ({ link }: { link: string }) => {
  const url = toLinkUrl(link);
  const displayText = link.replace(/\s*\(.*?\)\s*$/, "").trim();

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-mono font-normal text-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors"
      >
        {displayText}
      </a>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs font-mono font-normal">
      {link}
    </Badge>
  );
};

const AudienceChannelCard = ({ channels, seoKeywords, seoScore, seoRecommendation, paidCompetitionLevel, estimatedCPC, isPremium = false }: AudienceChannelCardProps) => {
  const sorted = [...channels].sort((a, b) => b.relevance - a.relevance);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (platform: string) => {
    setOpenItems((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <div className="space-y-5">
      {/* Premium: SEO Keyword Opportunities */}
      {seoKeywords && seoKeywords.length > 0 && (
        isPremium ? (
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-foreground uppercase tracking-wide">SEO Keyword Opportunities</h4>
                {seoScore !== undefined && (
                  <span className="text-sm font-mono text-primary">{seoScore}/100</span>
                )}
              </div>
              {seoRecommendation && (
                <p className="text-base text-foreground/70 leading-relaxed mb-4">{seoRecommendation}</p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                       <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Keyword</th>
                       <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Volume</th>
                       <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Difficulty</th>
                       <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoKeywords.map((kw) => (
                      <tr key={kw.keyword} className="border-b border-border/50">
                         <td className="py-2 px-3 text-base font-mono text-foreground">{kw.keyword}</td>
                         <td className="py-2 px-3 text-base font-mono text-foreground/70">{kw.volume}</td>
                        <td className="py-2 px-3">
                           <Badge variant="outline" className={`text-xs ${difficultyColors[kw.difficulty]}`}>
                            {kw.difficulty}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                           <Badge variant="outline" className={`text-xs ${opportunityColors[kw.opportunity]}`}>
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
        ) : (
          <PremiumLock title="Unlock SEO Keyword Opportunities">
            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-foreground uppercase tracking-wide">SEO Keyword Opportunities</h4>
                  {seoScore !== undefined && (
                    <span className="text-sm font-mono text-primary">{seoScore}/100</span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                         <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Keyword</th>
                         <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Volume</th>
                         <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Difficulty</th>
                         <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Opportunity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seoKeywords.slice(0, 3).map((kw) => (
                        <tr key={kw.keyword} className="border-b border-border/50">
                           <td className="py-2 px-3 text-base font-mono text-foreground">{kw.keyword}</td>
                           <td className="py-2 px-3 text-base font-mono text-foreground/70">{kw.volume}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className={`text-xs ${difficultyColors[kw.difficulty]}`}>
                              {kw.difficulty}
                            </Badge>
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className={`text-xs ${opportunityColors[kw.opportunity]}`}>
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
          </PremiumLock>
        )
      )}

      {/* Premium: Paid Advertising Info Bar */}
      {paidCompetitionLevel && estimatedCPC && (
        isPremium ? (
          <div className="flex items-center gap-6 px-1">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Paid Competition</p>
              <Badge variant="outline" className={`mt-1 ${budgetColors[paidCompetitionLevel]}`}>
                {paidCompetitionLevel}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Estimated CPC</p>
              <p className="text-base font-mono text-foreground mt-1">{estimatedCPC}</p>
            </div>
          </div>
        ) : (
          <PremiumLock title="Unlock Paid Channel Data">
            <div className="flex items-center gap-6 px-1">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Paid Competition</p>
                <Badge variant="outline" className={`mt-1 ${budgetColors[paidCompetitionLevel]}`}>
                  {paidCompetitionLevel}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Estimated CPC</p>
                <p className="text-base font-mono text-foreground mt-1">{estimatedCPC}</p>
              </div>
            </div>
          </PremiumLock>
        )
      )}

      {/* Channel List */}
      <div className="space-y-3">
        {sorted.map((ch) => {
          const isOpen = openItems[ch.platform] || false;
          return (
            <Collapsible
              key={ch.platform}
              open={isOpen}
              onOpenChange={() => toggle(ch.platform)}
            >
              <div className="border border-border rounded-lg p-4 bg-card">
                <CollapsibleTrigger className="w-full text-left">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-foreground">{ch.platform}</span>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[ch.category] || ch.category}
                        </Badge>
                        {ch.budgetLevel && (
                          <Badge variant="outline" className={`text-xs ${budgetColors[ch.budgetLevel]}`}>
                            {ch.budgetLevel} budget
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-mono text-primary">{ch.relevance}%</span>
                        <span className="text-xs text-muted-foreground">
                          {isOpen ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${ch.relevance}%` }}
                      />
                    </div>
                    <p className="text-sm text-foreground/70 italic leading-relaxed">{ch.tip}</p>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  {isPremium ? (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {ch.specificLinks.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Communities & Links
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {ch.specificLinks.map((link) => (
                              <LinkOrBadge key={link} link={link} />
                            ))}
                          </div>
                        </div>
                      )}

                      {ch.recommendedKeywords.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Recommended Keywords
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {ch.recommendedKeywords.map((kw) => (
                              <Badge
                                key={kw}
                                variant="outline"
                                className="text-xs font-mono font-normal bg-primary/5 text-primary border-primary/20"
                              >
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {ch.bestFormats.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Best Content Formats
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {ch.bestFormats.map((f) => (
                              <Badge key={f} variant="outline" className="text-xs font-normal">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Recommended Frequency
                        </p>
                        <p className="text-base text-foreground">{ch.postingFrequency}</p>
                      </div>

                      {ch.estimatedCPC && (
                        <p className="text-sm font-mono text-foreground/70">CPC: {ch.estimatedCPC}</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-border">
                      <PremiumLock title="Unlock Links, Keywords & Formats">
                        <div className="space-y-4">
                          {ch.specificLinks.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                                Communities & Links
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {ch.specificLinks.map((link) => (
                                  <LinkOrBadge key={link} link={link} />
                                ))}
                              </div>
                            </div>
                          )}
                          {ch.recommendedKeywords.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                                Recommended Keywords
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {ch.recommendedKeywords.map((kw) => (
                                  <Badge key={kw} variant="outline" className="text-xs font-mono font-normal bg-primary/5 text-primary border-primary/20">
                                    {kw}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Frequency</p>
                            <p className="text-base text-foreground">{ch.postingFrequency}</p>
                          </div>
                        </div>
                      </PremiumLock>
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default AudienceChannelCard;
