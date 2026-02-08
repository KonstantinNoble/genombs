import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Globe, Loader2, AlertCircle, RotateCcw, Trash2, Eye } from "lucide-react";

interface ScanCardProps {
  id: string;
  domain: string;
  companyName: string;
  marketSegment: string;
  businessModel?: string;
  genomeScore?: number;
  sectionsCompleted?: number;
  totalSections?: number;
  status: "completed" | "analyzing" | "pending" | "failed";
  createdAt: string;
}

const statusConfig = {
  completed: { label: "Completed", className: "bg-primary/15 text-primary border-primary/30" },
  analyzing: { label: "Analyzing", className: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  pending: { label: "Pending", className: "bg-muted text-muted-foreground border-border" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const ScanCard = ({
  id,
  domain,
  companyName,
  marketSegment,
  businessModel,
  genomeScore,
  sectionsCompleted = 0,
  totalSections = 9,
  status,
  createdAt,
}: ScanCardProps) => {
  const config = statusConfig[status];
  const date = new Date(createdAt).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const completionPercent = (sectionsCompleted / totalSections) * 100;

  const content = (
    <Card className="border-border bg-card group transition-all duration-300 hover:border-primary/25 hover:shadow-lg cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-mono text-muted-foreground">{domain}</span>
          </div>
          <Badge variant="outline" className={config.className}>
            {status === "analyzing" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {status === "failed" && <AlertCircle className="w-3 h-3 mr-1" />}
            {config.label}
          </Badge>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1">{companyName}</h3>
        <p className="text-sm text-muted-foreground mb-3">{marketSegment}</p>

        {/* Business Model & Score Tags */}
        {(businessModel || genomeScore) && (
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {businessModel && (
              <Badge variant="secondary" className="text-xs font-normal">
                {businessModel}
              </Badge>
            )}
            {genomeScore && status === "completed" && (
              <Badge variant="outline" className="text-xs font-normal text-primary border-primary/30">
                Score: {genomeScore}/100
              </Badge>
            )}
          </div>
        )}

        {/* Intelligence Depth */}
        {status === "completed" && (
          <div className="mb-3 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{sectionsCompleted}/{totalSections} sections researched</span>
              <span className="font-mono">{Math.round(completionPercent)}%</span>
            </div>
            <Progress value={completionPercent} className="h-1" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{date}</span>

          {/* Quick Actions on Hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {status === "completed" && (
              <>
                <span className="text-xs text-primary flex items-center gap-1">
                  <Eye className="w-3 h-3" /> View
                </span>
                <span className="text-muted-foreground/30 mx-1">|</span>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
            {status === "failed" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Retry
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (status === "completed") {
    return <Link to={`/genome/${id}`}>{content}</Link>;
  }

  return content;
};

export default ScanCard;
