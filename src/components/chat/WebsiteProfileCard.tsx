import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/external-client";
import { generateSlug } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { WebsiteProfile } from "@/types/chat";

interface WebsiteProfileCardProps {
  profile: WebsiteProfile;
  compact?: boolean;
}

const MONTHLY_PUBLISH_LIMIT = 5;

const getScoreColor = (score: number) =>
  score >= 80 ? "hsl(var(--chart-6))" : score >= 60 ? "hsl(var(--primary))" : "hsl(var(--destructive))";

const getScoreGlow = (score: number) =>
  score >= 80
    ? "0 0 16px hsl(var(--chart-6) / 0.4)"
    : score >= 60
      ? "0 0 16px hsl(var(--primary) / 0.4)"
      : "0 0 16px hsl(var(--destructive) / 0.4)";

const ScoreRing = ({ score, size = 64 }: { score: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size, filter: `drop-shadow(${getScoreGlow(score)})` }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={4}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-foreground">
        {score}
      </span>
    </div>
  );
};

const CategoryBar = ({ label, value }: { label: string; value: number }) => {
  const color = value >= 80 ? "bg-chart-6" : value >= 60 ? "bg-primary" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-foreground w-7 text-right">{value}</span>
    </div>
  );
};

const WebsiteProfileCard = ({ profile, compact }: WebsiteProfileCardProps) => {
  const { profile_data, url, is_own_website, overall_score, category_scores } = profile;
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(profile.is_public ?? false);
  const [publicSlug, setPublicSlug] = useState<string | null>((profile as any).public_slug ?? null);
  const [monthlyUsed, setMonthlyUsed] = useState<number | null>(null);

  // Fetch monthly publish usage
  useEffect(() => {
    if (!user) return;
    const fetchUsage = async () => {
      const { data } = await (supabase.rpc as Function)("get_monthly_publish_count", { _user_id: user.id });
      setMonthlyUsed(typeof data === "number" ? data : 0);
    };
    fetchUsage();
  }, [user]);

  if (!profile_data || !category_scores || overall_score == null) return null;

  const limitReached = (monthlyUsed ?? 0) >= MONTHLY_PUBLISH_LIMIT;
  const nextReset = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const handlePublishClick = () => {
    if (!user) return;
    if (!isPremium) {
      setShowUpgradeDialog(true);
      return;
    }
    if (limitReached) {
      toast({ title: "Monthly limit reached", description: `Your 5 publications reset on ${nextReset}.` });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmPublish = async () => {
    if (!user) return;
    setShowConfirmDialog(false);
    setPublishLoading(true);
    try {
      let slug = generateSlug(url);
      let success = false;

      for (let attempt = 0; attempt < 5; attempt++) {
        const candidateSlug = attempt === 0 ? slug : `${slug}-${attempt}`;
        const { error } = await supabase
          .from("website_profiles")
          .update({ is_public: true, public_slug: candidateSlug, published_at: new Date().toISOString() } as Record<string, unknown>)
          .eq("id", profile.id);

        if (!error) {
          slug = candidateSlug;
          success = true;
          break;
        }
        if (!error.message?.includes("unique") && !error.message?.includes("duplicate")) {
          throw error;
        }
      }

      if (!success) {
        toast({ title: "Slug collision", description: "Could not generate a unique URL. Please try again.", variant: "destructive" });
        return;
      }

      await (supabase.from as Function)("publish_usage").insert({ user_id: user.id, website_profile_id: profile.id });

      setIsPublic(true);
      setPublicSlug(slug);
      setMonthlyUsed((prev) => (prev ?? 0) + 1);

      const publicUrl = `https://synvertas.com/scores/${slug}`;
      await navigator.clipboard.writeText(publicUrl);

      toast({ title: "Score published!", description: `Link copied: ${publicUrl}` });
    } catch (err) {
      console.error("Publish error:", err);
      toast({ title: "Failed to publish", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setPublishLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setPublishLoading(true);
    try {
      await supabase
        .from("website_profiles")
        .update({ is_public: false } as Record<string, unknown>)
        .eq("id", profile.id);
      setIsPublic(false);
      toast({ title: "Score unpublished", description: "The public page has been removed." });
    } catch (err) {
      console.error("Unpublish error:", err);
    } finally {
      setPublishLoading(false);
    }
  };

  const showPublishSection = profile.status === "completed" && user;

  if (compact) {
    return (
      <Card className="border-border bg-card card-hover-subtle">
        <CardContent className="p-3 flex items-center gap-3">
          <ScoreRing score={overall_score} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-foreground truncate">{profile_data.name}</p>
            <p className="text-sm text-muted-foreground truncate">{url}</p>
          </div>
          <Badge variant={is_own_website ? "default" : "outline"} className="text-[10px] shrink-0">
            {is_own_website ? "Your Site" : "Competitor"}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={`border-border bg-gradient-to-br from-card to-card/80 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_8px_24px_-8px_rgb(0_0_0/0.4)] ${is_own_website ? "ring-1 ring-primary/30" : ""}`}
      >
        <CardContent className="p-5 space-y-5">
          <div className="flex items-start gap-4">
            <ScoreRing score={overall_score} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-foreground">{profile_data.name}</h3>
                <Badge variant={is_own_website ? "default" : "outline"} className="text-[10px] shrink-0">
                  {is_own_website ? "Your Site" : "Competitor"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">{url}</p>
            </div>
          </div>

          <div className="space-y-2">
            <CategoryBar label="Findability" value={category_scores.findability} />
            <CategoryBar label="Mobile" value={category_scores.mobileUsability} />
            <CategoryBar label="Offer" value={category_scores.offerClarity} />
            <CategoryBar label="Trust" value={category_scores.trustProof} />
            <CategoryBar label="Conversion" value={category_scores.conversionReadiness} />
          </div>

          {showPublishSection && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              {isPublic ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium text-foreground shrink-0">Published</span>
                    {publicSlug && (
                      <a
                        href={`https://synvertas.com/scores/${publicSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline truncate"
                      >
                        synvertas.com/scores/{publicSlug}
                      </a>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleUnpublish} disabled={publishLoading} className="shrink-0 text-muted-foreground hover:text-destructive">
                    {publishLoading ? "Removing..." : "Unpublish"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {isPremium ? "Publish your score and earn a backlink" : "Earn a do-follow backlink with Premium"}
                    </span>
                    {isPremium && monthlyUsed != null && !limitReached && (
                      <span className="text-xs text-muted-foreground">{monthlyUsed}/{MONTHLY_PUBLISH_LIMIT} publications used this month</span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-chart-6" />
                Strengths
              </p>
              <div className="space-y-1.5">
                {(profile_data.strengths || []).slice(0, 3).map((s) => (
                  <div key={s} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-chart-6 shrink-0" />
                    <span className="text-sm text-foreground leading-tight">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-destructive" />
                Weaknesses
              </p>
              <div className="space-y-1.5">
                {(profile_data.weaknesses || []).slice(0, 3).map((w) => (
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

      {/* Confirmation Dialog for Premium Users */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Your Score Report</DialogTitle>
            <DialogDescription className="pt-2 space-y-3">
              <span className="block">
                Your overall score, category ratings, and key strengths will be published on a public page. A do-follow backlink to your domain will be included.
              </span>
              <span className="block text-sm text-muted-foreground">
                This uses 1 of your {MONTHLY_PUBLISH_LIMIT} monthly publications. You have used {monthlyUsed ?? 0}/{MONTHLY_PUBLISH_LIMIT} this month.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmPublish}>Publish Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog for Free Users */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Your Score Report</DialogTitle>
            <DialogDescription className="pt-2">
              Upgrade to Premium to unlock Public Score Pages and boost your SEO with high-quality backlinks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-foreground">What you get with Premium:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Public page with your website score visible to everyone</li>
              <li>High-quality do-follow backlink to boost your SEO</li>
              <li>5 publications per month included with Premium</li>
            </ul>
          </div>
          <Button className="w-full" onClick={() => { setShowUpgradeDialog(false); navigate("/pricing"); }}>
            View Premium Plans
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WebsiteProfileCard;
