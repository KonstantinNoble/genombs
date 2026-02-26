import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/external-client";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import type { UserBadge } from "@/types/gamification";

interface BadgeGalleryProps {
  userId: string | null;
  size?: "sm" | "lg";
}

export function BadgeGallery({ userId, size = "sm" }: BadgeGalleryProps) {
  const [unlockedBadges, setUnlockedBadges] = useState<Map<string, string>>(new Map());
  const [visible, setVisible] = useState(false);

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
      setTimeout(() => setVisible(true), 80);
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
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${isUnlocked
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

  // Large variant for the Dashboard page
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
            {unlocked.map((badge, i) => {
              const unlockedAt = unlockedBadges.get(badge.id);
              return (
                <div
                  key={badge.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4
                    hover:border-primary/40 hover:bg-primary/[0.03] hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10
                    transition-all duration-300 cursor-default group"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(14px)",
                    transition: `opacity 500ms ease ${i * 60}ms, transform 500ms ease ${i * 60}ms,
                      border-color 200ms, background-color 200ms, box-shadow 200ms, translate 200ms`,
                  }}
                >
                  {/* Pulsing ring indicator — slower + larger */}
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 relative">
                    <span className="absolute w-6 h-6 rounded-full border border-primary/30 animate-[ping_4s_ease-in-out_infinite]" />
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground leading-tight dashboard-badge-hover-gradient">{badge.name}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-snug">{badge.description}</p>
                    {unlockedAt && (
                      <p className="text-xs text-primary/70 mt-2 font-mono">
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
            {locked.map((badge, i) => (
              <div
                key={badge.id}
                className="flex items-start gap-4 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-4
                  hover:border-border/70 hover:bg-card/50 transition-all duration-300 cursor-default group"
                style={{
                  opacity: visible ? 0.45 : 0,
                  transform: visible ? "translateY(0)" : "translateY(14px)",
                  transition: `opacity 500ms ease ${(unlocked.length + i) * 60}ms, transform 500ms ease ${(unlocked.length + i) * 60}ms,
                    border-color 200ms, background-color 200ms`,
                }}
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center mt-0.5">
                  <span className="text-[8px] font-bold uppercase tracking-widest dashboard-locked-shimmer">
                    LOCKED
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground/50 leading-tight">{badge.name}</p>
                  <p className="text-sm text-muted-foreground/40 mt-1 leading-snug group-hover:text-muted-foreground/70 transition-colors duration-300">{badge.condition}</p>
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
