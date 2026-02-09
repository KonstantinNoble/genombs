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

/** Try to turn a link string into a clickable URL */
const toLinkUrl = (link: string): string | null => {
  // Already a URL
  if (link.startsWith("http://") || link.startsWith("https://")) return link;
  // Subreddit pattern
  const subredditMatch = link.match(/^r\/(\w+)/);
  if (subredditMatch) return `https://reddit.com/r/${subredditMatch[1]}`;
  // Domain-like patterns (e.g. "github.com/stripe")
  if (/^[\w-]+\.\w{2,}/.test(link.split(" ")[0])) return `https://${link.split(" ")[0]}`;
  // @handle patterns for Twitter
  if (link.startsWith("@") && !link.includes(" ")) return `https://x.com/${link.slice(1)}`;
  return null;
};

const LinkOrBadge = ({ link }: { link: string }) => {
  const url = toLinkUrl(link);
  // Strip parenthetical descriptions for display
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

const AudienceChannelCard = ({ channels }: AudienceChannelCardProps) => {
  const sorted = [...channels].sort((a, b) => b.relevance - a.relevance);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (platform: string) => {
    setOpenItems((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
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
                      <span className="text-sm font-medium text-foreground">{ch.platform}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {categoryLabels[ch.category] || ch.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-primary">{ch.relevance}%</span>
                      <span className="text-[10px] text-muted-foreground">
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
                  <p className="text-xs text-muted-foreground italic leading-relaxed">{ch.tip}</p>

                  {/* Preview when collapsed: show top links + keywords */}
                  {!isOpen && (ch.specificLinks.length > 0 || ch.recommendedKeywords.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ch.specificLinks.slice(0, 2).map((link) => (
                        <LinkOrBadge key={link} link={link} />
                      ))}
                      {ch.recommendedKeywords.slice(0, 2).map((kw) => (
                        <Badge
                          key={kw}
                          variant="outline"
                          className="text-[10px] font-mono font-normal bg-primary/5 text-primary border-primary/20"
                        >
                          {kw}
                        </Badge>
                      ))}
                      <span className="text-[10px] text-muted-foreground self-center">
                        + more ▼
                      </span>
                    </div>
                  )}
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
                          <LinkOrBadge key={link} link={link} />
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
        );
      })}
    </div>
  );
};

export default AudienceChannelCard;
