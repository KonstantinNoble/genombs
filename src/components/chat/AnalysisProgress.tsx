import React, { useState, useEffect } from "react";
import { Globe, CheckCircle2, AlertCircle, Loader2, Github } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { WebsiteProfile } from "@/types/chat";

interface AnalysisProgressProps {
  profiles: WebsiteProfile[];
  githubAnalysisUrl?: string | null;
}

const STATUS_CONFIG: Record<string, { percent: number; label: string; color: string }> = {
  pending: { percent: 10, label: "In queue...", color: "text-muted-foreground" },
  queued: { percent: 10, label: "In queue...", color: "text-muted-foreground" },
  crawling: { percent: 33, label: "Crawling website...", color: "text-primary" },
  analyzing: { percent: 66, label: "AI analyzing...", color: "text-primary" },
  completed: { percent: 100, label: "Done", color: "text-chart-6" },
  error: { percent: 100, label: "Failed", color: "text-destructive" },
};

const AnalysisProgress = ({ profiles, githubAnalysisUrl }: AnalysisProgressProps) => {
  const [githubProgress, setGithubProgress] = useState(10);

  useEffect(() => {
    if (!githubAnalysisUrl) {
      setGithubProgress(10);
      return;
    }

    const interval = setInterval(() => {
      setGithubProgress((prev) => {
        if (prev >= 90) return prev; // Hold at 90% until done
        return prev + Math.floor(Math.random() * 5) + 1; // Increase by 1-5%
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [githubAnalysisUrl]);

  const activeProfiles = profiles.filter(
    (p) => p.status !== "completed" || Date.now() - new Date(p.created_at).getTime() < 10000
  );

  if (activeProfiles.length === 0 && !githubAnalysisUrl) return null;

  const hasActive = profiles.some((p) => p.status !== "completed" && p.status !== "error") || !!githubAnalysisUrl;

  return (
    <div className="mx-auto max-w-3xl w-full px-4 pb-3">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {hasActive ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-chart-6" />
          )}
          {hasActive ? "Analyzing..." : "Analysis complete"}
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

        {githubAnalysisUrl && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Github className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="truncate text-foreground">{githubAnalysisUrl}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-primary">
                <span>AI analyzing code...</span>
              </div>
            </div>
            <Progress value={githubProgress} className="h-1.5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisProgress;
