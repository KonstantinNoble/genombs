
# Pruefung & Keywords klickbar machen

## Pruefung der PremiumLock-Banner

Alle PremiumLock-Texte wurden geprueft und sind aktuell korrekt:

| Komponente | PremiumLock-Titel | Status |
|---|---|---|
| ICPCard | "Unlock Buying Triggers, Objections & Where to Find" | Korrekt |
| AudienceChannelCard (SEO) | "Unlock SEO Keyword Opportunities" | Korrekt |
| AudienceChannelCard (Paid) | "Unlock Paid Channel Data" | Korrekt |
| AudienceChannelCard (Details) | "Unlock Links, Keywords & Formats" | Korrekt |
| OptimizationCard | "Unlock Effort & Expected Outcome" | Korrekt |
| CompetitorAnalysis (Battle Cards) | "Unlock Battle Cards with Premium" | Korrekt |
| CompetitorAnalysis (Win/Loss) | "Unlock Win/Loss Tracking with Premium" | Korrekt |

Kein Banner ist veraltet -- alle Texte beschreiben genau die Inhalte, die dahinter gesperrt sind.

---

## Keywords klickbar machen mit Google-Links

Zwei Stellen in `AudienceChannelCard.tsx` wo Keywords als klickbare Google-Suchlinks gestaltet werden:

### 1. SEO Keywords Tabelle (Zeile 113)
- Die Keyword-Zelle in der SEO-Tabelle wird zu einem klickbaren Link
- URL: `https://www.google.com/search?q={keyword}` (URL-encoded)
- Styling: `text-primary hover:underline` mit externem Link-Icon
- Oeffnet in neuem Tab

### 2. Recommended Keywords in Kanal-Details (Zeile 276)
- Die Keyword-Badges werden zu klickbaren Links
- Gleiches URL-Schema: Google-Suche
- Styling: bestehendes Badge-Design beibehalten, aber als `<a>` Tag mit hover-Effekt

### Technische Details

**`src/components/genome/AudienceChannelCard.tsx`**

Aenderung 1 -- SEO Tabelle (Zeile 113, auch Zeile 155 fuer die Free-Preview):
```tsx
// Vorher:
<td className="py-2 px-3 text-base font-mono text-foreground">{kw.keyword}</td>

// Nachher:
<td className="py-2 px-3">
  <a
    href={`https://www.google.com/search?q=${encodeURIComponent(kw.keyword)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-base font-mono text-primary hover:underline"
  >
    {kw.keyword}
  </a>
</td>
```

Aenderung 2 -- Recommended Keywords (Zeile 276):
```tsx
// Vorher:
<Badge key={kw} variant="outline" className="...">
  {kw}
</Badge>

// Nachher:
<a
  key={kw}
  href={`https://www.google.com/search?q=${encodeURIComponent(kw)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-mono font-normal text-primary hover:bg-primary/10 transition-colors"
>
  {kw}
</a>
```

Beide Aenderungen gelten sowohl fuer die Premium-Ansicht als auch fuer die verschwommene Free-Preview (damit der HTML konsistent ist).

### Dateien die geaendert werden

1. **`src/components/genome/AudienceChannelCard.tsx`** -- 4 Stellen: SEO-Tabelle (Premium + Free-Preview) und Recommended Keywords (Premium + Free-Preview)
