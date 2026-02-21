import type { BadgeDefinition } from '@/types/gamification';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_scan',
    name: 'First Scan',
    description: 'Deine erste Website-Analyse abgeschlossen',
    icon: 'Zap',
    condition: '1 Analyse durchführen',
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: '3 Tage in Folge aktiv gewesen',
    icon: 'Flame',
    condition: '3-Tage-Streak erreichen',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7 Tage in Folge aktiv gewesen',
    icon: 'Trophy',
    condition: '7-Tage-Streak erreichen',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30 Tage in Folge aktiv gewesen',
    icon: 'Crown',
    condition: '30-Tage-Streak erreichen',
  },
  {
    id: 'score_80',
    name: 'High Performer',
    description: 'Einen Score von 80+ erreicht',
    icon: 'Star',
    condition: 'Score ≥ 80 in einer Analyse',
  },
  {
    id: 'tasks_10',
    name: 'Task Crusher',
    description: '10 Verbesserungsaufgaben erledigt',
    icon: 'CheckCircle',
    condition: '10 Tasks abschließen',
  },
  {
    id: 'scans_5',
    name: 'Scanner Pro',
    description: '5 Website-Analysen durchgeführt',
    icon: 'BarChart',
    condition: '5 Analysen durchführen',
  },
];

export const getBadgeDefinition = (badgeId: string): BadgeDefinition | undefined => {
  return BADGE_DEFINITIONS.find(b => b.id === badgeId);
};
