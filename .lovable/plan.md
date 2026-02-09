

# Schriften lesbarer machen -- Dashboard + Competitor Analysis

## Problem

Die Schriftgroessen sind durchgehend zu klein und die Farben zu gedaempft. Besonders betroffen:
- Labels nutzen `text-[10px]` (10px) -- kaum lesbar
- Body-Text nutzt `text-sm` (14px) mit `text-muted-foreground` -- blass und klein
- Tabellenkoepfe nutzen `text-[10px]` -- winzig
- Section-Header nutzen `text-lg` (18px) -- koennte prominenter sein

## Loesung

Systematische Groessen-Erhoehung in allen Genome-Komponenten und beiden Seiten:

### Schriftgroessen-Aenderungen

| Element | Vorher | Nachher |
|---|---|---|
| Section Labels (uppercase) | `text-[10px]` | `text-xs` (12px) |
| Body Text | `text-sm` (14px) | `text-base` (16px) |
| Body Text (secondary) | `text-xs` (12px) | `text-sm` (14px) |
| Section Headers | `text-lg` (18px) | `text-xl` (20px) |
| Card Titles (GenomeCard) | `text-lg` | `text-xl` |
| Table Headers | `text-[10px]` | `text-xs` |
| Table Cells | `text-sm` | `text-base` |
| Descriptions | `text-xs text-muted-foreground` | `text-sm text-muted-foreground` |
| Badge Text | `text-[10px]` | `text-xs` |
| List Items | `text-sm` | `text-base` |

### Farb-Verstaerkungen

- `text-muted-foreground` bei wichtigem Body-Text ersetzen durch `text-foreground/80` (leicht gedaempft, aber deutlich lesbarer)
- Section Labels bleiben `text-muted-foreground` (bewusst dezent)
- Tabelleninhalte: `text-muted-foreground` zu `text-foreground/70` (besserer Kontrast)

### Betroffene Dateien

1. **`src/components/genome/GenomeCard.tsx`** -- CardTitle von `text-lg` zu `text-xl`
2. **`src/components/genome/BattleCardView.tsx`** -- Labels, Items, Beschreibung
3. **`src/components/genome/WinLossChart.tsx`** -- Summary Cards Labels, Reasons, Bars
4. **`src/components/genome/DealHistoryTable.tsx`** -- Tabellenkoepfe, Zellen, Badges
5. **`src/components/genome/CompetitorSWOT.tsx`** -- SWOT Labels, Items
6. **`src/components/genome/ICPCard.tsx`** -- Labels, Pain Points, Goals, Premium Sections
7. **`src/components/genome/OptimizationCard.tsx`** -- Area Title, Recommendation, Labels
8. **`src/components/genome/AudienceChannelCard.tsx`** -- SEO Tabelle, Channel Labels, Links
9. **`src/components/genome/PerformanceChart.tsx`** -- Score Insights, Benchmark Tabelle
10. **`src/components/genome/StatCard.tsx`** -- Label
11. **`src/components/genome/ScanCard.tsx`** -- Domain, Segment, Sections-Text
12. **`src/components/genome/GenomeScore.tsx`** -- Label
13. **`src/components/genome/SectionNav.tsx`** -- Nav-Buttons
14. **`src/components/genome/PremiumLock.tsx`** -- Overlay-Text
15. **`src/pages/CompetitorAnalysis.tsx`** -- Seitentext, Tabellen, Descriptions
16. **`src/pages/GenomeView.tsx`** -- Executive Summary, Section Headers, Descriptions
17. **`src/pages/Dashboard.tsx`** -- Competitor CTA, Descriptions, URL Hint

### Design-Prinzip

Die Erhoehung ist moderat (jeweils eine Stufe hoch), damit das minimalistische Design erhalten bleibt, aber die Lesbarkeit deutlich steigt. Die visuelle Hierarchie bleibt intakt -- Labels sind weiterhin kleiner als Body-Text, Headers dominieren.

