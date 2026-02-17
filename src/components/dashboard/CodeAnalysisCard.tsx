import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Shield, Zap, Eye, Wrench, Search, ExternalLink } from "lucide-react";
import type { CodeAnalysis } from "@/types/chat";

interface CodeAnalysisCardProps {
  codeAnalysis: CodeAnalysis;
  githubUrl?: string | null;
}

const getScoreColor = (score: number) =>
  score >= 80 ? "hsl(var(--chart-6))" : score >= 60 ? "hsl(var(--primary))" : "hsl(var(--destructive))";

const ScoreRing = ({ score, size = 48, label }: { score: number; size?: number; label?: string }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={3} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={3}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
          {score}
        </span>
      </div>
      {label && <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>}
    </div>
  );
};

const CodeAnalysisCard = ({ codeAnalysis, githubUrl }: CodeAnalysisCardProps) => {
  const ca = codeAnalysis;
  const overallScore = ca.codeQuality ?? 0;

  const subScores = [
    { label: "Security", score: ca.security ?? 0, icon: Shield },
    { label: "Performance", score: ca.performance ?? 0, icon: Zap },
    { label: "Accessibility", score: ca.accessibility ?? 0, icon: Eye },
    { label: "Maintainability", score: ca.maintainability ?? 0, icon: Wrench },
  ];

  const seoScore = ca.seo?.score ?? 0;
  const strengths = ca.strengths ?? [];
  const weaknesses = ca.weaknesses ?? [];
  const securityIssues = ca.securityIssues ?? ca.securityFlags ?? [];
  const recommendations = ca.recommendations ?? [];
  const techStack = ca.techStack ?? [];
  const seoIssues = ca.seo?.issues ?? [];

  return (
    <div className="space-y-3">
      {/* Overall Score + Sub-Scores */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ScoreRing score={overallScore} size={56} />
              <div>
                <h4 className="text-base font-semibold text-foreground">Code Quality</h4>
                <p className="text-xs text-muted-foreground">Deep Analysis Score</p>
              </div>
            </div>
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="w-3 h-3" /> Repo
              </a>
            )}
          </div>

          {/* Sub-scores row */}
          <div className="flex items-center justify-between gap-2">
            {subScores.map(({ label, score }) => (
              <ScoreRing key={label} score={score} size={42} label={label} />
            ))}
            <ScoreRing score={seoScore} size={42} label="SEO" />
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      {techStack.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {strengths.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-chart-6" /> Strengths
                  </p>
                  <div className="space-y-1.5">
                    {strengths.slice(0, 5).map((s) => (
                      <div key={s} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-chart-6 shrink-0" />
                        <span className="text-xs text-foreground leading-tight">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {weaknesses.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-destructive" /> Weaknesses
                  </p>
                  <div className="space-y-1.5">
                    {weaknesses.slice(0, 5).map((w) => (
                      <div key={w} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-destructive shrink-0" />
                        <span className="text-xs text-foreground leading-tight">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Issues */}
      {securityIssues.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-destructive" /> Security Issues
            </p>
            <div className="space-y-1.5">
              {securityIssues.map((issue) => (
                <div key={issue} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-destructive shrink-0" />
                  <span className="text-xs text-foreground leading-tight">{issue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Issues */}
      {seoIssues.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-primary" /> SEO Code Issues
            </p>
            <div className="space-y-1.5">
              {seoIssues.map((issue) => (
                <div key={issue} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-xs text-foreground leading-tight">{issue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">Recommendations</p>
            <div className="space-y-1.5">
              {recommendations.slice(0, 5).map((r) => (
                <div key={r} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-xs text-foreground leading-tight">{r}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodeAnalysisCard;
