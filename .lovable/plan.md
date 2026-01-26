
# Email-Template Redesign: Team-Einladung

## Problem
Das aktuelle Team-Einladungs-Email verwendet ein dunkles Farbschema (dunkelblau/lila), das nicht zum hellen, professionellen Design deiner Website passt. Die Schrift ist auf dem dunklen Hintergrund schwer lesbar.

## Loesung
Das Email-Template in der `team-management` Edge Function wird an das Synoptas Design-System angepasst:

### Designaenderungen

| Aktuell | Neu |
|---------|-----|
| Dunkler Hintergrund (#0a0a0f) | Heller Hintergrund (#f8f8f8) |
| Lila Header-Gradient | Gruener Header (Primary: #22c55e) |
| Graue Texte (#a1a1aa) | Dunkle, lesbare Texte (#1a1a1a) |
| Lila Button | Gruener Button mit Hover-Effekt |
| Dunkle Footer-Box | Helle Footer-Box mit Rahmen |

### Vorschau des neuen Designs

Das neue Email-Template wird folgende Elemente haben:
- **Header**: Weisser Hintergrund mit gruenem Synoptas-Logo-Text
- **Body**: Heller Hintergrund mit schwarzem, gut lesbarem Text
- **Button**: Gruener CTA-Button (Primary-Farbe) mit weissem Text
- **Footer**: Dezente graue Hinweisbox fuer Ablaufdatum
- **Branding**: Professionell und konsistent mit der Website

---

## Technische Umsetzung

### Datei: `supabase/functions/team-management/index.ts`

Die `sendInviteEmail`-Funktion (Zeilen 26-99) wird aktualisiert:

```text
Aenderungen am HTML-Template:

1. Body-Hintergrund:
   - Alt: background-color: #0a0a0f
   - Neu: background-color: #f4f4f5

2. Container-Styling:
   - Alt: background: linear-gradient(#18181b, #0a0a0f), border: #27272a
   - Neu: background: #ffffff, border: #e4e4e7

3. Header-Bereich:
   - Alt: Lila Gradient (#6366f1 -> #8b5cf6)
   - Neu: Weisser Hintergrund mit gruenem "Synoptas" Text

4. Text-Farben:
   - Ueberschrift: #1a1a1a (fast schwarz)
   - Haupttext: #3f3f46 (dunkelgrau, gut lesbar)
   - Sekundaertext: #52525b (mittelgrau)

5. CTA-Button:
   - Alt: Lila Gradient
   - Neu: Gruen (#22c55e) mit border-radius: 16px

6. Hinweis-Box (Ablaufdatum):
   - Alt: Dunkler Hintergrund (#27272a)
   - Neu: Heller Hintergrund (#f4f4f5) mit Rahmen

7. Footer:
   - Hellgraue Trennlinie (#e4e4e7)
   - Dunkelgrauer Copyright-Text (#71717a)
```

### Vollstaendiges neues Template-Design:

```html
<body style="
  font-family: 'Segoe UI', Arial, sans-serif; 
  background-color: #f4f4f5; 
  color: #1a1a1a; 
  margin: 0; 
  padding: 40px 20px;
">
  <div style="
    max-width: 520px; 
    margin: 0 auto; 
    background: #ffffff; 
    border: 1px solid #e4e4e7; 
    border-radius: 16px; 
    overflow: hidden;
    box-shadow: 0 4px 12px -4px rgba(0,0,0,0.08);
  ">
    <!-- Header mit Branding -->
    <div style="
      background: #ffffff; 
      padding: 32px; 
      text-align: center; 
      border-bottom: 1px solid #e4e4e7;
    ">
      <h1 style="
        color: #22c55e; 
        margin: 0; 
        font-size: 24px; 
        font-weight: 700; 
        letter-spacing: -0.025em;
      ">Synoptas</h1>
      <p style="
        color: #71717a; 
        font-size: 14px; 
        margin: 8px 0 0;
      ">Team Invitation</p>
    </div>
    
    <!-- Inhalt -->
    <div style="padding: 32px;">
      <p style="
        color: #1a1a1a; 
        font-size: 16px; 
        line-height: 1.6; 
        margin: 0 0 24px;
      ">
        You've been invited to join 
        <strong>${teamName}</strong> 
        by ${inviterEmail}.
      </p>
      
      <p style="
        color: #3f3f46; 
        font-size: 14px; 
        line-height: 1.6; 
        margin: 0 0 32px;
      ">
        As a team member, you'll be able to collaborate 
        on strategic decision validations.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}" style="
          display: inline-block; 
          background-color: #22c55e; 
          color: white; 
          text-decoration: none; 
          padding: 16px 40px; 
          border-radius: 16px; 
          font-weight: 600; 
          font-size: 16px;
        ">
          Accept Invitation
        </a>
      </div>
      
      <!-- Link Fallback -->
      <p style="
        color: #71717a; 
        font-size: 12px; 
        text-align: center; 
        margin: 24px 0 0;
      ">
        Or copy this link:<br>
        <a href="${inviteUrl}" style="
          color: #22c55e; 
          word-break: break-all;
        ">${inviteUrl}</a>
      </p>
      
      <!-- Ablauf-Hinweis -->
      <div style="
        background: #f4f4f5; 
        border: 1px solid #e4e4e7; 
        border-radius: 8px; 
        padding: 16px; 
        margin-top: 24px;
      ">
        <p style="
          color: #52525b; 
          font-size: 13px; 
          margin: 0; 
          text-align: center;
        ">
          This invitation expires in 7 days
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="
      border-top: 1px solid #e4e4e7; 
      padding: 24px; 
      text-align: center;
    ">
      <p style="
        color: #71717a; 
        font-size: 12px; 
        margin: 0;
      ">
        (c) 2026 Synoptas. All rights reserved.
      </p>
    </div>
  </div>
</body>
```

## Vorteile

- **Bessere Lesbarkeit**: Schwarzer Text auf weissem Hintergrund
- **Konsistentes Branding**: Gruene Primary-Farbe wie auf der Website
- **Professioneller Look**: Clean, minimalistisches Design
- **Moderne Optik**: Abgerundete Buttons (border-radius: 16px)
- **Vertrauen**: Einheitliches Erscheinungsbild staerkt die Marke
