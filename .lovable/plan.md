

# Fix: Fehlende Balken und leere Trust & Proof Sektion

## Problem 1: Balken werden nicht angezeigt

Die `CategoryBar`-Komponente verwendet `bg-chart-6` fuer Werte >= 80. Diese Tailwind-Klasse existiert aber nicht, weil im `tailwind.config.ts` keine `chart`-Farben definiert sind. Nur die CSS-Variablen (`--chart-6`) existieren in `index.css`, aber ohne Tailwind-Mapping erzeugt `bg-chart-6` keine Hintergrundfarbe.

**Loesung**: In `tailwind.config.ts` die Chart-Farben als Tailwind-Colors registrieren, oder alternativ in den Komponenten direkt inline-Styles mit `hsl(var(--chart-6))` verwenden. Der sauberste Weg ist, die Farben im Tailwind-Config hinzuzufuegen.

**Aenderung in `tailwind.config.ts`** -- Unter `colors` hinzufuegen:
```
chart: {
  1: "hsl(var(--chart-1))",
  2: "hsl(var(--chart-2))",
  3: "hsl(var(--chart-3))",
  4: "hsl(var(--chart-4))",
  5: "hsl(var(--chart-5))",
  6: "hsl(var(--chart-6))",
  7: "hsl(var(--chart-7))",
},
```

## Problem 2: Trust & Proof zeigt keine Daten

Die Trust-Tab-Ansicht in `AnalysisTabs.tsx` filtert Strengths und Weaknesses mit einem zu engen Regex:
```
/trust|review|certif|proof|guarantee/i
```
Da die KI-generierten Staerken/Schwaechen diese Woerter fast nie enthalten, bleibt die Anzeige leer.

**Loesung**: Den Regex-Filter entfernen und stattdessen alle Strengths/Weaknesses anzeigen, plus den Trust-Score aus `category_scores.trustProof` prominent darstellen. Die Trust-Sektion soll die gesamten Staerken/Schwaechen im Kontext von Vertrauenswuerdigkeit zeigen.

**Aenderung in `src/components/dashboard/AnalysisTabs.tsx`** -- Die Trust-Tab-Logik ersetzen:
- Alle Strengths und Weaknesses anzeigen (ohne Regex-Filter)
- Den `trustProof`-Score als Balken oben anzeigen
- Maximal 5 Eintraege pro Spalte zur Uebersichtlichkeit

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `tailwind.config.ts` | Chart-Farben als Tailwind-Colors hinzufuegen |
| `src/components/dashboard/AnalysisTabs.tsx` | Trust-Tab: Regex-Filter entfernen, alle Daten anzeigen |

## Keine weiteren Aenderungen noetig
- `WebsiteProfileCard.tsx` nutzt dieselben `bg-chart-6`-Klassen, die nach dem Tailwind-Config-Fix funktionieren werden
- `ComparisonTable.tsx` ist nicht betroffen (nutzt `bg-primary` und `bg-muted-foreground`)

