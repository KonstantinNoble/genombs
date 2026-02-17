
# GitHub-Only Analyse ohne Website-Analyse ermoeglichen

## Aktuelles Problem
- Die GitHub-Analyse (`handleGithubDeepAnalysis`) verlangt ein bereits existierendes, abgeschlossenes Website-Profil (Zeile 284 in Chat.tsx: `profiles.find(p => p.is_own_website && p.status === "completed")`)
- Das Dashboard (`AnalysisTabsContent`) gibt `null` zurueck wenn kein `ownSite` existiert (Zeile 54)
- Im Chat wird ein GitHub-Link nur erkannt, wenn bereits ein Website-Profil vorhanden ist (Zeile 361)

## Loesung

### 1. GitHub-Only Profil erstellen (Chat.tsx)
Wenn ein User einen GitHub-Link sendet aber KEIN Website-Profil hat:
- Automatisch ein minimales `website_profile` erstellen (URL = GitHub-Repo-URL, `is_own_website = true`, `status = "completed"`)
- Dieses Profil dient als Container fuer die `code_analysis` Daten
- Danach die normale `addGithubAnalysis` Edge Function aufrufen

### 2. Dashboard anpassen (AnalysisTabs.tsx)
- Nicht mehr `null` zurueckgeben wenn kein `profile_data` existiert
- Wenn ein Profil nur `code_analysis` hat (kein `profile_data`): Nur die "Code Quality" Sektion anzeigen
- Die Website-Sektionen (Overview, Positioning, Offers, Trust) werden uebersprungen

### 3. GitHub-Link im Chat immer erkennen (Chat.tsx)
- Den Check `profiles.some(p => p.is_own_website && p.status === "completed")` aus `handleSend` entfernen
- Stattdessen: GitHub-Link erkennen und `handleGithubDeepAnalysis` aufrufen, egal ob ein Profil existiert

### 4. InlineUrlPrompt anpassen
- Einen separaten "GitHub Only" Button hinzufuegen, der nur den GitHub-Link benoetigt (kein Website-URL, keine Competitors)
- Oder: Die Validierung lockern, sodass entweder Website+Competitor ODER nur GitHub-URL ausreicht

### 5. SectionNavBar anpassen
- Wenn nur Code-Analyse vorhanden: Nur "Code Quality" Tab anzeigen

---

## Technische Aenderungen

### `src/pages/Chat.tsx`
- **`handleGithubDeepAnalysis`**: Wenn kein `ownProfile` existiert, ein neues `website_profile` per Supabase-Insert erstellen:
  ```
  { url: githubUrl, user_id, conversation_id, is_own_website: true, status: "completed", github_repo_url: githubUrl }
  ```
  Dann mit der neuen `profileId` die Edge Function aufrufen
- **`handleSend`**: GitHub-URL-Erkennung ohne Bedingung auf existierende Profile
- **Dashboard-Bereich**: `SectionNavBar` soll auch bei GitHub-Only angezeigt werden

### `src/components/dashboard/AnalysisTabs.tsx`
- Die fruehe `return null` Pruefung aendern:
  - Wenn `ownSite` existiert aber kein `profile_data`: Nur Code Quality rendern
  - Die Website-Sektionen (Overview, Positioning, Offers, Trust) nur rendern wenn `profile_data` vorhanden

### `src/components/dashboard/SectionNavBar.tsx`
- Neues Prop `hasWebsiteAnalysis?: boolean` (default `true`)
- Wenn `hasWebsiteAnalysis === false`: Nur "Code Quality" im Nav anzeigen
- Wenn `hasWebsiteAnalysis === true`: Alle Sektionen anzeigen (wie bisher)

### `src/components/chat/InlineUrlPrompt.tsx`
- Neuen "GitHub Only" Modus:
  - Wenn nur das GitHub-Feld ausgefuellt ist (keine Website-URL): "Start Code Analysis" Button aktiv
  - Callback ruft `onGithubAnalysis` auf statt `onStartAnalysis`
- Neues Prop: `onGithubOnlyAnalysis?: (githubUrl: string, model: string) => void`

### `src/components/chat/ChatInput.tsx`
- `hasOwnProfile` Prop wird nicht mehr fuer den GitHub-Button benoetigt (immer sichtbar fuer Premium)

### Zusammenfassung der Dateien
1. `src/pages/Chat.tsx` - Profil-Erstellung bei GitHub-Only + GitHub-Erkennung ohne Profile
2. `src/components/dashboard/AnalysisTabs.tsx` - Bedingte Sektionen (nur Code Quality wenn kein profile_data)
3. `src/components/dashboard/SectionNavBar.tsx` - Dynamische Navigation basierend auf verfuegbaren Daten
4. `src/components/chat/InlineUrlPrompt.tsx` - GitHub-Only Analyse-Modus
5. `src/components/chat/ChatInput.tsx` - GitHub-Button immer fuer Premium sichtbar
