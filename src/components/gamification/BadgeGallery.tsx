import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/external-client";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { Lock } from "lucide-react";
import type { UserBadge } from "@/types/gamification";

interface BadgeGalleryProps {
  userId: string | null;
  size?: "sm" | "lg";
}

export function BadgeGallery({ userId, size = "sm" }: BadgeGalleryProps) {
  const [unlockedBadges, setUnlockedBadges] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!userId) return;
    const fetchBadges = async () => {
      const { data } = await supabase
        .from("user_badges" as any)
        .select("badge_id, unlocked_at")
        .eq("user_id", userId);
      if (data) {
        const map = new Map<string, string>();
        (data as any[]).forEach((b) => map.set(b.badge_id, b.unlocked_at));
        setUnlockedBadges(map);
      }
    };
    fetchBadges();
  }, [userId]);

  const isLarge = size === "lg";

  if (!isLarge) {
    // Compact inline variant (used in sidebar etc.)
    return (
      <div className="p-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Badges</h4>
        <div className="flex flex-wrap gap-2">
          {BADGE_DEFINITIONS.map((badge) => {
            const isUnlocked = unlockedBadges.has(badge.id);
            return (
              <span
                key={badge.id}
                title={isUnlocked ? badge.description : badge.condition}
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  isUnlocked
                    ? "border-primary/30 bg-primary/8 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground/40"
                }`}
              >
                {badge.name}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // Large variant for the Achievements page
  const unlocked = BADGE_DEFINITIONS.filter((b) => unlockedBadges.has(b.id));
  const locked = BADGE_DEFINITIONS.filter((b) => !unlockedBadges.has(b.id));

  return (
    <div className="space-y-6">
      {unlocked.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">
            Unlocked · {unlocked.length}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unlocked.map((badge) => {
              const unlockedAt = unlockedBadges.get(badge.id);
              return (
                <div key={badge.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{badge.description}</p>
                    {unlockedAt && (
                      <p className="text-[10px] text-primary/70 mt-1.5 font-medium">
                        {new Date(unlockedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">
            Locked · {locked.length}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="flex items-start gap-4 rounded-xl border border-border/50 bg-muted/10 p-4 opacity-50"
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center mt-0.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground/60 leading-tight">{badge.name}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 leading-snug">{badge.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlocked.length === 0 && locked.length === 0 && (
        <p className="text-sm text-muted-foreground">No badges defined.</p>
      )}
    </div>
  );
}
