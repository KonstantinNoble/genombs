

# Plan: Privacy Policy korrigieren - Business Context ist KEIN Premium-Feature

## Problem

Die Privacy Policy (v5.8) beschreibt den "Business Context" fälschlicherweise als reines Premium-Feature. In Wirklichkeit:

- **Für ALLE Nutzer:** Die 6 Dropdown-Felder (Industry, Stage, Team Size, Revenue, Target Market, Geographic Focus)
- **NUR für Premium:** Website URL-Eingabe und Website-Scanning via Firecrawl

## Änderungen

### 1. Abschnitt 5.9 Überschrift korrigieren

**Zeile 854 - Alt:**
```
5.9 Business Context (Premium)
```

**Neu:**
```
5.9 Business Context
```

### 2. Abschnitt 5.9 Einleitung korrigieren

**Zeilen 855-858 - Alt:**
```
Premium subscribers can create a business context profile that is automatically 
included in all AI analyses to provide personalized and more relevant 
recommendations tailored to their specific business situation.
```

**Neu:**
```
All registered users can create a business context profile that is automatically 
included in all AI analyses to provide personalized and more relevant 
recommendations tailored to their specific business situation. Premium 
subscribers have access to additional website scanning features.
```

### 3. Datenfelder-Tabelle ergänzen

Nach der bestehenden Tabelle einen Hinweis einfügen:

```
**Note:** All fields except Website URL and Website Summary are available to 
all registered users. Website URL input and automatic website scanning via 
Firecrawl is a Premium-exclusive feature.
```

### 4. Website-Scanning Abschnitt klarer kennzeichnen

Vor dem "Website Scanning (Firecrawl)" Abschnitt hinzufügen:

```
#### Website Scanning (Premium Feature)
```

### 5. Speicherdauer-Tabelle korrigieren

**Zeile 1458 - Alt:**
```
Business Context (Premium)
```

**Neu:**
```
Business Context
```

### 6. Versionsverlauf aktualisieren

Neue Version 5.9 hinzufügen:
```
Version 5.9 (February 1, 2026): Corrected Business Context section - 
basic profile fields are available to all users, only website scanning 
is Premium-exclusive.
```

## Zusammenfassung der Dateiänderungen

| Datei | Zeilen | Änderung |
|-------|--------|----------|
| `src/pages/PrivacyPolicy.tsx` | 854 | "(Premium)" aus Überschrift entfernen |
| `src/pages/PrivacyPolicy.tsx` | 855-858 | "Premium subscribers" → "All registered users" + Premium-Hinweis |
| `src/pages/PrivacyPolicy.tsx` | ~920 | Hinweis zu Free vs. Premium Zugang hinzufügen |
| `src/pages/PrivacyPolicy.tsx` | ~925 | "Website Scanning" → "Website Scanning (Premium Feature)" |
| `src/pages/PrivacyPolicy.tsx` | 1458 | "(Premium)" aus Speichertabelle entfernen |
| `src/pages/PrivacyPolicy.tsx` | Versionshistorie | Version 5.9 hinzufügen |

