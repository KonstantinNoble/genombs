import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-4">
      {sorted.map((ch) => (
        <div key={ch.platform} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{ch.platform}</span>
              <Badge variant="outline" className="text-[10px]">
                {categoryLabels[ch.category] || ch.category}
              </Badge>
            </div>
            <span className="text-sm font-mono text-primary">{ch.relevance}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${ch.relevance}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground italic leading-relaxed">{ch.tip}</p>
        </div>
      ))}
    </div>
  );
};

export default AudienceChannelCard;
