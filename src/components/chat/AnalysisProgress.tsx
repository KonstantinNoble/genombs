import { Globe, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { WebsiteProfile } from "@/types/chat";

interface AnalysisProgressProps {
  profiles: WebsiteProfile[];
}

const STATUS_CONFIG: Record<string, { percent: number; label: string; color: string }> = {
  pending: { percent: 10, label: "In queue...", color: "text-muted-foreground" },
  queued: { percent: 10, label: "In queue...", color: "text-muted-foreground" },
  crawling: { percent: 33, label: "Crawling website...", color: "text-primary" },
  analyzing: { percent: 66, label: "AI analyzing...", color: "text-primary" },
  completed: { percent: 100, label: "Done", color: "text-chart-6" },
  error: { percent: 100, label: "Failed", color: "text-destructive" },
};

const AnalysisProgress = ({ profiles }: AnalysisProgressProps) => {
  const activeProfiles = profiles.filter(
    (p) => p.status !== "completed" || Date.now() - new Date(p.created_at).getTime() < 10000
  );

  if (activeProfiles.length === 0) return null;

  const hasActive = profiles.some((p) => p.status !== "completed" && p.status !== "error");

  return (
    <div className="mx-auto max-w-3xl w-full px-4 pb-3">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {hasActive ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-chart-6" />
          )}
          {hasActive ? "Analyzing websites..." : "Analysis complete"}
        </div>

        {activeProfiles.map((profile) => {
          const config = STATUS_CONFIG[profile.status] ?? STATUS_CONFIG.pending;
          const isError = profile.status === "error";
          const isDone = profile.status === "completed";

          return (
            <div key={profile.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="truncate text-foreground">{profile.url}</span>
                </div>
                <div className={`flex items-center gap-1 shrink-0 ${config.color}`}>
                  {isDone && <CheckCircle2 className="w-3 h-3" />}
                  {isError && <AlertCircle className="w-3 h-3" />}
                  <span>{config.label}</span>
                </div>
              </div>
              <Progress
                value={config.percent}
                className={`h-1.5 ${isError ? "[&>div]:bg-destructive" : isDone ? "[&>div]:bg-chart-6" : ""}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisProgress;
