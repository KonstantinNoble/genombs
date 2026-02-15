

## E-Mail-Templates modernisieren: Dark Theme mit Synvertas Branding

Alle drei Edge Functions erhalten ein neues E-Mail-Design, das zum aktuellen Schwarz-Orange-Branding der Website passt.

---

### Aktuelles Problem

- Gruen (#10b981) als Primaerfarbe statt Orange (#F97316)
- Weisser Hintergrund mit einfachem Text-Header "Synvertas" statt Logo
- Kein Logo eingebunden
- Design passt nicht zur Website-Aesthetik

### Neues Design

- **Hintergrund:** Dunkel (#0A0A0A)
- **Card:** Dunkles Grau (#1A1A1A) mit subtiler Border (#2A2A2A)
- **Primaerfarbe/Buttons:** Orange (#F97316) 
- **Logo:** Eingebunden als Bild ueber `https://synvertas.com/synvertas-logo.png`
- **Typografie:** Weiss (#FAFAFA) fuer Ueberschriften, Grau (#A1A1AA) fuer Sekundaertext
- **Footer:** Dezenter Trennstrich, Copyright-Zeile

### Betroffene Dateien (3 Edge Functions)

1. **`supabase/functions/send-auth-email/index.ts`** - Confirmation + Reset Templates
2. **`supabase/functions/register-user/index.ts`** - Registration Confirmation Template  
3. **`supabase/functions/check-reset-eligibility/index.ts`** - Password Reset Template

### Aenderungen pro Template

- `background-color: #f4f4f5` wird zu `#0A0A0A`
- Card `background: white` wird zu `#1A1A1A` mit `border: 1px solid #2A2A2A`
- Text-Header `<h1>Synvertas</h1>` wird ersetzt durch `<img>` mit dem Logo (max-height: 40px)
- Alle `#10b981` Farben werden zu `#F97316` (Buttons, Links)
- Text-Farben: `#18181b` zu `#FAFAFA`, `#52525b` zu `#D4D4D8`, `#71717a` bleibt, `#a1a1aa` bleibt
- Button border-radius bleibt bei 8px
- Footer-Link-Farbe: `#F97316`

Keine strukturellen Aenderungen an der Logik, nur das HTML/CSS der E-Mail-Templates.

