import { Badge } from "@/components/ui/badge";
import type { ChannelStrength } from "@/lib/demo-data";

interface ChannelStrengthBarProps {
  channels: ChannelStrength[];
}

const strengthConfig = {
  high: { width: "w-full", color: "bg-primary" },
  medium: { width: "w-2/3", color: "bg-chart-3" },
  low: { width: "w-1/3", color: "bg-muted-foreground/50" },
};

const ChannelStrengthBar = ({ channels }: ChannelStrengthBarProps) => {
  return (
    <div className="space-y-3">
      {channels.map((ch) => {
        const config = strengthConfig[ch.strength];
        return (
          <div key={ch.channel} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{ch.channel}</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    ch.priority === "primary"
                      ? "bg-primary/15 text-primary border-primary/30 text-[10px]"
                      : "text-[10px]"
                  }
                >
                  {ch.priority}
                </Badge>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${config.color} transition-all duration-500`}
                style={{ width: ch.strength === "high" ? "100%" : ch.strength === "medium" ? "66%" : "33%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChannelStrengthBar;
