import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Globe, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Competitor } from "@/lib/demo-data";

interface CompetitorPreviewProps {
  competitors: Competitor[];
  isPremium?: boolean;
}

const CompetitorPreview = ({ competitors, isPremium = false }: CompetitorPreviewProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-border bg-card relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Market Landscape</h3>
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
          {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {competitors.length} major players detected in this market segment based on audience overlap and positioning.
        </p>
        <div className="space-y-3">
          {competitors.map((comp) => (
            <div
              key={comp.domain}
              className={`flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border ${!isPremium ? "blur-[3px]" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{comp.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{comp.domain}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {comp.similarity}% overlap
              </Badge>
            </div>
          ))}
        </div>
        {!isPremium && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/pricing")}
              className="gap-1"
            >
              Upgrade to unlock market landscape
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompetitorPreview;
