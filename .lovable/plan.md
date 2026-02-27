

## Dashboard-Feature prominenter auf der Analyse-Seite

### Aktueller Zustand
Im Workspace-Header der Analyse-Seite (Chat.tsx) gibt es nur einen kleinen "View Dashboard"-Link in 10px Schrift -- leicht zu uebersehen.

### Aenderungen

**1. Dashboard-Banner im Workspace-Panel (Chat.tsx, Zeilen 468-481)**

Wenn eine Analyse abgeschlossen ist (`hasProfiles === true`), wird unterhalb des Workspace-Headers ein kompakter Banner eingefuegt:

```text
+--------------------------------------------------+
| [LayoutDashboard Icon]                            |
| Compare today's scores with your average          |
| Track improvements over time                      |
| [Open Dashboard ->]                               |
+--------------------------------------------------+
```

- Kompakte Card mit `bg-primary/5 border-primary/20`
- Icon + kurzer Text: "Compare today's scores with your average"
- Subtext: "Track your improvements over time"
- Button/Link "Open Dashboard" mit ArrowRight-Icon
- Nur sichtbar wenn mindestens ein Profil analysiert wurde
- Navigiert zu `/dashboard`

**2. Bestehenden "View Dashboard"-Link beibehalten**

Der existierende Link bleibt als sekundaere Navigation bestehen, der neue Banner ist die prominentere Variante.

### Technische Details

- Nur `src/pages/Chat.tsx` wird geaendert
- Neuer Banner-Block nach dem Workspace-Header (nach Zeile 481), vor der SectionNavBar
- Verwendet bestehende Komponenten: `Button`, `LayoutDashboard` (bereits importiert), `ArrowRight` (muss importiert werden)
- Kein neuer State oder Hook noetig, nutzt bestehendes `hasProfiles` und `navigate`

