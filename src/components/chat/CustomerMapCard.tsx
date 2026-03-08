import { useState } from "react";
import { Copy, Check, ExternalLink, Users, Target, TrendingUp, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Community {
  platform: string;
  name: string;
  url: string;
  relevance: string;
  audience_size: string;
  engagement_tip: string;
}

interface ICP {
  demographics: {
    age_range?: string;
    roles?: string[];
    industries?: string[];
    company_size?: string;
  };
  pain_points?: string[];
  buying_motivations?: string[];
  online_behavior?: string;
  decision_process?: string;
}

interface CustomerMapCardProps {
  url: string;
  productSummary: string;
  icp: ICP;
  communities: Community[];
}

const PLATFORM_COLORS: Record<string, string> = {
  Reddit: "bg-chart-3/20 text-chart-3",
  YouTube: "bg-destructive/20 text-destructive",
  LinkedIn: "bg-chart-7/20 text-chart-7",
  X: "bg-foreground/20 text-foreground",
  Facebook: "bg-chart-7/20 text-chart-7",
  Discord: "bg-chart-5/20 text-chart-5",
  TikTok: "bg-primary/20 text-primary",
  Quora: "bg-chart-4/20 text-chart-4",
  Forum: "bg-muted-foreground/20 text-muted-foreground",
  Other: "bg-muted-foreground/20 text-muted-foreground",
};

const CustomerMapCard = ({ url, productSummary, icp, communities }: CustomerMapCardProps) => {
  const [copied, setCopied] = useState(false);
  const [expandedCommunity, setExpandedCommunity] = useState<number | null>(null);

  const copyAll = () => {
    const text = `Customer Map for ${url}\n\n${productSummary}\n\nICP:\n${JSON.stringify(icp, null, 2)}\n\nCommunities:\n${communities.map(c => `- ${c.name} (${c.platform}): ${c.url}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Customer map copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const highRelevance = communities.filter(c => c.relevance === "high");
  const mediumRelevance = communities.filter(c => c.relevance !== "high");

  return (
    <Card className="border-primary/20 bg-card/80 overflow-hidden">
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Customer Map</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={copyAll}>
            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? "Copied" : "Copy All"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{url}</p>
      </div>

      {/* Product Summary */}
      <div className="p-4 border-b border-border/60">
        <p className="text-sm text-foreground/90">{productSummary}</p>
      </div>

      {/* ICP Section */}
      <div className="p-4 border-b border-border/60 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-chart-5" />
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Ideal Customer Profile</h4>
        </div>

        {icp.demographics && (
          <div className="grid grid-cols-2 gap-2">
            {icp.demographics.age_range && (
              <div className="rounded-md bg-muted/50 p-2">
                <span className="text-[10px] text-muted-foreground uppercase">Age</span>
                <p className="text-xs text-foreground">{icp.demographics.age_range}</p>
              </div>
            )}
            {icp.demographics.roles && (
              <div className="rounded-md bg-muted/50 p-2">
                <span className="text-[10px] text-muted-foreground uppercase">Roles</span>
                <p className="text-xs text-foreground">{icp.demographics.roles.join(", ")}</p>
              </div>
            )}
            {icp.demographics.industries && (
              <div className="rounded-md bg-muted/50 p-2">
                <span className="text-[10px] text-muted-foreground uppercase">Industries</span>
                <p className="text-xs text-foreground">{icp.demographics.industries.join(", ")}</p>
              </div>
            )}
            {icp.demographics.company_size && (
              <div className="rounded-md bg-muted/50 p-2">
                <span className="text-[10px] text-muted-foreground uppercase">Company Size</span>
                <p className="text-xs text-foreground">{icp.demographics.company_size}</p>
              </div>
            )}
          </div>
        )}

        {icp.pain_points && icp.pain_points.length > 0 && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Pain Points</span>
            <ul className="mt-1 space-y-1">
              {icp.pain_points.map((p, i) => (
                <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                  <span className="text-destructive mt-0.5">•</span> {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {icp.buying_motivations && icp.buying_motivations.length > 0 && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Buying Motivations</span>
            <ul className="mt-1 space-y-1">
              {icp.buying_motivations.map((m, i) => (
                <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                  <TrendingUp className="w-3 h-3 text-chart-5 mt-0.5 shrink-0" /> {m}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Communities Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Communities ({communities.length})
          </h4>
        </div>

        {highRelevance.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] text-chart-5 uppercase font-semibold">High Relevance</span>
            {highRelevance.map((c, i) => (
              <CommunityItem
                key={i}
                community={c}
                expanded={expandedCommunity === i}
                onToggle={() => setExpandedCommunity(expandedCommunity === i ? null : i)}
              />
            ))}
          </div>
        )}

        {mediumRelevance.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Medium Relevance</span>
            {mediumRelevance.map((c, i) => (
              <CommunityItem
                key={i + highRelevance.length}
                community={c}
                expanded={expandedCommunity === i + highRelevance.length}
                onToggle={() => setExpandedCommunity(expandedCommunity === i + highRelevance.length ? null : i + highRelevance.length)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

function CommunityItem({ community, expanded, onToggle }: { community: Community; expanded: boolean; onToggle: () => void }) {
  const colorClass = PLATFORM_COLORS[community.platform] || PLATFORM_COLORS.Other;

  return (
    <div
      className="rounded-lg border border-border/60 bg-muted/30 cursor-pointer transition-colors hover:bg-muted/50"
      onClick={onToggle}
    >
      <div className="p-2.5 flex items-center gap-2">
        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 shrink-0 ${colorClass} border-0`}>
          {community.platform}
        </Badge>
        <span className="text-xs text-foreground font-medium truncate flex-1">{community.name}</span>
        {community.url && (
          <a
            href={community.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
          </a>
        )}
      </div>
      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-1.5 border-t border-border/40 pt-2">
          {community.audience_size && (
            <p className="text-[11px] text-muted-foreground">
              <span className="font-medium">Size:</span> {community.audience_size}
            </p>
          )}
          {community.engagement_tip && (
            <p className="text-[11px] text-foreground/70">
              <span className="font-medium text-primary">💡 Tip:</span> {community.engagement_tip}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerMapCard;
