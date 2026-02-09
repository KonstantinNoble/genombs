import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import type { AudienceChannel } from "@/lib/demo-data";

interface AudienceChannelCardProps {
  channels: AudienceChannel[];
}

const categoryLabels: Record<string, string> = {
  social: "Social",
  community: "Community",
  search: "Search",
  content: "Content",
  paid: "Paid",
};

const AudienceChannelCard = ({ channels }: AudienceChannelCardProps) => {
  const sorted = [...channels].sort((a, b) => b.relevance - a.relevance);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (platform: string) => {
    setOpenItems((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <div className="space-y-3">
      {sorted.map((ch) => (
        <Collapsible
          key={ch.platform}
          open={openItems[ch.platform] || false}
          onOpenChange={() => toggle(ch.platform)}
        >
          <div className="border border-border rounded-lg p-4 bg-card">
            <CollapsibleTrigger className="w-full text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{ch.platform}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {categoryLabels[ch.category] || ch.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-primary">{ch.relevance}%</span>
                    <span className="text-[10px] text-muted-foreground">
                      {openItems[ch.platform] ? "▲" : "▼"}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${ch.relevance}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">{ch.tip}</p>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                {/* Specific Links */}
                {ch.specificLinks.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                      Communities & Links
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ch.specificLinks.map((link) => (
                        <Badge
                          key={link}
                          variant="secondary"
                          className="text-xs font-mono font-normal"
                        >
                          {link}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {ch.recommendedKeywords.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
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

                {/* Best Formats */}
                {ch.bestFormats.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
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

                {/* Posting Frequency */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                    Recommended Frequency
                  </p>
                  <p className="text-sm text-foreground">{ch.postingFrequency}</p>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
};

export default AudienceChannelCard;
