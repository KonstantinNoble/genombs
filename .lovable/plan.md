
# Homepage Optimierung: Hero-Bereich

## Übersicht

Optimierung des Hero-Bereichs für mehr Konversionen durch:
1. **Stärkere Headline** mit direkter Problemansprache
2. **Entfernung des "View Plans" Buttons** der potenzielle Nutzer einschüchtern kann

---

## Änderungen

### 1. Neue Headline

**Aktuell (Zeile 76-80):**
```
Your Missing Advisory Board.
```

**Neu:**
```
Stop making bad decisions.
Let your AI Advisory Board pressure-test your strategy.
```

Die neue Headline:
- Spricht das Problem direkt an ("bad decisions")
- Ist aktionsorientierter und dringlicher
- Erklärt sofort den Nutzen ("pressure-test your strategy")

### 2. Button-Optimierung

**Aktuell (Zeile 110-117):**
```
"View Plans" Button → Link zu /pricing
```

**Lösung:** 
Den Button komplett entfernen. Der primäre CTA "Try It Free" bleibt als einziger Button bestehen.

**Begründung:**
- "View Plans" lenkt vom Hauptziel ab (kostenlos ausprobieren)
- Preise können einschüchtern bevor der Nutzer den Wert erlebt hat
- Single-CTA-Pattern erhöht Konversionen

---

## Betroffene Datei

- `src/components/home/Hero.tsx`

---

## Technische Details

- **Zeile 76-80**: Headline-Text und Struktur anpassen (zweizeilige Headline)
- **Zeile 110-117**: Kompletten "View Plans" Button-Block entfernen
- **Zeile 95**: Container-Klassen vereinfachen (kein `flex-col sm:flex-row` mehr nötig bei nur einem Button)
