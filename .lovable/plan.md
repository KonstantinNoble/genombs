

# Schriftgewicht universell reduzieren

## Ziel
Alle verbleibenden `font-bold` und `font-extrabold` Klassen auf den oeffentlichen Seiten und in gemeinsam genutzten Komponenten reduzieren, um ein konsistent duenneres Schriftbild zu erreichen.

## Aenderungen nach Datei

### Oeffentliche Seiten (Marketing / Legal / Auth)

**src/pages/Contact.tsx**
- H1 "Contact Us": `font-bold` zu `font-semibold`

**src/pages/Imprint.tsx**
- H1 "Imprint": `font-bold` zu `font-semibold`

**src/pages/PrivacyPolicy.tsx**
- H1 "Privacy Policy": `font-bold` zu `font-semibold`

**src/pages/TermsOfService.tsx**
- H1 "Terms of Service": `font-bold` zu `font-semibold`
- "IMPORTANT DISCLAIMER", "IMPORTANT for Premium", "Important: Right of Withdrawal": `font-bold` zu `font-semibold`

**src/pages/Auth.tsx**
- CardTitle "Create Account / Welcome Back": `font-bold` zu `font-semibold`
- DialogTitle "Check your Email": `font-bold` zu `font-semibold`

**src/pages/ResetPassword.tsx**
- CardTitle: `font-bold` zu `font-semibold`
- Countdown-Zahl: `font-bold` zu `font-semibold`

**src/pages/UpdatePassword.tsx**
- CardTitle: `font-bold` zu `font-semibold`

**src/pages/Profile.tsx**
- H1 "Profile Settings": `font-bold` zu `font-semibold`

### Gemeinsame Komponenten

**src/components/Footer.tsx**
- Logo "Synvertas": `font-bold` zu `font-medium`

**src/components/MobileBlocker.tsx**
- H1 "Desktop Only": `font-bold` zu `font-semibold`

**src/components/genome/FAQSection.tsx**
- H2 Titel: `font-extrabold` zu `font-semibold`

**src/components/genome/WinLossChart.tsx**
- Alle 4 Stat-Zahlen (Win Rate, Total Deals, Won, Lost): `font-extrabold` zu `font-bold`

**src/components/genome/StatCard.tsx**
- Wert-Anzeige: `font-bold` zu `font-semibold`

**src/components/genome/PerformanceChart.tsx**
- Score-Anzeige: `font-bold` zu `font-semibold`

### Homepage verbleibende Stellen (src/pages/Home.tsx)

- Stats-Zahlen (5 AI Models, 7 Categories, <60s, Incl.): `font-bold` zu `font-semibold`
- Feature-Nummern (01, 02, 03): `font-bold` zu `font-semibold`

### Workspace-Komponenten (dezente Reduktion)

**src/components/dashboard/AnalysisTabs.tsx**
- Profil-Namen (h4): `font-bold` zu `font-semibold`

**src/components/dashboard/PageSpeedCard.tsx**
- Site-Name (h4): `font-bold` zu `font-semibold`

**src/components/dashboard/ComparisonTable.tsx**
- Score-Wert: `font-bold` zu `font-semibold`

**src/components/chat/WebsiteProfileCard.tsx**
- Profil-Name (h3): `font-bold` zu `font-semibold`
- Bar-Wert: `font-bold` zu `font-semibold`

## Technischer Ueberblick

```text
Regel:
  font-extrabold -> font-semibold (Ueberschriften) oder font-bold (Zahlen)
  font-bold      -> font-semibold (Ueberschriften) oder font-medium (Logo/Labels)

Betroffene Dateien: 16 Dateien
Art: Nur Tailwind-Klassen-Austausch, keine Logik-Aenderungen
```

## Was sich NICHT aendert
- Score-Ring-Zahlen (kleine inline-Scores) bleiben `font-bold` -- dort ist die Lesbarkeit wichtiger
- Farben, Layout, Animationen bleiben identisch
- Keine Funktionsaenderungen

