export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_active_days: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  condition: string; // human-readable condition text
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_active_days: number;
}
