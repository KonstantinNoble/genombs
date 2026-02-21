import type { BadgeDefinition } from '@/types/gamification';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_scan',
    name: 'First Scan',
    description: 'Completed your first website analysis',
    icon: 'Zap',
    condition: 'Run 1 analysis',
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Active for 3 consecutive days',
    icon: 'Flame',
    condition: 'Reach a 3-day streak',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Active for 7 consecutive days',
    icon: 'Trophy',
    condition: 'Reach a 7-day streak',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Active for 30 consecutive days',
    icon: 'Crown',
    condition: 'Reach a 30-day streak',
  },
  {
    id: 'score_80',
    name: 'High Performer',
    description: 'Achieved a score of 80 or higher',
    icon: 'Star',
    condition: 'Score ≥ 80 in any analysis',
  },
  {
    id: 'scans_5',
    name: 'Scanner Pro',
    description: 'Ran 5 website analyses',
    icon: 'BarChart',
    condition: 'Run 5 analyses',
  },
];

export const getBadgeDefinition = (badgeId: string): BadgeDefinition | undefined => {
  return BADGE_DEFINITIONS.find(b => b.id === badgeId);
};
