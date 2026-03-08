import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy, Check, Target, Send, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/external-client";
import { useAuth } from "@/contexts/AuthContext";
import type { WebsiteProfile, ImprovementTask } from "@/types/chat";
import PageSpeedCard from "./PageSpeedCard";
import WebsiteGrid from "./WebsiteGrid";
import ComparisonTable from "./ComparisonTable";
import ImprovementPlan from "./ImprovementPlan";
import CodeAnalysisCard from "./CodeAnalysisCard";

interface AnalysisTabsContentProps {
  profiles: WebsiteProfile[];
  tasks: ImprovementTask[];
  onOpenUrlDialog?: () => void;
  onOpenGithubDialog?: () => void;
}

const getScoreColor = (score: number) =>
  score >= 80 ? "hsl(var(--chart-6))" : score >= 60 ? "hsl(var(--primary))" : "hsl(var(--destructive))";

const ScoreRing = ({ score, size = 52 }: { score: number; size?: number }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={3} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
        {score}
      </span>
    </div>
  );
};

const PlaceholderCard = ({ title, description, buttonLabel, onAction }: { title: string; description: string; buttonLabel?: string; onAction?: () => void }) => (
  <Card className="border-dashed border-border bg-card/50">
    <CardContent className="p-8 flex flex-col items-center text-center gap-3">
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      {onAction && buttonLabel && (
        <Button variant="default" size="sm" onClick={onAction}>
          {buttonLabel}
        </Button>
      )}
    </CardContent>
  </Card>
);

// ─── Customer Maps History ───
const CustomerMapsHistory = () => {
  const { user } = useAuth();
  const [maps, setMaps] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("customer_maps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setMaps(data || []));
  }, [user]);

  if (maps.length === 0) return null;

  return (
    <div className="space-y-3">
      {maps.map((m) => (
        <Card key={m.id} className="border-border bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-medium text-foreground truncate">{m.url}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(m.created_at).toLocaleDateString()}
              </span>
            </div>
            {m.product_summary && (
              <p className="text-xs text-muted-foreground line-clamp-2">{m.product_summary}</p>
            )}
            {m.communities && Array.isArray(m.communities) && (
              <div className="flex flex-wrap gap-1">
                {(m.communities as any[]).slice(0, 5).map((c: any, i: number) => (
                  <Badge key={i} variant="outline" className="text-[9px]">
                    {c.platform || "Community"}
                  </Badge>
                ))}
                {m.communities.length > 5 && (
                  <Badge variant="outline" className="text-[9px] text-muted-foreground">
                    +{m.communities.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ─── Generated Posts History ───
const PostsHistory = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("generated_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setPosts(data || []));
  }, [user]);

  if (posts.length === 0) return null;

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Post copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const platformEmoji: Record<string, string> = {
    reddit: "🟠", linkedin: "🔵", x: "🐦", youtube: "🔴",
    facebook: "📘", discord: "💬", tiktok: "🎵", quora: "❓",
    forum: "📝", cold_email: "✉️",
  };

  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <Card key={p.id} className="border-border bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{platformEmoji[p.platform] || "📝"}</span>
                <Badge variant="outline" className="text-[10px] capitalize">{p.platform}</Badge>
                {p.tone && <Badge variant="secondary" className="text-[9px] capitalize">{p.tone}</Badge>}
                {p.goal && <Badge variant="secondary" className="text-[9px] capitalize">{p.goal}</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-1.5"
                  onClick={() => handleCopy(p.id, p.content || "")}
                >
                  {copiedId === p.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            {p.content && (
              <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed line-clamp-4">
                {p.content}
              </pre>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AnalysisTabsContent = ({ profiles, tasks, onOpenUrlDialog, onOpenGithubDialog }: AnalysisTabsContentProps) => {
  const ownSite = profiles.find((p) => p.is_own_website);
  const competitors = profiles.filter((p) => !p.is_own_website);
  const hasMultiple = profiles.length >= 2;

  if (!ownSite) return null;

  const hasWebsiteData = !!ownSite.profile_data;
  const hasCodeData = !!ownSite.code_analysis;

  return (
    <div className="space-y-6">
      {/* ── WEBSITE ANALYSIS BLOCK ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Website Analysis</h2>

        {hasWebsiteData ? (
          <div className="space-y-8">
            {/* ── Overview ── */}
            <section id="section-overview" className="scroll-mt-16 space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</h3>
              <WebsiteGrid profiles={profiles} />
              {hasMultiple && <ComparisonTable profiles={profiles} />}
              {tasks.length > 0 && <ImprovementPlan tasks={tasks} />}
            </section>

            {/* ── Positioning ── */}
            <section id="section-positioning" className="scroll-mt-16 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Positioning</h3>
              {[ownSite, ...competitors].map((profile) => {
                if (!profile.profile_data) return null;
                return (
                  <Card key={profile.id} className="border-border bg-card transition-all duration-200 hover:border-primary/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-foreground">{profile.profile_data.name}</h4>
                        <Badge variant={profile.is_own_website ? "default" : "outline"} className="text-xs">
                          {profile.is_own_website ? "Your Site" : "Competitor"}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="border-l-2 border-primary/30 pl-3">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-0.5">Target Audience</p>
                          <p className="text-sm text-foreground">{profile.profile_data.targetAudience}</p>
                        </div>
                        <div className="border-l-2 border-primary/30 pl-3">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-0.5">Unique Selling Proposition</p>
                          <p className="text-sm text-foreground">{profile.profile_data.usp}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5">Site Structure</p>
                          <div className="flex flex-wrap gap-1">
                            {(profile.profile_data.siteStructure || []).map((s: string) => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            {/* ── Offer & CTAs ── */}
            <section id="section-offers" className="scroll-mt-16 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Offer & CTAs</h3>
              {[ownSite, ...competitors].map((profile) => {
                if (!profile.profile_data) return null;
                return (
                  <Card key={profile.id} className="border-border bg-card transition-all duration-200 hover:border-primary/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-foreground">{profile.profile_data.name}</h4>
                        <Badge variant={profile.is_own_website ? "default" : "outline"} className="text-xs">
                          {profile.is_own_website ? "Your Site" : "Competitor"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5">Call-to-Actions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(profile.profile_data.ctas || []).map((cta: string) => (
                            <Badge key={cta} variant="outline" className="text-xs border-primary/30 text-primary">{cta}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="border-l-2 border-primary/30 pl-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-0.5">Value Proposition</p>
                        <p className="text-sm text-foreground">{profile.profile_data.usp}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            {/* ── Trust & Proof ── */}
            <section id="section-trust" className="scroll-mt-16 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trust & Proof</h3>
              {[ownSite, ...competitors].map((profile) => {
                if (!profile.profile_data) return null;
                const trustScore = profile.category_scores?.trustProof ?? 0;
                return (
                  <Card key={profile.id} className="border-border bg-card transition-all duration-200 hover:border-primary/20">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ScoreRing score={trustScore} />
                          <div>
                            <h4 className="text-base font-semibold text-foreground">{profile.profile_data.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">Trust & Proof Score</p>
                          </div>
                        </div>
                        <Badge variant={profile.is_own_website ? "default" : "outline"} className="text-xs">
                          {profile.is_own_website ? "Your Site" : "Competitor"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Strengths
                          </p>
                          <div className="space-y-1.5">
                            {(profile.profile_data.strengths || []).slice(0, 5).map((s: string) => (
                              <div key={s} className="flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-chart-6 shrink-0" />
                                <span className="text-sm text-foreground leading-tight">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Weaknesses
                          </p>
                          <div className="space-y-1.5">
                            {(profile.profile_data.weaknesses || []).slice(0, 5).map((w: string) => (
                              <div key={w} className="flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-destructive shrink-0" />
                                <span className="text-sm text-foreground leading-tight">{w}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          </div>
        ) : (
          <PlaceholderCard
            title="Scan your website"
            description="Analyze your website URL to unlock positioning, trust, and conversion insights."
            buttonLabel="Start Website Scan"
            onAction={onOpenUrlDialog}
          />
        )}
      </div>

      {/* ── SEPARATOR ── */}
      <Separator className="my-2" />

      {/* ── CODE ANALYSIS BLOCK ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Code Analysis</h2>

        {hasCodeData ? (
          <section id="section-code-quality" className="scroll-mt-16 space-y-3">
            <CodeAnalysisCard
              codeAnalysis={ownSite.code_analysis}
              githubUrl={ownSite.github_repo_url}
            />
          </section>
        ) : (
          <PlaceholderCard
            title="Analyze your repository"
            description="Connect a GitHub repository to unlock code quality, security, and performance insights."
            buttonLabel="Start Code Analysis"
            onAction={onOpenGithubDialog}
          />
        )}
      </div>

      {/* ── SEPARATOR ── */}
      <Separator className="my-2" />

      {/* ── CUSTOMER MAPS HISTORY ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Customer Maps</h2>
        <CustomerMapsHistory />
      </div>

      {/* ── SEPARATOR ── */}
      <Separator className="my-2" />

      {/* ── GENERATED POSTS HISTORY ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Generated Posts</h2>
        <PostsHistory />
      </div>
    </div>
  );
};

export default AnalysisTabsContent;
